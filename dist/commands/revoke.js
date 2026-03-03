import { Command } from 'commander';
import { revokeAll, revokeSession, getActiveSessions } from '../sessions/sessions.js';
export function revokeCommand() {
    return new Command('revoke')
        .description('Revoke agent sessions (kill switch)')
        .option('-s, --session <id>', 'Revoke specific session')
        .option('--dry-run', 'Preview without revoking')
        .action((opts) => {
        const dir = process.cwd();
        if (opts.dryRun) {
            const sessions = getActiveSessions(dir);
            if (opts.session) {
                const found = sessions.find(s => s.id === opts.session);
                console.log(found
                    ? `[DRY RUN] Would revoke session ${opts.session}`
                    : `Session not found: ${opts.session}`);
            }
            else {
                console.log(`[DRY RUN] Would revoke ${sessions.length} active session(s)`);
            }
            return;
        }
        if (opts.session) {
            const ok = revokeSession(dir, opts.session);
            console.log(ok ? `Session ${opts.session} revoked` : `Session not found: ${opts.session}`);
        }
        else {
            const count = revokeAll(dir);
            console.log(count > 0 ? `Revoked ${count} active session(s)` : 'No active sessions to revoke.');
        }
    });
}
//# sourceMappingURL=revoke.js.map