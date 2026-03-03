/** In-process async mutex for serializing read-modify-write operations */
export declare class AsyncMutex {
    private queue;
    private locked;
    /** Acquire the mutex. Returns a release function. */
    acquire(): Promise<() => void>;
    private release;
    /** Run a function under the mutex */
    runExclusive<T>(fn: () => T | Promise<T>): Promise<T>;
}
/** Shared mutex instances — one per file type */
export declare const vaultMutex: AsyncMutex;
export declare const memoryMutex: AsyncMutex;
//# sourceMappingURL=mutex.d.ts.map