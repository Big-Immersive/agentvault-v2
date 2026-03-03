import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { addSecret, getSecret, removeSecret, listSecretKeys, renameSecret, loadVault } from '../../src/vault/vault.js';

describe('vault', () => {
  let tmpDir: string;
  const originalEnv = process.env.AGENTVAULT_PASSPHRASE;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'av-vault-test-'));
    fs.mkdirSync(path.join(tmpDir, '.agentvault'), { recursive: true });
    process.env.AGENTVAULT_PASSPHRASE = 'test-vault-passphrase';
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    if (originalEnv !== undefined) {
      process.env.AGENTVAULT_PASSPHRASE = originalEnv;
    } else {
      delete process.env.AGENTVAULT_PASSPHRASE;
    }
  });

  it('should add and retrieve a secret', () => {
    addSecret(tmpDir, 'API_KEY', 'sk-12345');
    const value = getSecret(tmpDir, 'API_KEY');
    expect(value).toBe('sk-12345');
  });

  it('should update an existing secret', () => {
    addSecret(tmpDir, 'API_KEY', 'old-value');
    addSecret(tmpDir, 'API_KEY', 'new-value');
    expect(getSecret(tmpDir, 'API_KEY')).toBe('new-value');
  });

  it('should return undefined for missing key', () => {
    expect(getSecret(tmpDir, 'NONEXISTENT')).toBeUndefined();
  });

  it('should remove a secret', () => {
    addSecret(tmpDir, 'API_KEY', 'value');
    expect(removeSecret(tmpDir, 'API_KEY')).toBe(true);
    expect(getSecret(tmpDir, 'API_KEY')).toBeUndefined();
  });

  it('should return false when removing nonexistent key', () => {
    expect(removeSecret(tmpDir, 'NONEXISTENT')).toBe(false);
  });

  it('should list secret keys', () => {
    addSecret(tmpDir, 'KEY_A', 'a');
    addSecret(tmpDir, 'KEY_B', 'b');
    addSecret(tmpDir, 'KEY_C', 'c');
    const keys = listSecretKeys(tmpDir);
    expect(keys).toEqual(['KEY_A', 'KEY_B', 'KEY_C']);
  });

  it('should rename a secret', () => {
    addSecret(tmpDir, 'OLD_KEY', 'value');
    expect(renameSecret(tmpDir, 'OLD_KEY', 'NEW_KEY')).toBe(true);
    expect(getSecret(tmpDir, 'OLD_KEY')).toBeUndefined();
    expect(getSecret(tmpDir, 'NEW_KEY')).toBe('value');
  });

  it('should load empty vault when no file exists', () => {
    const entries = loadVault(tmpDir);
    expect(entries).toEqual([]);
  });

  it('should persist across load/save cycles', () => {
    addSecret(tmpDir, 'PERSIST', 'value');
    // New loadVault call should see it
    const entries = loadVault(tmpDir);
    expect(entries).toHaveLength(1);
    expect(entries[0].key).toBe('PERSIST');
    expect(entries[0].value).toBe('value');
  });
});
