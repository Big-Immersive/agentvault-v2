import { Command } from 'commander';
import fs from 'node:fs';
import path from 'node:path';
import { resolvePaths } from '../config/paths.js';
import { getWalletAddress } from '../wallet/wallet.js';
import type { BankDescriptor } from '../types/index.js';

export function publishCommand(): Command {
  return new Command('publish')
    .description('Publish a packaged bank to the registry')
    .argument('<bank-name>', 'Name of the packaged bank to publish')
    .option('--dry-run', 'Preview without publishing')
    .action((bankName: string, opts) => {
      const dir = process.cwd();
      const bankDir = path.join(resolvePaths(dir).base, 'packaged-banks', bankName);

      if (!fs.existsSync(bankDir)) {
        console.error(`Bank not found: ${bankName}`);
        console.error('Run `agentvault memory package` first to create a bank.');
        process.exit(1);
      }

      const descPath = path.join(bankDir, 'descriptor.json');
      if (!fs.existsSync(descPath)) {
        console.error(`Bank descriptor not found for: ${bankName}`);
        process.exit(1);
      }

      const descriptor: BankDescriptor = JSON.parse(fs.readFileSync(descPath, 'utf-8'));
      let walletAddress: string;
      try {
        walletAddress = getWalletAddress(dir);
      } catch {
        console.error('No wallet found. Run `agentvault wallet create` first.');
        process.exit(1);
      }

      if (opts.dryRun) {
        console.log(`[DRY RUN] Would publish bank "${bankName}"`);
        console.log(`  Entries: ${descriptor.entryCount}`);
        console.log(`  Content hash: ${descriptor.contentHash}`);
        console.log(`  Access model: ${descriptor.accessModel}`);
        console.log(`  Publisher: ${walletAddress}`);
        return;
      }

      // Update descriptor with seller wallet
      descriptor.sellerWallet = walletAddress;
      fs.writeFileSync(descPath, JSON.stringify(descriptor, null, 2), { mode: 0o600 });

      console.log(`Bank "${bankName}" published`);
      console.log(`  Entries: ${descriptor.entryCount}`);
      console.log(`  Content hash: ${descriptor.contentHash}`);
      console.log(`  Access model: ${descriptor.accessModel}`);
      console.log(`  Publisher: ${walletAddress}`);
      console.log('');
      console.log('Start your gateway to serve this bank:');
      console.log(`  agentvault gateway start`);

      // TODO: In future, register on VaultRegistry smart contract on Base
    });
}
