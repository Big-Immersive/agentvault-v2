# Agent Credential Sandboxing Standard (ACSS)

ACSS is an open standard for controlling how AI agents access credentials and environment variables. It defines a profile-based permission model, a three-state access decision system, an encrypted vault format, an immutable audit trail, and a session management lifecycle.

## Quick Links

- [Full Specification (v1.0)](acss-v1.0.md)
- [JSON Schemas](schema/v1.0/)
- [Example Profiles](examples/)
- [Reference Implementation (AgentVault)](https://github.com/agentvault/agentvault)

## Why ACSS?

AI agents run with full access to your credentials. There's no standard way to:

- **Scope** which secrets an agent can see
- **Audit** every credential access decision
- **Revoke** agent access in real-time
- **Redact** sensitive values while preserving variable names

ACSS solves this with a simple, framework-agnostic protocol that any tool can implement.

## Core Concepts

| Concept | Description |
|---|---|
| **Profile** | YAML file with ordered permission rules |
| **Rule** | Pattern + access level (allow / deny / redact) |
| **Last-match-wins** | Later rules override earlier ones |
| **Audit trail** | Every decision logged before enforcement |
| **Session** | Bounded execution with revocation support |

## Conformance Levels

- **Level 1 (Core):** Profiles, access decisions, sandbox filtering, audit trail
- **Level 2 (Full):** Core + encrypted vault, sessions, revocation, TTL enforcement

## Schema

Machine-readable JSON Schemas:

- [`profile.schema.json`](schema/v1.0/profile.schema.json)
- [`audit-entry.schema.json`](schema/v1.0/audit-entry.schema.json)
- [`vault-entry.schema.json`](schema/v1.0/vault-entry.schema.json)
- [`session.schema.json`](schema/v1.0/session.schema.json)

## License

This specification is released under the [MIT License](../LICENSE).

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for how to propose changes to the standard.
