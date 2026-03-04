import { Command } from 'commander';
import { createWallet, getWalletAddress, signMessage } from '../wallet/wallet.js';

export function walletCommand(): Command {
  const cmd = new Command('wallet').description('Manage Base L2 wallet');

  cmd.command('create')
    .description('Generate a new wallet (Base L2)')
    .action(() => {
      const info = createWallet(process.cwd());
      console.log('Wallet created');
      console.log(`  Address: ${info.address}`);
      console.log(`  Created: ${info.createdAt}`);
      console.log('');
      console.log('Your private key is encrypted in .agentvault/wallet.json');
      console.log('Back up your vault passphrase — it protects your wallet.');
    });

  cmd.command('show')
    .description('Show wallet address')
    .action(() => {
      const address = getWalletAddress(process.cwd());
      console.log(address);
    });

  cmd.command('sign <message>')
    .description('Sign a message with your wallet')
    .action(async (message: string) => {
      const sig = await signMessage(process.cwd(), message);
      console.log(sig);
    });

  return cmd;
}
