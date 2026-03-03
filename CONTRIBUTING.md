# Contributing

Thanks for wanting to contribute to AgentVault.

## Development

```bash
git clone https://github.com/jawaddxb/agentvault-v2.git
cd agentvault-v2
npm install
npm run build
npm test
```

## Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
```

Tests are in `tests/` using Vitest. Unit tests for core modules, integration tests for CLI and MCP.

## Code style

- TypeScript strict mode
- ES modules (`"type": "module"`)
- Imports use `.js` extensions (Node ESM resolution)
- No default exports

## Submitting changes

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Make your changes
4. Run `npm test` and ensure all tests pass
5. Commit with a descriptive message
6. Open a PR

## Security

If you find a security vulnerability, please email jawad@ala.xyz instead of opening a public issue.
