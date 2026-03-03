import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

describe('CLI integration', () => {
  let tmpDir: string;
  const originalEnv = process.env.AGENTVAULT_PASSPHRASE;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'av-cli-test-'));
    process.env.AGENTVAULT_PASSPHRASE = 'cli-test-passphrase';
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    if (originalEnv !== undefined) {
      process.env.AGENTVAULT_PASSPHRASE = originalEnv;
    } else {
      delete process.env.AGENTVAULT_PASSPHRASE;
    }
  });

  function runCli(args: string[]): string {
    const tsxPath = path.resolve('node_modules/.bin/tsx');
    const cliPath = path.resolve('src/index.ts');
    return execFileSync(tsxPath, [cliPath, ...args], {
      cwd: tmpDir,
      env: { ...process.env, AGENTVAULT_PASSPHRASE: 'cli-test-passphrase' },
      encoding: 'utf-8',
      timeout: 30000,
    });
  }

  it('should init and show status', () => {
    const initOut = runCli(['init', '--skip-passphrase']);
    expect(initOut).toContain('initialized');

    const statusOut = runCli(['status']);
    expect(statusOut).toContain('Profiles');
  });

  it('should add, list, get, and remove secrets', () => {
    runCli(['init', '--skip-passphrase']);

    runCli(['secret', 'add', 'MY_KEY', 'my-value']);
    const listOut = runCli(['secret', 'list']);
    expect(listOut).toContain('MY_KEY');

    const getOut = runCli(['secret', 'get', 'MY_KEY']);
    expect(getOut.trim()).toBe('my-value');

    runCli(['secret', 'remove', 'MY_KEY']);
    const listOut2 = runCli(['secret', 'list']);
    expect(listOut2).toContain('No secrets');
  });

  it('should manage profiles', () => {
    runCli(['init', '--skip-passphrase']);

    const listOut = runCli(['profile', 'list']);
    expect(listOut).toContain('restrictive');
    expect(listOut).toContain('moderate');
    expect(listOut).toContain('permissive');

    const showOut = runCli(['profile', 'show', 'moderate']);
    expect(showOut).toContain('Trust Level');
  });

  it('should run doctor', () => {
    runCli(['init', '--skip-passphrase']);
    const out = runCli(['doctor']);
    expect(out).toContain('Health Check');
    expect(out).toContain('[OK]');
  });
});
