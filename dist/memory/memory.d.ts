import type { MemoryEntry, MemoryType } from '../types/index.js';
import type { SearchResponse } from './search.js';
/** Load all memory entries (decrypted) */
export declare function loadMemories(projectDir: string): MemoryEntry[];
/** Save all memory entries (encrypted) */
export declare function saveMemories(projectDir: string, entries: MemoryEntry[]): void;
/** Store a memory entry with mutex + file locking */
export declare function storeMemory(projectDir: string, opts: {
    key: string;
    content: string;
    memoryType: MemoryType;
    tags?: string[];
    keywords?: string[];
    confidence?: number;
    source?: string;
    ttlSeconds?: number;
    queryHash?: string;
}): Promise<MemoryEntry>;
/** Query memories with keyword search */
export declare function queryMemories(projectDir: string, query: string, limit?: number): Promise<SearchResponse>;
/** List all memory entries (metadata only, no content) */
export declare function listMemories(projectDir: string, opts?: {
    tag?: string;
    memoryType?: MemoryType;
}): Promise<Array<Omit<MemoryEntry, 'content'> & {
    contentLength: number;
}>>;
/** Remove a memory entry by key */
export declare function removeMemory(projectDir: string, key: string): Promise<boolean>;
/** Export all memories (decrypted) */
export declare function exportMemories(projectDir: string): Promise<MemoryEntry[]>;
//# sourceMappingURL=memory.d.ts.map