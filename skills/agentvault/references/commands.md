# AgentVault Command Reference

Complete reference for all AgentVault CLI commands, flags, and options.

## Global

```
agentvault [command] [options]
```

Version: 0.1.0

---

## init

Initialize AgentVault in the current project. Creates `.agentvault/` directory with default profiles, encrypted vault, and audit database.

```
agentvault init [options]
```

| Flag | Description |
|------|-------------|
| `--skip-passphrase` | Skip passphrase prompt and use default (development only) |

**Default profiles created:**
- `restrictive` — Denies all non-system vars
- `moderate` — Allows common dev vars, denies cloud credentials
- `permissive` — Allows most vars, redacts known secrets

---

## wrap

Run a command inside a sandboxed environment. Filters environment variables based on the selected profile.

```
agentvault wrap -p <profile> [options] "<command>"
```

| Flag | Description | Required |
|------|-------------|----------|
| `-p, --profile <name>` | Permission profile to use | Yes |
| `-a, --agent <id>` | Agent identifier for audit trail | No (default: "default-agent") |

**Arguments:**
- `<command...>` — Command to run (variadic, required)

**Behavior:**
1. Loads the specified profile
2. Evaluates every environment variable against profile rules
3. Builds a filtered environment (allowed vars pass through, denied vars removed, redacted vars show `[REDACTED]`)
4. Logs every access decision to audit trail
5. Spawns child process with filtered environment
6. On exit: revokes the session

---

## preview

Preview what environment variables an agent would see under a given profile. Dry-run with no side effects.

```
agentvault preview -p <profile> [options]
```

| Flag | Description | Required |
|------|-------------|----------|
| `-p, --profile <name>` | Permission profile to use | Yes |
| `--allowed` | Show only allowed variables | No |
| `--redacted` | Show only redacted variables | No |
| `--denied` | Show only denied variables | No |

Default (no filter flags): shows all variables with color-coded access decisions.

---

## status

Show AgentVault status: profile count, secret count, and active sessions with details.

```
agentvault status
```

No options or arguments.

---

## audit

View and manage the credential access audit trail.

### audit show

```
agentvault audit show [options]
```

| Flag | Description | Default |
|------|-------------|---------|
| `-s, --session <id>` | Filter by session ID | All sessions |
| `-a, --agent <id>` | Filter by agent ID | All agents |
| `-n, --limit <n>` | Number of entries to show | 50 |

### audit export

```
agentvault audit export [options]
```

| Flag | Description | Default |
|------|-------------|---------|
| `-o, --output <file>` | Output file path | Required |
| `-f, --format <format>` | Output format: `json` or `csv` | `json` |

### audit clear

```
agentvault audit clear
```

Clears all audit log entries. No options.

---

## profile

Manage permission profiles.

### profile list

```
agentvault profile list
```

Lists all profiles. No options.

### profile show

```
agentvault profile show <name>
```

Displays a profile's rules, trust level, and TTL.

### profile create

```
agentvault profile create <name> [options]
```

| Flag | Description | Default |
|------|-------------|---------|
| `-d, --description <desc>` | Profile description | `""` |
| `-t, --trust <level>` | Trust level 0-100 | `50` |
| `--ttl <seconds>` | Token TTL in seconds | `3600` |
| `-r, --rule <rules...>` | Rules as `"pattern:access"` | None |

**Rule format:** `"pattern:access"` where access is `allow`, `deny`, or `redact`.
**Examples:** `"AWS_*:deny"`, `"NODE_ENV:allow"`, `"*:redact"`

### profile delete

```
agentvault profile delete <name>
```

### profile clone

```
agentvault profile clone <from> <to>
```

Clones an existing profile to a new name.

---

## secret

Manage secrets in the AES-256-GCM encrypted vault. Secrets are encrypted at rest using a passphrase set during `init` (scrypt key derivation). Use this instead of plaintext `.env` files.

### secret list

```
agentvault secret list
```

Lists secret keys (values are hidden).

### secret add

```
agentvault secret add <key> <value>
```

Adds or updates a secret. The value is AES-256-GCM encrypted.

### secret get

```
agentvault secret get <key>
```

Retrieves and decrypts a secret value.

### secret remove

```
agentvault secret remove <key>
```

### secret rename

```
agentvault secret rename <oldKey> <newKey>
```

### secret import

```
agentvault secret import <file>
```

Import secrets from a `.env` file. Each `KEY=VALUE` line becomes a vault entry.

---

## doctor

Health check — verifies vault integrity, profiles, configuration, and .gitignore.

```
agentvault doctor
```

**Checks performed:**
- Initialization status
- `.gitignore` includes `.agentvault/`
- Profile validity
- Vault integrity
- Passphrase configuration
- Audit database status

---

## revoke

Revoke agent sessions (kill switch).

```
agentvault revoke [options]
```

| Flag | Description |
|------|-------------|
| `-s, --session <id>` | Revoke specific session (optional) |

Without `-s`: revokes all active sessions.

---

## watch

Live monitor — watch audit log entries in real-time.

```
agentvault watch [options]
```

| Flag | Description | Default |
|------|-------------|---------|
| `-i, --interval <ms>` | Poll interval in milliseconds | `1000` |

Continuously polls and displays new audit entries with color coding. Ctrl+C to stop.

---

## diff

Compare two profiles — show what each would allow/deny/redact differently.

```
agentvault diff <profileA> <profileB>
```

Displays a side-by-side comparison of access decisions for all current environment variables.

---

## Profile Rule Semantics

- **Last-match-wins**: Rules are evaluated in order; the last matching rule determines access
- **System vars bypass**: `PATH`, `HOME`, `SHELL`, `USER`, `LANG`, `TERM`, `TMPDIR`, `LOGNAME`, `EDITOR`, `VISUAL`, `DISPLAY`, `XDG_*` always pass through
- **Pattern types**:
  - `"*"` — Match all variables
  - `"AWS_*"` — Prefix glob (matches `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, etc.)
  - `"NODE_ENV"` — Exact match
- **Access levels**:
  - `allow` — Variable passes through unchanged
  - `deny` — Variable is removed from the environment
  - `redact` — Variable is set to `[REDACTED]`
