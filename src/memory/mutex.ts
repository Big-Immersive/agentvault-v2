/** In-process async mutex for serializing read-modify-write operations */
export class AsyncMutex {
  private queue: Array<() => void> = [];
  private locked = false;

  /** Acquire the mutex. Returns a release function. */
  async acquire(): Promise<() => void> {
    if (!this.locked) {
      this.locked = true;
      return () => this.release();
    }

    return new Promise<() => void>((resolve) => {
      this.queue.push(() => {
        resolve(() => this.release());
      });
    });
  }

  private release(): void {
    const next = this.queue.shift();
    if (next) {
      next();
    } else {
      this.locked = false;
    }
  }

  /** Run a function under the mutex */
  async runExclusive<T>(fn: () => T | Promise<T>): Promise<T> {
    const release = await this.acquire();
    try {
      return await fn();
    } finally {
      release();
    }
  }
}

/** Shared mutex instances — one per file type */
export const vaultMutex = new AsyncMutex();
export const memoryMutex = new AsyncMutex();
