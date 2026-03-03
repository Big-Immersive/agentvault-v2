import { describe, it, expect } from 'vitest';
import { AsyncMutex } from '../../src/memory/mutex.js';

describe('AsyncMutex', () => {
  it('should serialize access', async () => {
    const mutex = new AsyncMutex();
    const log: string[] = [];

    const task = async (name: string) => {
      const release = await mutex.acquire();
      log.push(`${name}:start`);
      await new Promise(r => setTimeout(r, 10));
      log.push(`${name}:end`);
      release();
    };

    await Promise.all([task('A'), task('B'), task('C')]);

    // Each task should fully complete before the next starts
    expect(log).toEqual([
      'A:start', 'A:end',
      'B:start', 'B:end',
      'C:start', 'C:end',
    ]);
  });

  it('should work with runExclusive', async () => {
    const mutex = new AsyncMutex();
    let counter = 0;

    const increment = () => mutex.runExclusive(async () => {
      const val = counter;
      await new Promise(r => setTimeout(r, 5));
      counter = val + 1;
    });

    await Promise.all([increment(), increment(), increment()]);
    expect(counter).toBe(3);
  });

  it('should release on error', async () => {
    const mutex = new AsyncMutex();

    await expect(
      mutex.runExclusive(() => { throw new Error('test error'); })
    ).rejects.toThrow('test error');

    // Mutex should be free for the next task
    const result = await mutex.runExclusive(() => 'ok');
    expect(result).toBe('ok');
  });
});
