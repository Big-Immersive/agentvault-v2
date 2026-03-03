import type { EncryptedEnvelope } from '../types/index.js';
/** Resolve passphrase: env var > .passphrase file > throw */
export declare function getPassphrase(projectDir?: string): string;
/** Encrypt plaintext JSON string to an EncryptedEnvelope */
export declare function encrypt(plaintext: string, passphrase: string): EncryptedEnvelope;
/** Decrypt an EncryptedEnvelope back to plaintext string */
export declare function decrypt(envelope: EncryptedEnvelope, passphrase: string): string;
/** Read an encrypted JSON file, returning parsed data or fallback */
export declare function readEncryptedFile<T>(filePath: string, passphrase: string, fallback: T): T;
/** Write data as encrypted JSON to file */
export declare function writeEncryptedFile(filePath: string, data: unknown, passphrase: string): void;
//# sourceMappingURL=encryption.d.ts.map