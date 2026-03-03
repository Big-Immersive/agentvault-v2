import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { resolvePaths } from '../config/paths.js';
function loadSessions(projectDir) {
    const fp = resolvePaths(projectDir).sessions;
    if (!fs.existsSync(fp))
        return [];
    return JSON.parse(fs.readFileSync(fp, 'utf-8'));
}
function saveSessions(projectDir, sessions) {
    const fp = resolvePaths(projectDir).sessions;
    fs.mkdirSync(path.dirname(fp), { recursive: true });
    fs.writeFileSync(fp, JSON.stringify(sessions, null, 2));
}
/** Create a new agent session */
export function createSession(projectDir, agentId, profileName, pid) {
    const sessions = loadSessions(projectDir);
    const session = {
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
export function getActiveSessions(projectDir) {
    return loadSessions(projectDir).filter(s => s.active);
}
/** Revoke a specific session by ID */
export function revokeSession(projectDir, sessionId) {
    const sessions = loadSessions(projectDir);
    const s = sessions.find(s => s.id === sessionId);
    if (!s)
        return false;
    s.active = false;
    try {
        process.kill(s.pid, 'SIGTERM');
    }
    catch { /* already dead */ }
    saveSessions(projectDir, sessions);
    return true;
}
/** Revoke all active sessions */
export function revokeAll(projectDir) {
    const sessions = loadSessions(projectDir);
    let count = 0;
    for (const s of sessions) {
        if (s.active) {
            s.active = false;
            try {
                process.kill(s.pid, 'SIGTERM');
            }
            catch { /* already dead */ }
            count++;
        }
    }
    saveSessions(projectDir, sessions);
    return count;
}
//# sourceMappingURL=sessions.js.map