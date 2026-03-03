import type { Session } from '../types/index.js';
/** Create a new agent session */
export declare function createSession(projectDir: string, agentId: string, profileName: string, pid: number): Session;
/** Get all active sessions */
export declare function getActiveSessions(projectDir: string): Session[];
/** Revoke a specific session by ID */
export declare function revokeSession(projectDir: string, sessionId: string): boolean;
/** Revoke all active sessions */
export declare function revokeAll(projectDir: string): number;
//# sourceMappingURL=sessions.d.ts.map