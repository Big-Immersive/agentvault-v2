import { spawn } from 'node:child_process';
import { createSession, revokeSession } from '../sessions/sessions.js';
import { buildSandboxEnv } from './buildEnv.js';
/** Run a command inside a sandboxed environment with credential interception */
export async function runSandboxed(opts) {
    const session = createSession(opts.projectDir, opts.agentId, opts.profile.name, process.pid);
    const env = buildSandboxEnv(opts, session.id);
    return new Promise((resolve) => {
        const parts = opts.command.split(' ');
        const child = spawn(parts[0], parts.slice(1), {
            env,
            stdio: 'inherit',
            shell: true,
        });
        child.on('close', (code) => {
            revokeSession(opts.projectDir, session.id);
            resolve(code ?? 1);
        });
        child.on('error', (err) => {
            console.error(`Failed to start: ${err.message}`);
            revokeSession(opts.projectDir, session.id);
            resolve(1);
        });
    });
}
//# sourceMappingURL=runSandboxed.js.map