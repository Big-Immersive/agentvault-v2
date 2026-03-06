import { Command } from 'commander';
import { queryAudit } from '../audit/audit.js';

export function watchCommand(): Command {
  return new Command('watch')
    .description('Live monitor — watch audit log entries in real-time')
    .option('-i, --interval <ms>', 'Poll interval in milliseconds', '1000')
    .action((opts) => {
      const dir = process.cwd();
      const interval = parseInt(opts.interval);
      let lastId = 0;

      // Get current max ID so we only show new entries
      try {
        const existing = queryAudit(dir, { limit: 1 });
        if (existing.length > 0 && existing[0].id) {
          lastId = existing[0].id;
        }
      } catch { /* audit DB may not exist yet */ }

      console.log('Watching audit log... (Ctrl+C to stop)\n');
      console.log(`${'TIME'.padEnd(24)} ${'SESSION'.padEnd(10)} ${'AGENT'.padEnd(16)} ${'VAR'.padEnd(28)} ACTION`);
      console.log('\u2500'.repeat(90));

      const timer = setInterval(() => {
        try {
          const entries = queryAudit(dir, { limit: 100 });
          const newEntries = entries
            .filter(e => e.id && e.id > lastId)
            .reverse(); // oldest first

          for (const e of newEntries) {
            const time = e.timestamp.replace('T', ' ').slice(0, 23);
            const color = e.action === 'allow' ? '\x1b[32m' : e.action === 'redact' ? '\x1b[33m' : '\x1b[31m';
            console.log(
              `${time} ${e.sessionId.slice(0, 8).padEnd(10)} ${e.agentId.padEnd(16)} ${e.varName.padEnd(28)} ${color}${e.action}\x1b[0m`
            );
            if (e.id && e.id > lastId) lastId = e.id;
          }
        } catch {
          // DB may not exist yet
        }
      }, interval);

      process.on('SIGINT', () => {
        clearInterval(timer);
        console.log('\n\nStopped watching.\n');
        process.exit(0);
      });
    });
}
