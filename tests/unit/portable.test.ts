import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { exportPortable, importPortable } from '../../src/portable/portable.js';
import { addSecret } from '../../src/vault/vault.js';
import { storeMemory } from '../../src/memory/memory.js';

describe('portable', () => {
  let tmpDir: string;
  const originalEnv = process.env.AGENTVAULT_PASSPHRASE;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'av-portable-test-'));
    fs.mkdirSync(path.join(tmpDir, '.agentvault'), { recursive: true });
    process.env.AGENTVAULT_PASSPHRASE = 'test-portable-passphrase';
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    if (originalEnv !== undefined) {
      process.env.AGENTVAULT_PASSPHRASE = originalEnv;
    } else {
      delete process.env.AGENTVAULT_PASSPHRASE;
    }
  });

  it('should export and import vault entries', () => {
    addSecret(tmpDir, 'API_KEY', 'sk-123');
    addSecret(tmpDir, 'DB_URL', 'postgres://localhost');

    const outputPath = path.join(tmpDir, 'export.avault');
    const exportPass = 'export-passphrase-12345';

    exportPortable(tmpDir, outputPath, exportPass);
    expect(fs.existsSync(outputPath)).toBe(true);

    const imported = importPortable(outputPath, exportPass);
    expect(imported.schema).toBe('agentvault-portable/1.0');
    expect(imported.entries).toHaveLength(2);
    expect(imported.entries[0].key).toBe('API_KEY');
    expect(imported.entries[0].value).toBe('sk-123');
    expect(imported.exportedAt).toBeTruthy();
  });

  it('should export with memories', async () => {
    addSecret(tmpDir, 'KEY', 'value');
    await storeMemory(tmpDir, {
      key: 'mem-1',
      content: 'Some memory content for testing',
      memoryType: 'fact',
    });

    const outputPath = path.join(tmpDir, 'with-mem.avault');
    exportPortable(tmpDir, outputPath, 'pass-12345678');

    const imported = importPortable(outputPath, 'pass-12345678');
    expect(imported.entries).toHaveLength(1);
    expect(imported.memories).toHaveLength(1);
    expect(imported.memories[0].key).toBe('mem-1');
  });

  it('should fail import with wrong passphrase', () => {
    addSecret(tmpDir, 'KEY', 'value');
    const outputPath = path.join(tmpDir, 'wrong-pass.avault');
    exportPortable(tmpDir, outputPath, 'correct-passphrase');
    expect(() => importPortable(outputPath, 'wrong-passphrase-here')).toThrow();
  });

  it('should use independent passphrase from vault', () => {
    addSecret(tmpDir, 'KEY', 'value');
    const outputPath = path.join(tmpDir, 'independent.avault');
    // Export with a different passphrase than the vault passphrase
    exportPortable(tmpDir, outputPath, 'completely-different-pass');
    const imported = importPortable(outputPath, 'completely-different-pass');
    expect(imported.entries[0].value).toBe('value');
  });
});
