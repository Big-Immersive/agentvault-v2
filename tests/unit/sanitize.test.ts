import { describe, it, expect } from 'vitest';
import {
  sanitizeContent,
  sanitizeMemoryEntry,
  sanitizeMemoryEntries,
  hasRedactionLabels,
} from '../../src/memory/sanitize.js';
import type { MemoryEntry } from '../../src/types/index.js';

/** Helper to create a minimal MemoryEntry for testing */
function makeEntry(overrides: Partial<MemoryEntry> & { content: string }): MemoryEntry {
  return {
    key: 'test-key',
    vaultType: 'memory',
    memoryType: 'knowledge',
    tags: [],
    keywords: [],
    confidence: 0.8,
    accessCount: 0,
    addedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('sanitizeContent', () => {
  it('should redact API key patterns', () => {
    const result = sanitizeContent('my api_key=sk-live-abc123xyz');
    expect(result.sanitized).toBe('my [REDACTED:api_key]');
    expect(result.redactions).toEqual([{ type: 'api_key', count: 1 }]);
  });

  it('should redact bearer tokens', () => {
    const result = sanitizeContent('Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.payload.sig');
    expect(result.sanitized).toBe('[REDACTED:api_key]');
    expect(result.redactions.some(r => r.type === 'bearer_token' || r.type === 'api_key')).toBe(true);
  });

  it('should redact token=value patterns', () => {
    const result = sanitizeContent('Use token=abc123def456 for auth');
    expect(result.sanitized).toBe('Use [REDACTED:api_key] for auth');
  });

  it('should redact secret key patterns', () => {
    const result = sanitizeContent('Set secret: my-super-secret-key-789');
    expect(result.sanitized).toBe('Set [REDACTED:api_key]');
  });

  it('should redact email addresses', () => {
    const result = sanitizeContent('Contact user@example.com for details');
    expect(result.sanitized).toBe('Contact [REDACTED:email] for details');
    expect(result.redactions).toEqual([{ type: 'email', count: 1 }]);
  });

  it('should redact credit card numbers', () => {
    const result = sanitizeContent('Card: 4111-1111-1111-1111');
    expect(result.sanitized).toBe('Card: [REDACTED:credit_card]');
    expect(result.redactions).toEqual([{ type: 'credit_card', count: 1 }]);
  });

  it('should redact credit card numbers without dashes', () => {
    const result = sanitizeContent('Card: 4111111111111111');
    expect(result.sanitized).toBe('Card: [REDACTED:credit_card]');
  });

  it('should redact SSH keys', () => {
    const result = sanitizeContent('Key: ssh-rsa AAAAB3NzaC1yc2EAAAABIwA user@host');
    expect(result.sanitized).toContain('[REDACTED:ssh_key]');
    expect(result.redactions[0].type).toBe('ssh_key');
  });

  it('should redact URL credentials', () => {
    const result = sanitizeContent('DB: https://admin:p4ssw0rd@db.example.com/mydb');
    expect(result.sanitized).toBe('DB: [REDACTED:url_credentials]');
    expect(result.redactions[0].type).toBe('url_credentials');
  });

  it('should redact password fields', () => {
    const result = sanitizeContent('password=hunter2 in config');
    expect(result.sanitized).toBe('[REDACTED:password] in config');
    expect(result.redactions).toEqual([{ type: 'password', count: 1 }]);
  });

  it('should redact passwd and pwd variants', () => {
    const r1 = sanitizeContent('passwd: secretpass');
    expect(r1.sanitized).toBe('[REDACTED:password]');

    const r2 = sanitizeContent('pwd=mypassword123');
    expect(r2.sanitized).toBe('[REDACTED:password]');
  });

  it('should handle multiple patterns in one string', () => {
    const result = sanitizeContent(
      'api_key=sk-123 and email is admin@corp.com with card 4111-1111-1111-1111'
    );
    expect(result.sanitized).toBe(
      '[REDACTED:api_key] and email is [REDACTED:email] with card [REDACTED:credit_card]'
    );
    expect(result.redactions.length).toBe(3);
  });

  it('should preserve non-sensitive content', () => {
    const text = 'Follow the testing pyramid: many unit tests, fewer integration tests.';
    const result = sanitizeContent(text);
    expect(result.sanitized).toBe(text);
    expect(result.redactions).toEqual([]);
  });

  it('should handle empty string', () => {
    const result = sanitizeContent('');
    expect(result.sanitized).toBe('');
    expect(result.redactions).toEqual([]);
  });

  it('should preserve CJK content', () => {
    const text = '这是一个测试内容，不包含敏感信息';
    const result = sanitizeContent(text);
    expect(result.sanitized).toBe(text);
    expect(result.redactions).toEqual([]);
  });

  it('should preserve Arabic content', () => {
    const text = 'هذا اختبار للمحتوى العربي';
    const result = sanitizeContent(text);
    expect(result.sanitized).toBe(text);
    expect(result.redactions).toEqual([]);
  });
});

describe('sanitizeMemoryEntry', () => {
  it('should sanitize content and re-extract keywords', () => {
    const entry = makeEntry({
      content: 'Use api_key=sk-live-123 for webhook integration',
      keywords: ['api_key', 'webhook', 'integration'],
    });
    const result = sanitizeMemoryEntry(entry);
    expect(result.entry.content).toBe('Use [REDACTED:api_key] for webhook integration');
    expect(result.redactions.length).toBe(1);
    // Keywords should be re-extracted from sanitized content
    expect(result.entry.keywords).toContain('webhook');
    expect(result.entry.keywords).toContain('integration');
  });

  it('should sanitize source field', () => {
    const entry = makeEntry({
      content: 'Clean content here',
      source: 'https://user:secret@internal.corp.com/api',
    });
    const result = sanitizeMemoryEntry(entry);
    expect(result.entry.source).toBe('[REDACTED:url_credentials]');
    expect(result.entry.content).toBe('Clean content here');
  });

  it('should return original entry when no sensitive data found', () => {
    const entry = makeEntry({ content: 'Safe content about testing' });
    const result = sanitizeMemoryEntry(entry);
    expect(result.entry).toBe(entry); // Same reference — not copied
    expect(result.redactions).toEqual([]);
  });

  it('should preserve tags in re-extracted keywords', () => {
    const entry = makeEntry({
      content: 'password=secret123 in the config file',
      tags: ['configuration', 'setup'],
      keywords: ['password', 'config', 'file'],
    });
    const result = sanitizeMemoryEntry(entry);
    expect(result.entry.keywords).toContain('configuration');
    expect(result.entry.keywords).toContain('setup');
  });
});

describe('sanitizeMemoryEntries', () => {
  it('should sanitize multiple entries and return summary', () => {
    const entries = [
      makeEntry({ key: 'e1', content: 'api_key=abc123' }),
      makeEntry({ key: 'e2', content: 'Safe content about architecture' }),
      makeEntry({ key: 'e3', content: 'email: test@example.com' }),
    ];
    const { entries: sanitized, summary } = sanitizeMemoryEntries(entries);
    expect(sanitized.length).toBe(3);
    expect(summary.totalEntries).toBe(3);
    expect(summary.entriesRedacted).toBe(2);
    expect(summary.redactions.length).toBe(2); // api_key + email
  });

  it('should handle empty array', () => {
    const { entries, summary } = sanitizeMemoryEntries([]);
    expect(entries).toEqual([]);
    expect(summary.totalEntries).toBe(0);
    expect(summary.entriesRedacted).toBe(0);
  });
});

describe('hasRedactionLabels', () => {
  it('should detect redaction labels', () => {
    expect(hasRedactionLabels('This has [REDACTED:api_key] in it')).toBe(true);
    expect(hasRedactionLabels('[REDACTED:email]')).toBe(true);
    expect(hasRedactionLabels('[REDACTED:credit_card] and [REDACTED:password]')).toBe(true);
  });

  it('should return false for clean text', () => {
    expect(hasRedactionLabels('No sensitive data here')).toBe(false);
    expect(hasRedactionLabels('REDACTED without brackets')).toBe(false);
    expect(hasRedactionLabels('[REDACTED] without type')).toBe(false);
  });
});
