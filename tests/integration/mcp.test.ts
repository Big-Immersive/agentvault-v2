import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { addSecret } from '../../src/vault/vault.js';
import { storeMemory } from '../../src/memory/memory.js';
import { getSecret, listSecretKeys } from '../../src/vault/vault.js';
import { queryMemories, listMemories } from '../../src/memory/memory.js';
import { queryAudit } from '../../src/audit/audit.js';

describe('MCP tool handlers (unit-style)', () => {
  let tmpDir: string;
  const originalEnv = process.env.AGENTVAULT_PASSPHRASE;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'av-mcp-test-'));
    fs.mkdirSync(path.join(tmpDir, '.agentvault'), { recursive: true });
    process.env.AGENTVAULT_PASSPHRASE = 'mcp-test-passphrase';
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    if (originalEnv !== undefined) {
      process.env.AGENTVAULT_PASSPHRASE = originalEnv;
    } else {
      delete process.env.AGENTVAULT_PASSPHRASE;
    }
  });

  it('should get a secret through vault API', () => {
    addSecret(tmpDir, 'MCP_KEY', 'mcp-value');
    const value = getSecret(tmpDir, 'MCP_KEY');
    expect(value).toBe('mcp-value');
  });

  it('should list secrets through vault API', () => {
    addSecret(tmpDir, 'KEY_A', 'a');
    addSecret(tmpDir, 'KEY_B', 'b');
    const keys = listSecretKeys(tmpDir);
    expect(keys).toContain('KEY_A');
    expect(keys).toContain('KEY_B');
  });

  it('should store and query memory through API', async () => {
    await storeMemory(tmpDir, {
      key: 'mcp-mem',
      content: 'MCP server memory test content data',
      memoryType: 'fact',
    });

    const response = await queryMemories(tmpDir, 'server memory test');
    expect(response.results.length).toBeGreaterThan(0);
  });

  it('should list memories through API', async () => {
    await storeMemory(tmpDir, {
      key: 'mcp-mem-list',
      content: 'Content for listing test purposes',
      memoryType: 'context',
      tags: ['mcp'],
    });

    const entries = await listMemories(tmpDir);
    expect(entries).toHaveLength(1);
    expect(entries[0].key).toBe('mcp-mem-list');
  });

  it('should show empty audit by default', () => {
    const entries = queryAudit(tmpDir, { limit: 10 });
    expect(entries).toHaveLength(0);
  });
});
