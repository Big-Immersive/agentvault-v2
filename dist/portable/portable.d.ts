import type { PortableVault } from '../types/index.js';
/** Export vault and memories to a portable .avault file */
export declare function exportPortable(projectDir: string, outputPath: string, exportPassphrase: string, opts?: {
    includeMemories?: boolean;
}): void;
/** Import from a portable .avault file */
export declare function importPortable(inputPath: string, importPassphrase: string): PortableVault;
//# sourceMappingURL=portable.d.ts.map