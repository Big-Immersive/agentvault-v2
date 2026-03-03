import type { AuditEntry } from '../types/index.js';
/** Log a credential access event */
export declare function logAccess(projectDir: string, entry: Omit<AuditEntry, 'id'>): void;
/** Query audit entries with optional filters */
export declare function queryAudit(projectDir: string, opts?: {
    sessionId?: string;
    agentId?: string;
    limit?: number;
}): AuditEntry[];
/** Export all audit entries */
export declare function exportAudit(projectDir: string): AuditEntry[];
/** Clear all audit entries */
export declare function clearAudit(projectDir: string): void;
//# sourceMappingURL=audit.d.ts.map