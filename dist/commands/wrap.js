import { Command } from 'commander';
import { loadProfile } from '../profiles/profiles.js';
import { runSandboxed } from '../sandbox/runSandboxed.js';
export function wrapCommand() {
    return new Command('wrap')
        .description('Run a command inside a sandboxed environment')
        .requiredOption('-p, --profile <name>', 'Permission profile to use')
        .option('-a, --agent <id>', 'Agent identifier', 'default-agent')
        .argument('<command...>', 'Command to run')
        .action(async (args, opts) => {
        const dir = process.cwd();
        const profile = loadProfile(dir, opts.profile);
        const command = args.join(' ');
        console.log(`AgentVault wrapping: ${command}`);
        console.log(`   Profile: ${profile.name} (trust: ${profile.trustLevel})`);
        console.log('');
        const code = await runSandboxed({
            projectDir: dir,
            profile,
            command,
            agentId: opts.agent,
        });
        process.exit(code);
    });
}
//# sourceMappingURL=wrap.js.map