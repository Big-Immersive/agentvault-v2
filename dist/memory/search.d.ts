import type { MemoryEntry } from '../types/index.js';
/** Extract keywords from content: lowercase, split, filter, dedupe, max 20 */
export declare function extractKeywords(content: string): string[];
/** Compute SHA-256 hash of a query for cache lookup */
export declare function computeQueryHash(query: string): string;
export interface SearchResult {
    entry: MemoryEntry;
    score: number;
}
export interface SearchResponse {
    results: SearchResult[];
    totalSearched: number;
}
/** Search memories with keyword ranking */
export declare function searchMemories(entries: MemoryEntry[], query: string, limit?: number): SearchResponse;
//# sourceMappingURL=search.d.ts.map