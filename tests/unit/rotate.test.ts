import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { addSecret, getSecret, loadVault, saveVault } from '../../src/vault/vault.js';
import { loadMemories, saveMemories, storeMemory } from '../../src/memory/memory.js';
import { _clearPassphraseCache } from '../../src/vault/encryption.js';

describe('rotate', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'av-rotate-test-'));
    fs.mkdirSync(path.join(tmpDir, '.agentvault'), { recursive: true });
    process.env.AGENTVAULT_PASSPHRASE = 'old-passphrase-123';
    _clearPassphraseCache();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    delete process.env.AGENTVAULT_PASSPHRASE;
    _clearPassphraseCache();
  });

  it('should re-encrypt vault with new passphrase', () => {
    // Store with old passphrase
    addSecret(tmpDir, 'MY_KEY', 'my-value');
    expect(getSecret(tmpDir, 'MY_KEY')).toBe('my-value');

    // Load entries before switching passphrase
    const entries = loadVault(tmpDir);

    // Switch to new passphrase
    const ppFile = path.join(tmpDir, '.agentvault', '.passphrase');
    fs.writeFileSync(ppFile, 'new-passphrase-456', { mode: 0o600 });
    delete process.env.AGENTVAULT_PASSPHRASE;
    _clearPassphraseCache();

    // Re-encrypt with new passphrase
    saveVault(tmpDir, entries);

    // Verify new passphrase works
    const loaded = loadVault(tmpDir);
    expect(loaded).toHaveLength(1);
    expect(loaded[0].key).toBe('MY_KEY');
    expect(loaded[0].value).toBe('my-value');

    // Verify old passphrase fails
    process.env.AGENTVAULT_PASSPHRASE = 'old-passphrase-123';
    _clearPassphraseCache();
    expect(() => loadVault(tmpDir)).toThrow();
  });

  it('should re-encrypt memories with new passphrase', async () => {
    // Store a memory with old passphrase
    await storeMemory(tmpDir, {
      key: 'test-mem',
      content: 'Always use HTTPS',
      memoryType: 'knowledge',
      tags: ['security'],
      confidence: 0.9,
    });

    const mems = loadMemories(tmpDir);
    expect(mems).toHaveLength(1);

    // Switch to new passphrase and re-encrypt
    const ppFile = path.join(tmpDir, '.agentvault', '.passphrase');
    fs.writeFileSync(ppFile, 'new-passphrase-456', { mode: 0o600 });
    delete process.env.AGENTVAULT_PASSPHRASE;
    _clearPassphraseCache();

    saveMemories(tmpDir, mems);

    // Verify new passphrase works
    const loaded = loadMemories(tmpDir);
    expect(loaded).toHaveLength(1);
    expect(loaded[0].key).toBe('test-mem');
    expect(loaded[0].content).toBe('Always use HTTPS');

    // Verify old passphrase fails
    process.env.AGENTVAULT_PASSPHRASE = 'old-passphrase-123';
    _clearPassphraseCache();
    expect(() => loadMemories(tmpDir)).toThrow();
  });
});
