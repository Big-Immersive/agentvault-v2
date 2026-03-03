#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { secretCommand } from './commands/secret.js';
import { profileCommand } from './commands/profile.js';
import { auditCommand } from './commands/audit.js';
import { revokeCommand } from './commands/revoke.js';
import { statusCommand } from './commands/status.js';
import { previewCommand } from './commands/preview.js';
import { doctorCommand } from './commands/doctor.js';
import { diffCommand } from './commands/diff.js';
import { wrapCommand } from './commands/wrap.js';
import { memoryCommand } from './commands/memory.js';
import { memoryPackageCommand } from './commands/memoryPackage.js';
import { vaultCommand } from './commands/vault.js';
import { mcpCommand } from './commands/mcp.js';
const program = new Command();
program
    .name('agentvault')
    .description('Encrypted agent credential and memory vault with MCP server')
    .version('1.0.0');
program.addCommand(initCommand());
program.addCommand(secretCommand());
program.addCommand(profileCommand());
program.addCommand(auditCommand());
program.addCommand(revokeCommand());
program.addCommand(statusCommand());
program.addCommand(previewCommand());
program.addCommand(doctorCommand());
program.addCommand(diffCommand());
program.addCommand(wrapCommand());
// Memory commands
const memory = memoryCommand();
memory.addCommand(memoryPackageCommand());
program.addCommand(memory);
program.addCommand(vaultCommand());
program.addCommand(mcpCommand());
program.parse();
//# sourceMappingURL=index.js.map