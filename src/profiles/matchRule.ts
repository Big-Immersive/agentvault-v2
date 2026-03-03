/** Match an env var name against a glob-like pattern (supports trailing *) */
export function matchRule(varName: string, pattern: string): boolean {
  if (pattern === '*') return true;
  if (pattern.endsWith('*')) {
    return varName.startsWith(pattern.slice(0, -1));
  }
  return varName === pattern;
}
