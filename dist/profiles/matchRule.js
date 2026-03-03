/** Match an env var name against a glob-like pattern (supports trailing *) */
export function matchRule(varName, pattern) {
    if (pattern === '*')
        return true;
    if (pattern.endsWith('*')) {
        return varName.startsWith(pattern.slice(0, -1));
    }
    return varName === pattern;
}
//# sourceMappingURL=matchRule.js.map