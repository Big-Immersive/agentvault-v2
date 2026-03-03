interface McpServerOptions {
    transport: 'stdio' | 'sse';
    port: number;
    projectDir: string;
}
export declare function startMcpServer(options: McpServerOptions): Promise<void>;
export {};
//# sourceMappingURL=server.d.ts.map