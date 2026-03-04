import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import fs from 'node:fs';
import path from 'node:path';
import { resolvePaths } from '../config/paths.js';
import { getWalletAddress, loadWallet, verifySignature } from '../wallet/wallet.js';
import { loadBankEntries, loadBankDescriptor, listPurchasedBanks } from '../license/license.js';
import { encrypt } from '../vault/encryption.js';
import type { BankDescriptor, LicenseDescriptor } from '../types/index.js';

export interface GatewayOptions {
  projectDir: string;
  port: number;
  rpcUrl: string;
}

/** List all published banks (packaged-banks directory) */
function listPublishedBanks(projectDir: string): BankDescriptor[] {
  const banksDir = path.join(resolvePaths(projectDir).base, 'packaged-banks');
  if (!fs.existsSync(banksDir)) return [];

  return fs.readdirSync(banksDir)
    .filter(d => {
      const descPath = path.join(banksDir, d, 'descriptor.json');
      return fs.existsSync(descPath);
    })
    .map(d => {
      const desc = JSON.parse(fs.readFileSync(path.join(banksDir, d, 'descriptor.json'), 'utf-8'));
      return desc as BankDescriptor;
    });
}

/** Load a specific published bank's encrypted data */
function loadPublishedBank(projectDir: string, bankName: string): Buffer {
  const bankPath = path.join(resolvePaths(projectDir).base, 'packaged-banks', bankName, 'bank.encrypted');
  if (!fs.existsSync(bankPath)) {
    throw new Error(`Bank not found: ${bankName}`);
  }
  return fs.readFileSync(bankPath);
}

export async function startGateway(options: GatewayOptions): Promise<void> {
  const { projectDir, port } = options;
  const app = new Hono();

  // Health endpoint
  app.get('/health', (c) => {
    let walletAddress = 'not configured';
    try { walletAddress = getWalletAddress(projectDir); } catch { /* */ }

    const banks = listPublishedBanks(projectDir);

    return c.json({
      status: 'ok',
      version: '2.0.0',
      uptime: Math.floor(process.uptime()),
      wallet: { address: walletAddress },
      banks: {
        published: banks.length,
        names: banks.map(b => b.name),
      },
    });
  });

  // List published banks (discovery)
  app.get('/banks', (c) => {
    const banks = listPublishedBanks(projectDir);
    return c.json({
      banks: banks.map(b => ({
        name: b.name,
        description: b.description,
        entryCount: b.entryCount,
        contentHash: b.contentHash,
        tags: b.tags,
        accessModel: b.accessModel,
        previewEntries: b.previewEntries,
        createdAt: b.createdAt,
      })),
    });
  });

  // Get bank details
  app.get('/banks/:name', (c) => {
    const bankName = c.req.param('name');
    const banks = listPublishedBanks(projectDir);
    const bank = banks.find(b => b.name === bankName);
    if (!bank) return c.json({ error: 'Bank not found' }, 404);
    return c.json(bank);
  });

  // Checkout — buyer signs a message to prove identity, we issue a license
  // In v2.0, payment verification happens off-chain (x402 / USDC transfer check)
  app.post('/banks/:name/checkout', async (c) => {
    const bankName = c.req.param('name');
    const body = await c.req.json<{
      buyerAddress: string;
      signature: string;
      passphrase: string;  // buyer's passphrase to re-encrypt the bank
    }>();

    // Verify the signature proves ownership of buyerAddress
    const message = `checkout:${bankName}:${Date.now().toString().slice(0, -3)}`; // ~1 second precision
    try {
      const recovered = verifySignature(message, body.signature);
      if (recovered.toLowerCase() !== body.buyerAddress.toLowerCase()) {
        return c.json({ error: 'Signature does not match buyer address' }, 401);
      }
    } catch {
      return c.json({ error: 'Invalid signature' }, 401);
    }

    // Load bank descriptor
    const banks = listPublishedBanks(projectDir);
    const bank = banks.find(b => b.name === bankName);
    if (!bank) return c.json({ error: 'Bank not found' }, 404);

    // TODO: Verify x402 USDC payment on Base
    // For now, this is a placeholder for the payment verification step

    // Re-encrypt bank data with buyer's passphrase
    const bankData = loadPublishedBank(projectDir, bankName);
    const reEncrypted = encrypt(bankData.toString('utf-8'), body.passphrase);

    // Generate license
    const now = new Date();
    const license: LicenseDescriptor = {
      name: bankName,
      accessType: bank.accessModel,
      issuedAt: now.toISOString(),
      buyerWallet: body.buyerAddress,
      sellerWallet: getWalletAddress(projectDir),
    };

    // Set limits based on access model
    if (bank.accessModel === 'access_limited' || bank.accessModel === 'time_and_access') {
      license.maxAccesses = 100; // Default, should come from bank config
      license.remainingAccesses = 100;
    }
    if (bank.accessModel === 'time_locked' || bank.accessModel === 'time_and_access') {
      license.expiresAt = new Date(now.getTime() + 30 * 86400000).toISOString(); // 30 days default
    }

    return c.json({
      success: true,
      license,
      bank: reEncrypted,
      contentHash: bank.contentHash,
    });
  });

  // Discover — search published banks by query
  app.get('/discover', (c) => {
    const query = c.req.query('q') || '';
    const banks = listPublishedBanks(projectDir);

    if (!query) return c.json({ results: banks });

    const queryLower = query.toLowerCase();
    const results = banks.filter(b =>
      b.name.toLowerCase().includes(queryLower) ||
      b.description.toLowerCase().includes(queryLower) ||
      b.tags.some(t => t.toLowerCase().includes(queryLower))
    );

    return c.json({ results });
  });

  // Start server
  console.log(`AgentVault Gateway starting on port ${port}`);
  console.log(`  Wallet: ${getWalletAddress(projectDir)}`);
  console.log(`  Banks: ${listPublishedBanks(projectDir).length} published`);
  console.log(`  Health: http://localhost:${port}/health`);

  serve({ fetch: app.fetch, port });

  // Signal handling
  const cleanup = () => {
    console.log('Gateway shutting down...');
    process.exit(0);
  };
  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);
}
