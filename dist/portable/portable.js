import fs from 'node:fs';
import { encrypt, decrypt } from '../vault/encryption.js';
import { loadVault } from '../vault/vault.js';
import { loadMemories } from '../memory/memory.js';
/** Export vault and memories to a portable .avault file */
export function exportPortable(projectDir, outputPath, exportPassphrase, opts) {
    const entries = loadVault(projectDir);
    const memories = opts?.includeMemories !== false ? loadMemories(projectDir) : [];
    const portable = {
        schema: 'agentvault-portable/1.0',
        exportedAt: new Date().toISOString(),
        entries,
        memories,
    };
    const plaintext = JSON.stringify(portable);
    const envelope = encrypt(plaintext, exportPassphrase);
    fs.writeFileSync(outputPath, JSON.stringify(envelope, null, 2), { mode: 0o600 });
}
/** Import from a portable .avault file */
export function importPortable(inputPath, importPassphrase) {
    if (!fs.existsSync(inputPath)) {
        throw new Error(`File not found: ${inputPath}`);
    }
    const raw = fs.readFileSync(inputPath, 'utf-8');
    const envelope = JSON.parse(raw);
    const plaintext = decrypt(envelope, importPassphrase);
    const portable = JSON.parse(plaintext);
    if (portable.schema !== 'agentvault-portable/1.0') {
        throw new Error(`Unsupported portable vault schema: ${portable.schema}`);
    }
    return portable;
}
//# sourceMappingURL=portable.js.map