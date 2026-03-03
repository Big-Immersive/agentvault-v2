import fs from 'node:fs';
import path from 'node:path';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { resolvePaths } from '../config/paths.js';
import { getSecret, listSecretKeys } from '../vault/vault.js';
import { storeMemory, queryMemories, listMemories, removeMemory } from '../memory/memory.js';
import { queryAudit } from '../audit/audit.js';
import { listProfiles, loadProfile } from '../profiles/profiles.js';
import { loadVault } from '../vault/vault.js';
import { evaluateEnv } from '../sandbox/evaluateEnv.js';
import { exportPortable } from '../portable/portable.js';
import { MCP_RATE_LIMIT, MCP_DRAIN_TIMEOUT_MS, MCP_TOKEN_ENV } from '../config/defaults.js';
function ok(data) {
    return { success: true, data };
}
function fail(error, code) {
    return { success: false, error, code };
}
/** Rate limiter state */
let budget = {
    pid: process.pid,
    callsThisMinute: 0,
    minuteStart: Date.now(),
    totalCalls: 0,
};
function checkRateLimit() {
    const now = Date.now();
    if (now - budget.minuteStart > 60000) {
        budget.callsThisMinute = 0;
        budget.minuteStart = now;
    }
    if (budget.callsThisMinute >= MCP_RATE_LIMIT) {
        return fail(`Rate limit exceeded: ${MCP_RATE_LIMIT} calls/minute`, 'RATE_LIMITED');
    }
    budget.callsThisMinute++;
    budget.totalCalls++;
    return null;
}
function saveBudget(projectDir) {
    const budgetPath = resolvePaths(projectDir).mcpBudget;
    try {
        fs.mkdirSync(path.dirname(budgetPath), { recursive: true });
        fs.writeFileSync(budgetPath, JSON.stringify(budget, null, 2));
    }
    catch {
        // Best-effort budget persistence
    }
}
const TOOLS = [
    {
        name: 'vault.secret.get',
        description: 'Get a secret value from the vault',
        inputSchema: {
            type: 'object',
            properties: { key: { type: 'string', description: 'Secret key name' } },
            required: ['key'],
        },
    },
    {
        name: 'vault.secret.list',
        description: 'List all secret keys in the vault',
        inputSchema: { type: 'object', properties: {} },
    },
    {
        name: 'vault.memory.store',
        description: 'Store a memory entry',
        inputSchema: {
            type: 'object',
            properties: {
                key: { type: 'string', description: 'Memory key' },
                content: { type: 'string', description: 'Memory content' },
                memoryType: { type: 'string', enum: ['fact', 'preference', 'context', 'cache', 'instruction'] },
                tags: { type: 'array', items: { type: 'string' }, description: 'Tags' },
                confidence: { type: 'number', description: 'Confidence 0-1' },
                source: { type: 'string', description: 'Source identifier' },
                ttlSeconds: { type: 'number', description: 'Time-to-live in seconds' },
            },
            required: ['key', 'content', 'memoryType'],
        },
    },
    {
        name: 'vault.memory.query',
        description: 'Search memories by keyword query',
        inputSchema: {
            type: 'object',
            properties: {
                query: { type: 'string', description: 'Search query' },
                limit: { type: 'number', description: 'Max results' },
            },
            required: ['query'],
        },
    },
    {
        name: 'vault.memory.list',
        description: 'List all memory entries',
        inputSchema: {
            type: 'object',
            properties: {
                tag: { type: 'string' },
                memoryType: { type: 'string' },
            },
        },
    },
    {
        name: 'vault.memory.remove',
        description: 'Remove a memory entry by key',
        inputSchema: {
            type: 'object',
            properties: { key: { type: 'string', description: 'Memory key to remove' } },
            required: ['key'],
        },
    },
    {
        name: 'vault.audit.show',
        description: 'Show recent audit log entries',
        inputSchema: {
            type: 'object',
            properties: {
                sessionId: { type: 'string' },
                agentId: { type: 'string' },
                limit: { type: 'number' },
            },
        },
    },
    {
        name: 'vault.status',
        description: 'Show vault status',
        inputSchema: { type: 'object', properties: {} },
    },
    {
        name: 'vault.profile.show',
        description: 'Show a profile details',
        inputSchema: {
            type: 'object',
            properties: { name: { type: 'string', description: 'Profile name' } },
            required: ['name'],
        },
    },
    {
        name: 'vault.preview',
        description: 'Preview env var access for a profile',
        inputSchema: {
            type: 'object',
            properties: { profile: { type: 'string', description: 'Profile name' } },
            required: ['profile'],
        },
    },
    {
        name: 'vault.export',
        description: 'Export vault to portable format',
        inputSchema: {
            type: 'object',
            properties: {
                outputPath: { type: 'string', description: 'Output file path' },
                passphrase: { type: 'string', description: 'Export passphrase' },
            },
            required: ['outputPath', 'passphrase'],
        },
    },
];
async function handleTool(name, args, projectDir) {
    try {
        switch (name) {
            case 'vault.secret.get': {
                const key = args.key;
                if (!key)
                    return fail('Missing key parameter', 'INVALID_INPUT');
                const value = getSecret(projectDir, key);
                if (value === undefined)
                    return fail(`Secret not found: ${key}`, 'KEY_NOT_FOUND');
                return ok({ key, value });
            }
            case 'vault.secret.list': {
                const keys = listSecretKeys(projectDir);
                return ok({ keys, count: keys.length });
            }
            case 'vault.memory.store': {
                const entry = await storeMemory(projectDir, {
                    key: args.key,
                    content: args.content,
                    memoryType: args.memoryType,
                    tags: args.tags,
                    confidence: args.confidence,
                    source: args.source,
                    ttlSeconds: args.ttlSeconds,
                });
                return ok({ key: entry.key, keywords: entry.keywords.length });
            }
            case 'vault.memory.query': {
                const query = args.query;
                if (!query)
                    return fail('Missing query parameter', 'INVALID_INPUT');
                const response = await queryMemories(projectDir, query, args.limit || 10);
                return ok({
                    results: response.results.map(r => ({
                        key: r.entry.key,
                        score: r.score,
                        memoryType: r.entry.memoryType,
                        content: r.entry.content,
                        tags: r.entry.tags,
                    })),
                    totalSearched: response.totalSearched,
                });
            }
            case 'vault.memory.list': {
                const entries = await listMemories(projectDir, {
                    tag: args.tag,
                    memoryType: args.memoryType,
                });
                return ok(entries);
            }
            case 'vault.memory.remove': {
                const key = args.key;
                if (!key)
                    return fail('Missing key parameter', 'INVALID_INPUT');
                const removed = await removeMemory(projectDir, key);
                if (!removed)
                    return fail(`Memory not found: ${key}`, 'KEY_NOT_FOUND');
                return ok({ removed: true });
            }
            case 'vault.audit.show': {
                const entries = queryAudit(projectDir, {
                    sessionId: args.sessionId,
                    agentId: args.agentId,
                    limit: args.limit || 50,
                });
                return ok(entries);
            }
            case 'vault.status': {
                const profiles = listProfiles(projectDir);
                let secretCount = 0;
                try {
                    secretCount = listSecretKeys(projectDir).length;
                }
                catch { /* */ }
                return ok({ profiles, secretCount });
            }
            case 'vault.profile.show': {
                const pName = args.name;
                if (!pName)
                    return fail('Missing name parameter', 'INVALID_INPUT');
                const profile = loadProfile(projectDir, pName);
                return ok(profile);
            }
            case 'vault.preview': {
                const profileName = args.profile;
                if (!profileName)
                    return fail('Missing profile parameter', 'INVALID_INPUT');
                const profile = loadProfile(projectDir, profileName);
                const allVars = { ...process.env };
                try {
                    for (const entry of loadVault(projectDir)) {
                        allVars[entry.key] = entry.value;
                    }
                }
                catch { /* */ }
                const decisions = evaluateEnv(allVars, profile);
                return ok(decisions);
            }
            case 'vault.export': {
                const outputPath = args.outputPath;
                const passphrase = args.passphrase;
                if (!outputPath || !passphrase)
                    return fail('Missing outputPath or passphrase', 'INVALID_INPUT');
                exportPortable(projectDir, outputPath, passphrase);
                return ok({ exported: true, path: outputPath });
            }
            default:
                return fail(`Unknown tool: ${name}`, 'INVALID_INPUT');
        }
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes('passphrase') || msg.includes('decryption') || msg.includes('Decryption')) {
            return fail(msg, 'DECRYPTION_FAILED');
        }
        if (msg.includes('full') || msg.includes('Full')) {
            return fail(msg, 'VAULT_FULL');
        }
        return fail(msg, 'INTERNAL_ERROR');
    }
}
export async function startMcpServer(options) {
    const { projectDir } = options;
    const server = new Server({ name: 'agentvault', version: '1.0.0' }, { capabilities: { tools: {}, resources: {} } });
    // List tools
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: TOOLS,
    }));
    // Call tool
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const rateLimitErr = checkRateLimit();
        if (rateLimitErr) {
            return {
                content: [{ type: 'text', text: JSON.stringify(rateLimitErr) }],
                isError: true,
            };
        }
        const result = await handleTool(request.params.name, (request.params.arguments ?? {}), projectDir);
        return {
            content: [{ type: 'text', text: JSON.stringify(result) }],
            isError: !result.success,
        };
    });
    // System prompt resource
    server.setRequestHandler(ListResourcesRequestSchema, async () => ({
        resources: [{
                uri: 'agentvault://system-prompt',
                name: 'AgentVault System Prompt',
                description: 'Auto-learn instruction for connected agents',
                mimeType: 'text/plain',
            }],
    }));
    server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
        if (request.params.uri === 'agentvault://system-prompt') {
            return {
                contents: [{
                        uri: 'agentvault://system-prompt',
                        mimeType: 'text/plain',
                        text: [
                            'You have access to AgentVault — an encrypted credential and memory vault.',
                            'Use vault.memory.store to save important facts, preferences, and context.',
                            'Use vault.memory.query to retrieve relevant memories before answering questions.',
                            'Use vault.secret.get to access credentials when needed for API calls.',
                            'All access is audited. Be specific with memory keys and tags for better retrieval.',
                        ].join('\n'),
                    }],
            };
        }
        throw new Error(`Unknown resource: ${request.params.uri}`);
    });
    // Signal handling
    const cleanup = () => {
        saveBudget(projectDir);
        setTimeout(() => process.exit(0), MCP_DRAIN_TIMEOUT_MS);
    };
    process.on('SIGTERM', cleanup);
    process.on('SIGINT', cleanup);
    if (options.transport === 'stdio') {
        const transport = new StdioServerTransport();
        await server.connect(transport);
        console.error('AgentVault MCP server running on stdio');
    }
    else {
        // SSE transport
        const { SSEServerTransport } = await import('@modelcontextprotocol/sdk/server/sse.js');
        const http = await import('node:http');
        const expectedToken = process.env[MCP_TOKEN_ENV];
        const httpServer = http.createServer(async (req, res) => {
            // Auth check for SSE
            if (expectedToken) {
                const authHeader = req.headers.authorization;
                if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(fail('Unauthorized', 'UNAUTHORIZED')));
                    return;
                }
            }
            if (req.url === '/sse') {
                const transport = new SSEServerTransport('/messages', res);
                await server.connect(transport);
            }
            else if (req.url === '/messages' && req.method === 'POST') {
                // Handle messages - the SSE transport should handle this
                // but we need to pass it through
                let body = '';
                req.on('data', (chunk) => { body += chunk.toString(); });
                req.on('end', () => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ received: true }));
                });
            }
            else {
                res.writeHead(404);
                res.end('Not found');
            }
        });
        httpServer.listen(options.port, () => {
            console.error(`AgentVault MCP server running on SSE port ${options.port}`);
        });
        process.on('SIGTERM', () => httpServer.close());
        process.on('SIGINT', () => httpServer.close());
    }
}
//# sourceMappingURL=server.js.map