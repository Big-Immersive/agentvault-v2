/** Input validation for vault and memory operations */

const KEY_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_\-\.]{0,255}$/;
const TAG_PATTERN = /^[a-zA-Z0-9_\-\.]{1,64}$/;
const MAX_SECRET_VALUE_BYTES = 64 * 1024; // 64KB
const MAX_MEMORY_CONTENT_BYTES = 1024 * 1024; // 1MB
const MAX_TAGS_PER_ENTRY = 50;

export function validateKey(key: string, label = 'Key'): void {
  if (!key || typeof key !== 'string') {
    throw new Error(`${label} is required`);
  }
  if (key.includes('\0')) {
    throw new Error(`${label} must not contain null bytes`);
  }
  if (!KEY_PATTERN.test(key)) {
    throw new Error(
      `${label} "${key.slice(0, 32)}" is invalid. Must match: letters/underscore start, alphanumeric/underscore/dash/dot, max 256 chars.`
    );
  }
}

export function validateSecretValue(value: string): void {
  if (typeof value !== 'string') {
    throw new Error('Secret value must be a string');
  }
  if (value.includes('\0')) {
    throw new Error('Secret value must not contain null bytes');
  }
  if (Buffer.byteLength(value, 'utf-8') > MAX_SECRET_VALUE_BYTES) {
    throw new Error(`Secret value exceeds ${MAX_SECRET_VALUE_BYTES} byte limit`);
  }
}

export function validateMemoryContent(content: string): void {
  if (!content || typeof content !== 'string') {
    throw new Error('Memory content is required');
  }
  if (content.includes('\0')) {
    throw new Error('Memory content must not contain null bytes');
  }
  if (Buffer.byteLength(content, 'utf-8') > MAX_MEMORY_CONTENT_BYTES) {
    throw new Error(`Memory content exceeds ${MAX_MEMORY_CONTENT_BYTES} byte limit (1MB)`);
  }
}

export function validateTags(tags: string[]): void {
  if (!Array.isArray(tags)) {
    throw new Error('Tags must be an array');
  }
  if (tags.length > MAX_TAGS_PER_ENTRY) {
    throw new Error(`Too many tags: ${tags.length} exceeds limit of ${MAX_TAGS_PER_ENTRY}`);
  }
  for (const tag of tags) {
    if (!TAG_PATTERN.test(tag)) {
      throw new Error(`Invalid tag "${tag.slice(0, 32)}". Must be alphanumeric/dash/dot, 1-64 chars.`);
    }
  }
}
