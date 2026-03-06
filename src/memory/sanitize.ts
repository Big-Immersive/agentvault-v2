import { extractKeywords } from './search.js';
import type { MemoryEntry } from '../types/index.js';

/** A single redaction pattern definition */
interface SensitivePattern {
  name: string;
  regex: RegExp;
  label: string;
}

/** Result of sanitizing a single string */
export interface SanitizeResult {
  sanitized: string;
  redactions: RedactionInfo[];
}

/** Info about a redaction applied */
export interface RedactionInfo {
  type: string;
  count: number;
}

/** Summary of sanitizing multiple entries */
export interface SanitizeSummary {
  totalEntries: number;
  entriesRedacted: number;
  redactions: RedactionInfo[];
}

/**
 * Ordered list of sensitive data patterns.
 * More specific patterns (SSH keys, URLs with creds) come before broader ones (emails).
 * Each regex uses the global flag for replaceAll behavior.
 */
const SENSITIVE_PATTERNS: SensitivePattern[] = [
  {
    name: 'ssh_key',
    regex: /(-----BEGIN [A-Z ]+-----[\s\S]*?-----END [A-Z ]+-----|ssh-(rsa|ed25519|dss)\s+\S+)/g,
    label: '[REDACTED:ssh_key]',
  },
  {
    name: 'url_credentials',
    regex: /https?:\/\/[^:\s]+:[^@\s]+@\S+/g,
    label: '[REDACTED:url_credentials]',
  },
  {
    name: 'bearer_token',
    regex: /(authorization|bearer)\s*[:=]?\s*bearer\s+\S+/gi,
    label: '[REDACTED:api_key]',
  },
  {
    name: 'api_key',
    regex: /(api[_-]?key|token|secret|x-api-key|authorization)\s*[:=]\s*\S+/gi,
    label: '[REDACTED:api_key]',
  },
  {
    name: 'password',
    regex: /(password|passwd|pwd)\s*[:=]\s*\S+/gi,
    label: '[REDACTED:password]',
  },
  {
    name: 'credit_card',
    regex: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    label: '[REDACTED:credit_card]',
  },
  {
    name: 'email',
    regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    label: '[REDACTED:email]',
  },
];

/** Regex to detect redaction labels in imported data */
const REDACTION_LABEL_REGEX = /\[REDACTED:[a-z_]+\]/g;

/**
 * Sanitize a string by detecting and replacing sensitive patterns.
 * Returns the sanitized string and a list of redactions applied.
 */
export function sanitizeContent(text: string): SanitizeResult {
  if (!text) return { sanitized: text, redactions: [] };

  let result = text;
  const redactions: RedactionInfo[] = [];

  for (const pattern of SENSITIVE_PATTERNS) {
    // Reset regex lastIndex for safety (global flag)
    pattern.regex.lastIndex = 0;
    const matches = result.match(pattern.regex);
    if (matches && matches.length > 0) {
      redactions.push({ type: pattern.name, count: matches.length });
      result = result.replace(pattern.regex, pattern.label);
    }
    // Reset again after replace
    pattern.regex.lastIndex = 0;
  }

  return { sanitized: result, redactions };
}

/**
 * Sanitize a single memory entry.
 * Redacts content and source fields, then re-extracts keywords from sanitized content.
 */
export function sanitizeMemoryEntry(
  entry: MemoryEntry
): { entry: MemoryEntry; redactions: RedactionInfo[] } {
  const contentResult = sanitizeContent(entry.content);
  const sourceResult = entry.source ? sanitizeContent(entry.source) : null;

  const allRedactions = mergeRedactions([
    ...contentResult.redactions,
    ...(sourceResult?.redactions ?? []),
  ]);

  if (allRedactions.length === 0) {
    return { entry, redactions: [] };
  }

  // Re-extract keywords from sanitized content + keep tag keywords
  const sanitizedKeywords = extractKeywords(contentResult.sanitized);
  const tagKeywords = entry.tags.map(t => t.toLowerCase().trim()).filter(t => t.length > 0);
  const keywords = [...new Set([...sanitizedKeywords, ...tagKeywords])];

  return {
    entry: {
      ...entry,
      content: contentResult.sanitized,
      source: sourceResult ? sourceResult.sanitized : entry.source,
      keywords,
    },
    redactions: allRedactions,
  };
}

/**
 * Sanitize an array of memory entries.
 * Returns sanitized entries and a summary of all redactions.
 */
export function sanitizeMemoryEntries(
  entries: MemoryEntry[]
): { entries: MemoryEntry[]; summary: SanitizeSummary } {
  const sanitizedEntries: MemoryEntry[] = [];
  const allRedactions: RedactionInfo[] = [];
  let entriesRedacted = 0;

  for (const entry of entries) {
    const result = sanitizeMemoryEntry(entry);
    sanitizedEntries.push(result.entry);
    if (result.redactions.length > 0) {
      entriesRedacted++;
      allRedactions.push(...result.redactions);
    }
  }

  return {
    entries: sanitizedEntries,
    summary: {
      totalEntries: entries.length,
      entriesRedacted,
      redactions: mergeRedactions(allRedactions),
    },
  };
}

/**
 * Check if text contains redaction labels (useful for import warnings).
 */
export function hasRedactionLabels(text: string): boolean {
  REDACTION_LABEL_REGEX.lastIndex = 0;
  return REDACTION_LABEL_REGEX.test(text);
}

/** Merge redaction counts by type */
function mergeRedactions(redactions: RedactionInfo[]): RedactionInfo[] {
  const map = new Map<string, number>();
  for (const r of redactions) {
    map.set(r.type, (map.get(r.type) ?? 0) + r.count);
  }
  return [...map.entries()].map(([type, count]) => ({ type, count }));
}
