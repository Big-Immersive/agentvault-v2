import { Command } from 'commander';

export function discoverCommand(): Command {
  return new Command('discover')
    .description('Search for published knowledge banks')
    .argument('<query>', 'Search query')
    .option('--gateway <url>', 'Gateway URL to search', 'http://localhost:3200')
    .action(async (query: string, opts) => {
      try {
        const res = await fetch(`${opts.gateway}/discover?q=${encodeURIComponent(query)}`);
        if (!res.ok) {
          console.error(`Gateway error: ${res.status}`);
          process.exit(1);
        }

        const data = await res.json() as { results: Array<{
          name: string;
          description: string;
          entryCount: number;
          accessModel: string;
          tags: string[];
          previewEntries?: Array<{ key: string; content: string }>;
        }> };

        if (!data.results.length) {
          console.log(`No banks found for "${query}"`);
          return;
        }

        console.log(`\nFound ${data.results.length} bank(s) for "${query}":\n`);
        for (const bank of data.results) {
          console.log(`  ${bank.name} (${bank.accessModel})`);
          if (bank.description) console.log(`    ${bank.description}`);
          console.log(`    ${bank.entryCount} entries | tags: ${bank.tags.join(', ')}`);
          if (bank.previewEntries?.length) {
            console.log('    Preview:');
            for (const pe of bank.previewEntries.slice(0, 2)) {
              console.log(`      - ${pe.key}: ${pe.content.slice(0, 80)}...`);
            }
          }
          console.log('');
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes('ECONNREFUSED')) {
          console.error('Cannot connect to gateway. Is it running?');
          console.error(`  agentvault gateway start`);
        } else {
          console.error(`Error: ${msg}`);
        }
        process.exit(1);
      }
    });
}
