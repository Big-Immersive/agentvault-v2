---
name: agentvault
description: >
  Sandbox AI agent access to secrets and credentials. Initialize vaults, wrap commands
  in sandboxed environments, preview environment variable exposure, view audit logs,
  and check vault status. Use when the user mentions agentvault, credential sandboxing,
  secret management for agents, or wants to control what environment variables an agent can see.
license: MIT
compatibility: Requires Node.js >=18 and the agentvault CLI (npm install -g agentvault)
metadata:
  author: Inflectiv
  version: "0.1.0"
  repository: https://github.com/Big-Immersive/agentvault
allowed-tools: Bash Read
---

# AgentVault

AgentVault intercepts, scopes, audits, and revokes AI agent access to secrets. It stores credentials in an AES-256-GCM encrypted vault (with scrypt key derivation), so secrets never sit in plaintext `.env` files. When a process runs via `agentvault wrap`, it only sees environment variables permitted by the active profile — denied vars are removed, sensitive vars are redacted. Every access decision is logged to an immutable audit trail. All data stays local in `.agentvault/`.

## Prerequisites

Before running any command, check if AgentVault is installed:

```bash
agentvault --version
```

If not installed, install it:

```bash
npm install -g agentvault
```

## Handling arguments

The user's command is in `$ARGUMENTS`. Parse the first word to determine which subcommand to run. If no arguments are provided, show the help output.

**Routing rules:**
- If `$ARGUMENTS` is empty → run `agentvault --help`
- If `$ARGUMENTS` starts with a known command → run `agentvault $ARGUMENTS`
- If unclear → ask the user what they want to do

## Commands

### init — Initialize vault

Sets up `.agentvault/` in the current project with default profiles (restrictive, moderate, permissive) and an encrypted vault.

```bash
agentvault init
agentvault init --skip-passphrase  # Use default passphrase (dev only)
```

After init, remind the user to add `.agentvault/` to their `.gitignore`.

### wrap — Run command in sandbox

The core command. Spawns a child process with filtered environment variables based on a profile.

```bash
agentvault wrap -p moderate "npm start"
agentvault wrap -p restrictive -a claude "python script.py"
```

**Required flag:** `-p, --profile <name>` — which permission profile to use.
**Optional flag:** `-a, --agent <id>` — agent identifier for audit (default: "default-agent").

The child process only sees environment variables the profile allows. Denied vars are removed, redacted vars show `[REDACTED]`. Every decision is logged to the audit trail.

### preview — Dry-run environment preview

Shows what environment variables an agent would see under a given profile, without actually running anything.

```bash
agentvault preview -p moderate
agentvault preview -p restrictive --denied    # Show only denied vars
agentvault preview -p permissive --allowed    # Show only allowed vars
agentvault preview -p moderate --redacted     # Show only redacted vars
```

**Required flag:** `-p, --profile <name>`
**Filter flags:** `--allowed`, `--redacted`, `--denied`

### status — Show vault status

Displays profiles count, secrets count, and active sessions.

```bash
agentvault status
```

### audit — View audit logs

View or export the credential access audit trail.

```bash
agentvault audit show                          # Last 50 entries
agentvault audit show -n 100                   # Last 100 entries
agentvault audit show -s <session-id>          # Filter by session
agentvault audit show -a claude                # Filter by agent
agentvault audit export -o audit.json          # Export as JSON
agentvault audit export -o audit.csv -f csv    # Export as CSV
agentvault audit clear                         # Clear all logs
```

### profile — Manage permission profiles

```bash
agentvault profile list
agentvault profile show moderate
agentvault profile create myprofile -d "Custom profile" -t 30 -r "AWS_*:deny" -r "NODE_ENV:allow"
agentvault profile delete myprofile
agentvault profile clone moderate custom-moderate
```

Rules use `pattern:access` format. Access levels: `allow`, `deny`, `redact`. Last-match-wins semantics.

### secret — Manage encrypted vault secrets

Store credentials in the AES-256-GCM encrypted vault instead of plaintext `.env` files. Secrets are encrypted at rest with a passphrase you set during `init`. You can import existing `.env` files to migrate secrets into the vault.

```bash
agentvault secret add API_KEY sk-abc123    # Store encrypted
agentvault secret get API_KEY              # Decrypt and retrieve
agentvault secret list                     # List keys (values hidden)
agentvault secret remove API_KEY           # Delete from vault
agentvault secret rename OLD_KEY NEW_KEY   # Rename a key
agentvault secret import .env              # Import all keys from .env file
```

### doctor — Health check

Verifies vault integrity, profiles, configuration, and .gitignore.

```bash
agentvault doctor
```

### revoke — Kill active sessions

Emergency kill switch for agent sessions.

```bash
agentvault revoke                    # Revoke all sessions
agentvault revoke -s <session-id>    # Revoke specific session
```

### watch — Live monitor

Stream audit log entries in real-time.

```bash
agentvault watch
agentvault watch -i 2000    # Poll every 2 seconds
```

### diff — Compare profiles

Show what two profiles would allow/deny/redact differently.

```bash
agentvault diff moderate restrictive
```

## Common workflows

### First-time setup

```bash
agentvault init                           # Creates encrypted vault + default profiles
agentvault secret import .env             # Migrate existing secrets into the vault
agentvault preview -p moderate            # See what "moderate" allows
agentvault wrap -p moderate "your-command-here"
agentvault audit show                     # Review what happened
```

### Storing secrets securely

Replace plaintext `.env` files with encrypted vault storage:

```bash
agentvault secret import .env             # Import all keys from .env
agentvault secret add NEW_KEY value123    # Add individual secrets
agentvault secret list                    # Verify what's stored
# Now you can delete the .env file — secrets are encrypted in .agentvault/vault.json
```

### Sandboxing an AI agent

```bash
agentvault wrap -p restrictive -a claude "claude --print 'write a script'"
agentvault audit show -a claude   # See what claude accessed
```

### Investigating a session

```bash
agentvault status                       # Find session IDs
agentvault audit show -s <session-id>   # See that session's access log
agentvault revoke -s <session-id>       # Kill it if needed
```

## Important notes

- Profiles use **last-match-wins** rule semantics
- System vars (`PATH`, `HOME`, `SHELL`, etc.) always pass through regardless of profile
- Pattern types: `"*"` (match all), `"AWS_*"` (prefix glob), `"NODE_ENV"` (exact match)
- The vault uses AES-256-GCM encryption with scrypt key derivation
- All data is stored locally in `.agentvault/` — nothing leaves the machine

For complete command reference with all flags and options, see [commands.md](references/commands.md).
