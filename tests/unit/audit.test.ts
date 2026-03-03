import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { logAccess, queryAudit, exportAudit, clearAudit } from '../../src/audit/audit.js';

describe('Audit', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'av-audit-'));
    fs.mkdirSync(path.join(tmpDir, '.agentvault'), { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should log and query access events', () => {
    logAccess(tmpDir, {
      sessionId: 'sess-1',
      agentId: 'claude',
      profileName: 'moderate',
      varName: 'STRIPE_KEY',
      action: 'allow',
      timestamp: new Date().toISOString(),
    });

    const entries = queryAudit(tmpDir, { limit: 10 });
    expect(entries).toHaveLength(1);
    expect(entries[0].varName).toBe('STRIPE_KEY');
    expect(entries[0].action).toBe('allow');
  });

  it('should filter by agentId', () => {
    logAccess(tmpDir, {
      sessionId: 's1', agentId: 'claude', profileName: 'p',
      varName: 'KEY1', action: 'allow', timestamp: new Date().toISOString(),
    });
    logAccess(tmpDir, {
      sessionId: 's2', agentId: 'cursor', profileName: 'p',
      varName: 'KEY2', action: 'deny', timestamp: new Date().toISOString(),
    });

    const claude = queryAudit(tmpDir, { agentId: 'claude' });
    expect(claude).toHaveLength(1);
    expect(claude[0].varName).toBe('KEY1');
  });

  it('should sanitize long inputs', () => {
    const longId = 'A'.repeat(1000);
    logAccess(tmpDir, {
      sessionId: longId, agentId: longId, profileName: 'p',
      varName: 'KEY', action: 'allow', timestamp: new Date().toISOString(),
    });

    const entries = queryAudit(tmpDir, { limit: 1 });
    expect(entries[0].sessionId.length).toBeLessThanOrEqual(256);
    expect(entries[0].agentId.length).toBeLessThanOrEqual(256);
  });

  it('should export all entries', () => {
    for (let i = 0; i < 5; i++) {
      logAccess(tmpDir, {
        sessionId: `s${i}`, agentId: 'a', profileName: 'p',
        varName: `KEY${i}`, action: 'allow', timestamp: new Date().toISOString(),
      });
    }
    expect(exportAudit(tmpDir)).toHaveLength(5);
  });

  it('should clear all entries', () => {
    logAccess(tmpDir, {
      sessionId: 's', agentId: 'a', profileName: 'p',
      varName: 'KEY', action: 'allow', timestamp: new Date().toISOString(),
    });
    clearAudit(tmpDir);
    expect(exportAudit(tmpDir)).toHaveLength(0);
  });
});
