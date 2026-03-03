import { describe, it, expect } from 'vitest';
import { matchRule } from '../../src/profiles/matchRule.js';

describe('matchRule', () => {
  it('should match exact names', () => {
    expect(matchRule('STRIPE_KEY', 'STRIPE_KEY')).toBe(true);
    expect(matchRule('STRIPE_KEY', 'OPENAI_KEY')).toBe(false);
  });

  it('should match wildcard *', () => {
    expect(matchRule('ANYTHING', '*')).toBe(true);
    expect(matchRule('', '*')).toBe(true);
  });

  it('should match prefix wildcards', () => {
    expect(matchRule('AWS_ACCESS_KEY', 'AWS_*')).toBe(true);
    expect(matchRule('AWS_SECRET', 'AWS_*')).toBe(true);
    expect(matchRule('STRIPE_KEY', 'AWS_*')).toBe(false);
  });

  it('should be case-sensitive', () => {
    expect(matchRule('stripe_key', 'STRIPE_KEY')).toBe(false);
    expect(matchRule('AWS_KEY', 'aws_*')).toBe(false);
  });

  it('should handle edge cases', () => {
    expect(matchRule('A', 'A')).toBe(true);
    expect(matchRule('A', 'A*')).toBe(true);
    expect(matchRule('AB', 'A*')).toBe(true);
    expect(matchRule('', '')).toBe(true);
  });
});
