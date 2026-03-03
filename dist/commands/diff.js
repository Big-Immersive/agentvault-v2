import { Command } from 'commander';
import { loadProfile } from '../profiles/profiles.js';
import { loadVault } from '../vault/vault.js';
import { evaluateEnv } from '../sandbox/evaluateEnv.js';
export function diffCommand() {
    return new Command('diff')
        .description('Compare two profiles — show what each would allow/deny/redact differently')
        .argument('<profileA>', 'First profile')
        .argument('<profileB>', 'Second profile')
        .action((nameA, nameB) => {
        const dir = process.cwd();
        const profileA = loadProfile(dir, nameA);
        const profileB = loadProfile(dir, nameB);
        const allVars = { ...process.env };
        try {
            for (const entry of loadVault(dir)) {
                allVars[entry.key] = entry.value;
            }
        }
        catch { /* vault may not exist */ }
        const decisionsA = evaluateEnv(allVars, profileA);
        const decisionsB = evaluateEnv(allVars, profileB);
        const mapA = new Map(decisionsA.map(d => [d.varName, d.access]));
        const mapB = new Map(decisionsB.map(d => [d.varName, d.access]));
        const allKeys = [...new Set([...mapA.keys(), ...mapB.keys()])].sort();
        const diffs = allKeys.filter(k => mapA.get(k) !== mapB.get(k));
        if (!diffs.length) {
            console.log(`\nProfiles "${nameA}" and "${nameB}" produce identical access decisions.\n`);
            return;
        }
        console.log(`\nDiff: "${nameA}" vs "${nameB}" (${diffs.length} difference(s))\n`);
        console.log(`  ${'VARIABLE'.padEnd(32)} ${nameA.padEnd(10)} ${nameB.padEnd(10)}`);
        console.log(`  ${'---'.repeat(11)} ${'---'.repeat(4)} ${'---'.repeat(4)}`);
        for (const key of diffs) {
            const a = mapA.get(key) || '-';
            const b = mapB.get(key) || '-';
            console.log(`  ${key.padEnd(32)} ${a.padEnd(10)} ${b.padEnd(10)}`);
        }
        console.log(`\n${allKeys.length} total vars, ${diffs.length} differ\n`);
    });
}
//# sourceMappingURL=diff.js.map