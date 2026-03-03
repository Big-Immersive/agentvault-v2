import { Command } from 'commander';
export function mcpCommand() {
    const cmd = new Command('mcp').description('MCP server operations');
    cmd.command('start')
        .description('Start the MCP server')
        .option('--transport <type>', 'Transport type: stdio or sse', 'stdio')
        .option('--port <port>', 'SSE port (only for sse transport)', '3100')
        .action(async (opts) => {
        // Dynamic import to avoid loading MCP SDK at CLI startup
        const { startMcpServer } = await import('../mcp/server.js');
        await startMcpServer({
            transport: opts.transport,
            port: parseInt(opts.port),
            projectDir: process.cwd(),
        });
    });
    return cmd;
}
//# sourceMappingURL=mcp.js.map