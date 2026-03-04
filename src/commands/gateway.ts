import { Command } from 'commander';

const BASE_SEPOLIA_RPC = 'https://sepolia.base.org';

export function gatewayCommand(): Command {
  const cmd = new Command('gateway').description('Gateway server operations');

  cmd.command('start')
    .description('Start the AgentVault gateway server')
    .option('--port <port>', 'Server port', '3200')
    .option('--rpc <url>', 'Base RPC URL', BASE_SEPOLIA_RPC)
    .action(async (opts) => {
      const { startGateway } = await import('../gateway/server.js');
      await startGateway({
        projectDir: process.cwd(),
        port: parseInt(opts.port),
        rpcUrl: opts.rpc,
      });
    });

  return cmd;
}
