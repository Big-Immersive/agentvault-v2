import type { LicenseDescriptor, BankDescriptor, MemoryEntry } from '../types/index.js';
/** Load license descriptor for a purchased bank */
export declare function loadLicense(projectDir: string, bankName: string): LicenseDescriptor;
/** Load bank descriptor */
export declare function loadBankDescriptor(projectDir: string, bankName: string): BankDescriptor;
/** Load encrypted bank entries */
export declare function loadBankEntries(projectDir: string, bankName: string): MemoryEntry[];
/** Check if a license is currently valid */
export declare function checkLicense(license: LicenseDescriptor): {
    valid: boolean;
    reason?: string;
};
/** Consume one access from the license (for access-limited types) */
export declare function consumeAccess(projectDir: string, bankName: string): void;
/** List all purchased bank names */
export declare function listPurchasedBanks(projectDir: string): string[];
//# sourceMappingURL=license.d.ts.map