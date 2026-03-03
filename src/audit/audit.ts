import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { resolvePaths } from '../config/paths.js';
import type { AuditEntry } from '../types/index.js';

function getDb(projectDir: string): Database.Database {
  const { auditDb: fp } = resolvePaths(projectDir);
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  const db = new Database(fp);
  db.exec(`CREATE TABLE IF NOT EXISTS audit (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sessionId TEXT NOT NULL,
    agentId TEXT NOT NULL,
    profileName TEXT NOT NULL,
    varName TEXT NOT NULL,
    action TEXT NOT NULL,
    timestamp TEXT NOT NULL
  )`);
  return db;
}

/** Log a credential access event */
export function logAccess(projectDir: string, entry: Omit<AuditEntry, 'id'>): void {
  const db = getDb(projectDir);
  try {
    db.prepare(
      'INSERT INTO audit (sessionId, agentId, profileName, varName, action, timestamp) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(entry.sessionId, entry.agentId, entry.profileName, entry.varName, entry.action, entry.timestamp);
  } finally {
    db.close();
  }
}

/** Query audit entries with optional filters */
export function queryAudit(
  projectDir: string,
  opts?: { sessionId?: string; agentId?: string; limit?: number }
): AuditEntry[] {
  const db = getDb(projectDir);
  try {
    let sql = 'SELECT * FROM audit WHERE 1=1';
    const params: unknown[] = [];
    if (opts?.sessionId) { sql += ' AND sessionId = ?'; params.push(opts.sessionId); }
    if (opts?.agentId) { sql += ' AND agentId = ?'; params.push(opts.agentId); }
    sql += ' ORDER BY id DESC';
    if (opts?.limit) { sql += ' LIMIT ?'; params.push(opts.limit); }
    return db.prepare(sql).all(...params) as AuditEntry[];
  } finally {
    db.close();
  }
}

/** Export all audit entries */
export function exportAudit(projectDir: string): AuditEntry[] {
  const db = getDb(projectDir);
  try {
    return db.prepare('SELECT * FROM audit ORDER BY id ASC').all() as AuditEntry[];
  } finally {
    db.close();
  }
}

/** Clear all audit entries */
export function clearAudit(projectDir: string): void {
  const db = getDb(projectDir);
  try {
    db.exec('DELETE FROM audit');
  } finally {
    db.close();
  }
}
