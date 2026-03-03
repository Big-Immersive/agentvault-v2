import type { VaultEntry } from '../types/index.js';
/** Load vault entries (decrypted) */
export declare function loadVault(projectDir: string): VaultEntry[];
/** Save vault entries (encrypted) */
export declare function saveVault(projectDir: string, entries: VaultEntry[]): void;
/** Add or update a secret with file locking */
export declare function addSecret(projectDir: string, key: string, value: string): void;
/** Remove a secret by key */
export declare function removeSecret(projectDir: string, key: string): boolean;
/** Get a single secret value */
export declare function getSecret(projectDir: string, key: string): string | undefined;
/** List all secret keys (values hidden) */
export declare function listSecretKeys(projectDir: string): string[];
/** Rename a secret key */
export declare function renameSecret(projectDir: string, oldKey: string, newKey: string): boolean;
//# sourceMappingURL=vault.d.ts.map