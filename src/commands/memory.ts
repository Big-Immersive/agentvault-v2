import { Command } from 'commander';
import { storeMemory, queryMemories, listMemories, removeMemory, exportMemories } from '../memory/memory.js';
import type { MemoryType } from '../types/index.js';

export function memoryCommand(): Command {
  const cmd = new Command('memory').description('Manage agent memory store');

  cmd.command('store <key> <content>')
    .description('Store a memory entry')
    .option('-t, --type <type>', 'Memory type: fact|preference|context|cache|instruction', 'fact')
    .option('--tags <tags...>', 'Tags for categorization')
    .option('-c, --confidence <n>', 'Confidence score 0-1', '0.8')
    .option('-s, --source <source>', 'Source identifier')
    .option('--ttl <seconds>', 'Time-to-live in seconds')
    .action(async (key: string, content: string, opts) => {
      const entry = await storeMemory(process.cwd(), {
        key,
        content,
        memoryType: opts.type as MemoryType,
        tags: opts.tags,
        confidence: parseFloat(opts.confidence),
        source: opts.source,
        ttlSeconds: opts.ttl ? parseInt(opts.ttl) : undefined,
      });
      console.log(`Memory "${entry.key}" stored (${entry.keywords.length} keywords)`);
    });

  cmd.command('query <query>')
    .description('Search memories by keyword')
    .option('-n, --limit <n>', 'Max results', '10')
    .action(async (query: string, opts) => {
      const response = await queryMemories(process.cwd(), query, parseInt(opts.limit));
      if (!response.results.length) { console.log(`No matching memories found. (${response.totalSearched} entries searched)`); return; }
      for (const r of response.results) {
        console.log(`  [${r.score.toFixed(3)}] ${r.entry.key} (${r.entry.memoryType}) -- ${r.entry.content.slice(0, 80)}`);
      }
      console.log(`\n${response.results.length} result(s) from ${response.totalSearched} entries`);
    });

  cmd.command('list')
    .description('List memory entries')
    .option('--tag <tag>', 'Filter by tag')
    .option('-t, --type <type>', 'Filter by memory type')
    .action(async (opts) => {
      const entries = await listMemories(process.cwd(), {
        tag: opts.tag,
        memoryType: opts.type as MemoryType | undefined,
      });
      if (!entries.length) { console.log('No memories stored.'); return; }
      for (const e of entries) {
        const tags = e.tags.length ? ` [${e.tags.join(', ')}]` : '';
        console.log(`  ${e.key} (${e.memoryType})${tags} -- ${e.contentLength} chars, accessed ${e.accessCount}x`);
      }
      console.log(`\n${entries.length} entries`);
    });

  cmd.command('remove <key>')
    .description('Remove a memory entry')
    .option('--dry-run', 'Preview without removing')
    .action(async (key: string, opts) => {
      if (opts.dryRun) {
        console.log(`[DRY RUN] Would remove memory "${key}"`);
        return;
      }
      const removed = await removeMemory(process.cwd(), key);
      if (removed) console.log(`Memory "${key}" removed`);
      else console.log(`Memory "${key}" not found.`);
    });

  cmd.command('export')
    .description('Export all memories to JSON')
    .option('-o, --output <file>', 'Output file path')
    .action(async (opts) => {
      const entries = await exportMemories(process.cwd());
      if (!entries.length) { console.log('No memories to export.'); return; }
      const content = JSON.stringify(entries, null, 2);
      if (opts.output) {
        const fs = await import('node:fs');
        fs.writeFileSync(opts.output, content);
        console.log(`Exported ${entries.length} memories to ${opts.output}`);
      } else {
        console.log(content);
      }
    });

  return cmd;
}
