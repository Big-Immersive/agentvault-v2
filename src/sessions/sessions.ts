import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { resolvePaths } from '../config/paths.js';
import type { Session } from '../types/index.js';

function loadSessions(projectDir: string): Session[] {
  const fp = resolvePaths(projectDir).sessions;
  if (!fs.existsSync(fp)) return [];
  return JSON.parse(fs.readFileSync(fp, 'utf-8'));
}

function saveSessions(projectDir: string, sessions: Session[]): void {
  const fp = resolvePaths(projectDir).sessions;
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, JSON.stringify(sessions, null, 2));
}

/** Create a new agent session */
export function createSession(
  projectDir: string, agentId: string, profileName: string, pid: number
): Session {
  const sessions = loadSessions(projectDir);
  const session: Session = {
    id: crypto.randomUUID(),
    agentId,
    profileName,
    pid,
    startedAt: new Date().toISOString(),
    active: true,
  };
  sessions.push(session);
  saveSessions(projectDir, sessions);
  return session;
}

/** Get all active sessions */
export function getActiveSessions(projectDir: string): Session[] {
  return loadSessions(projectDir).filter(s => s.active);
}

/** Revoke a specific session by ID */
export function revokeSession(projectDir: string, sessionId: string): boolean {
  const sessions = loadSessions(projectDir);
  const s = sessions.find(s => s.id === sessionId);
  if (!s) return false;
  s.active = false;
  try { process.kill(s.pid, 'SIGTERM'); } catch { /* already dead */ }
  saveSessions(projectDir, sessions);
  return true;
}

/** Revoke all active sessions */
export function revokeAll(projectDir: string): number {
  const sessions = loadSessions(projectDir);
  let count = 0;
  for (const s of sessions) {
    if (s.active) {
      s.active = false;
      try { process.kill(s.pid, 'SIGTERM'); } catch { /* already dead */ }
      count++;
    }
  }
  saveSessions(projectDir, sessions);
  return count;
}
