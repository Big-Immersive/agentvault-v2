/** In-process async mutex for serializing read-modify-write operations */
export class AsyncMutex {
    queue = [];
    locked = false;
    /** Acquire the mutex. Returns a release function. */
    async acquire() {
        if (!this.locked) {
            this.locked = true;
            return () => this.release();
        }
        return new Promise((resolve) => {
            this.queue.push(() => {
                resolve(() => this.release());
            });
        });
    }
    release() {
        const next = this.queue.shift();
        if (next) {
            next();
        }
        else {
            this.locked = false;
        }
    }
    /** Run a function under the mutex */
    async runExclusive(fn) {
        const release = await this.acquire();
        try {
            return await fn();
        }
        finally {
            release();
        }
    }
}
/** Shared mutex instances — one per file type */
export const vaultMutex = new AsyncMutex();
export const memoryMutex = new AsyncMutex();
//# sourceMappingURL=mutex.js.map