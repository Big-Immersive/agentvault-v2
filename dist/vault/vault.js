import fs from 'node:fs';
import lockfile from 'proper-lockfile';
import { resolvePaths } from '../config/paths.js';
import { getPassphrase, readEncryptedFile, writeEncryptedFile } from './encryption.js';
import { VAULT_MAX_ENTRIES, VAULT_MAX_BYTES, VAULT_WARN_PERCENT } from '../config/defaults.js';
function ensureVaultDir(projectDir) {
    const { base } = resolvePaths(projectDir);
    fs.mkdirSync(base, { recursive: true });
}
function checkLimits(entries) {
    const size = Buffer.byteLength(JSON.stringify(entries), 'utf-8');
    if (entries.length >= VAULT_MAX_ENTRIES) {
        throw new Error(`Vault full: ${entries.length}/${VAULT_MAX_ENTRIES} entries`);
    }
    if (size >= VAULT_MAX_BYTES) {
        throw new Error(`Vault full: ${size} bytes exceeds ${VAULT_MAX_BYTES} byte limit`);
    }
    if (entries.length >= VAULT_MAX_ENTRIES * VAULT_WARN_PERCENT) {
        console.warn(`Warning: vault at ${Math.round((entries.length / VAULT_MAX_ENTRIES) * 100)}% capacity`);
    }
    if (size >= VAULT_MAX_BYTES * VAULT_WARN_PERCENT) {
        console.warn(`Warning: vault at ${Math.round((size / VAULT_MAX_BYTES) * 100)}% size capacity`);
    }
}
/** Load vault entries (decrypted) */
export function loadVault(projectDir) {
    const { vault: vaultPath } = resolvePaths(projectDir);
    const passphrase = getPassphrase(projectDir);
    return readEncryptedFile(vaultPath, passphrase, []);
}
/** Save vault entries (encrypted) */
export function saveVault(projectDir, entries) {
    ensureVaultDir(projectDir);
    const { vault: vaultPath } = resolvePaths(projectDir);
    const passphrase = getPassphrase(projectDir);
    writeEncryptedFile(vaultPath, entries, passphrase);
}
/** Add or update a secret with file locking */
export function addSecret(projectDir, key, value) {
    ensureVaultDir(projectDir);
    const { vault: vaultPath, base } = resolvePaths(projectDir);
    const release = lockfile.lockSync(base, { lockfilePath: vaultPath + '.lock' });
    try {
        const entries = loadVault(projectDir);
        const idx = entries.findIndex(e => e.key === key);
        const entry = { key, value, addedAt: new Date().toISOString() };
        if (idx >= 0) {
            entries[idx] = entry;
        }
        else {
            checkLimits(entries);
            entries.push(entry);
        }
        saveVault(projectDir, entries);
    }
    finally {
        release();
    }
}
/** Remove a secret by key */
export function removeSecret(projectDir, key) {
    ensureVaultDir(projectDir);
    const { vault: vaultPath, base } = resolvePaths(projectDir);
    const release = lockfile.lockSync(base, { lockfilePath: vaultPath + '.lock' });
    try {
        const entries = loadVault(projectDir);
        const idx = entries.findIndex(e => e.key === key);
        if (idx < 0)
            return false;
        entries.splice(idx, 1);
        saveVault(projectDir, entries);
        return true;
    }
    finally {
        release();
    }
}
/** Get a single secret value */
export function getSecret(projectDir, key) {
    return loadVault(projectDir).find(e => e.key === key)?.value;
}
/** List all secret keys (values hidden) */
export function listSecretKeys(projectDir) {
    return loadVault(projectDir).map(e => e.key);
}
/** Rename a secret key */
export function renameSecret(projectDir, oldKey, newKey) {
    ensureVaultDir(projectDir);
    const { vault: vaultPath, base } = resolvePaths(projectDir);
    const release = lockfile.lockSync(base, { lockfilePath: vaultPath + '.lock' });
    try {
        const entries = loadVault(projectDir);
        const idx = entries.findIndex(e => e.key === oldKey);
        if (idx < 0)
            return false;
        entries[idx].key = newKey;
        saveVault(projectDir, entries);
        return true;
    }
    finally {
        release();
    }
}
//# sourceMappingURL=vault.js.map