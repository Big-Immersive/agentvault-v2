# AgentVault Launch Plan — ACSS Standard, npm Package, Claude Code Skill

## Context
AgentVault is ready to launch. The plan is a 3-phase sequence this week:
1. **Publish ACSS v1.0 standard** — establish the specification first
2. **Publish `agentvault` npm package** — the CLI tool
3. **Publish Claude Code skill** — integrate into the Claude Code ecosystem

All three reinforce each other: the standard gives credibility, the tool is the reference implementation, and the skill makes it frictionless for Claude Code users.

---

## Phase 1: Publish ACSS v1.0 Standard

The ACSS spec already exists at `spec/acss-v1.0.md` with JSON schemas. Publishing means making it accessible and citable.

### Actions
- [ ] Website is already live at `agentvault.up.railway.app/acss` — verify it's deployed and accessible
- [ ] Push the spec to the GitHub repo's `spec/` directory (already done)
- [ ] Create a **GitHub Release** tagged `acss-v1.0` with the spec as the release body
- [ ] Share on relevant channels (Twitter/X, LinkedIn, HN, relevant Discord communities)

### Announcement messaging
> "Introducing ACSS v1.0 — Agent Credential Sandboxing Standard. An open specification for how AI agents should request, scope, and audit access to secrets. MIT licensed."

---

## Phase 2: Publish `agentvault` npm Package

### Pre-publish fixes needed

**File: `package.json`**

1. Add `files` field to control what gets published:
```json
"files": ["dist/", "README.md", "LICENSE"]
```

2. Add `repository` field:
```json
"repository": {
  "type": "git",
  "url": "https://github.com/Big-Immersive/agentvault"
}
```

3. Add `prepublishOnly` script:
```json
"prepublishOnly": "npm run build"
```

4. Verify `engines` field:
```json
"engines": { "node": ">=18" }
```

**New file: `.npmignore`**
```
src/
tests/
apps/
packages/
docs/
website/
spec/
.github/
.claude/
*.test.ts
tsconfig.json
Makefile
.DS_Store
.agentvault/
```

### Publish steps
- [ ] Apply the package.json fixes above
- [ ] Create `.npmignore`
- [ ] Run `npm run build && make test` to verify everything passes
- [ ] Run `npm pack --dry-run` to verify published file list looks correct
- [ ] Ensure npm account is set up: `npm login`
- [ ] Publish: `npm publish --access public`
- [ ] Verify: `npx agentvault --help` works from a clean environment
- [ ] Create GitHub Release tagged `v0.1.0`

### Announcement messaging
> "AgentVault v0.1.0 — Sandbox any process's access to your secrets. Three commands: init, wrap, audit. Works with AI agents, dev servers, CI/CD, and any CLI tool. npm install -g agentvault"

---

## Phase 3: Build & Publish Portable Agent Skill

### Format: Agent Skills Open Standard (agentskills.io)

Uses the **Agent Skills open standard** — the cross-platform skill format supported by Claude Code, OpenClaw/SkillHub, Cursor, Gemini CLI, GitHub Copilot, and 30+ other agent products. One skill definition works everywhere.

**Spec:** https://agentskills.io/specification

### What to build

A single `/agentvault` skill that routes all commands via `$ARGUMENTS`. Users invoke it as `/agentvault init`, `/agentvault wrap -p moderate "cmd"`, etc.

**Commands exposed:**
- `init` — Initialize vault in current project
- `wrap -p <profile> "<command>"` — Run command in sandbox
- `preview -p <profile>` — Preview what agent would see (dry-run)
- `status` — Show vault status (profiles, secrets, sessions)
- `audit show` — Show audit log entries
- `audit export` — Export audit logs
- `profile list` / `profile show <name>` — Manage profiles
- `secret list` / `secret add <key> <value>` — Manage secrets
- `doctor` — Health check
- `revoke` — Kill active sessions
- `watch` — Live monitor audit log
- `diff <profileA> <profileB>` — Compare profiles

### Skill manifest (SKILL.md frontmatter)

```yaml
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
```

**Portability notes:**
- Uses ONLY standard Agent Skills spec fields (name, description, license, compatibility, metadata, allowed-tools)
- No Claude Code-proprietary fields (no `user-invocable`, `context`, `agent`, etc.)
- `allowed-tools` is in the spec but marked experimental — agents that don't support it will ignore it

### Files to create

| File | Purpose |
|------|---------|
| `skills/agentvault/SKILL.md` | Main skill definition (distributable) |
| `skills/agentvault/references/commands.md` | Detailed command reference (all flags/options) |
| `.claude/skills/agentvault/SKILL.md` | Symlink for local testing in this project |

### Body content structure (SKILL.md)

1. **Overview** — What AgentVault does (1 paragraph)
2. **Prerequisites** — Check if `agentvault` is installed, install if not
3. **Command routing** — Parse `$ARGUMENTS` and run the right command
4. **Quick reference** — Each command with usage example
5. **Common workflows** — init → wrap → audit flow

### Publishing & distribution

**For Claude Code users:**
- Copy `skills/agentvault/` to `~/.claude/skills/agentvault/` (personal) or `.claude/skills/agentvault/` (project)
- Also publishable as a Claude Code plugin (`.claude-plugin/plugin.json`)

**For OpenClaw/SkillHub users:**
- Same `skills/agentvault/` folder — format is identical
- Register at skillhub.space or skillhub.club

**For other agents (Cursor, Gemini CLI, etc.):**
- Any agent supporting the Agent Skills standard can use the same folder

### Publish steps
- [ ] Create `skills/agentvault/SKILL.md` with full content
- [ ] Create `skills/agentvault/references/commands.md` with detailed command reference
- [ ] Create `.claude/skills/agentvault/SKILL.md` symlink for local testing
- [ ] Test locally: open new Claude Code session → `/agentvault` appears in slash menu
- [ ] Test commands: `/agentvault init`, `/agentvault status`, `/agentvault preview -p moderate`
- [ ] Push to GitHub repo
- [ ] Register with skill registries (SkillHub, claude-skill-registry)
- [ ] Add "Available as an Agent Skill" section to README

---

## Launch Sequence (This Week)

| Day | Action | Status |
|-----|--------|--------|
| Day 1 | Fix Railway deployment, finalize website | Done |
| Day 1 | Build Claude Code skill | Next |
| Day 2 | Publish ACSS v1.0 standard (GitHub Release + announcements) | Pending |
| Day 2 | Publish npm package `agentvault@0.1.0` | Pending |
| Day 2 | Publish Claude Code skill | Pending |
| Day 3 | Social media / community announcements | Pending |
| Day 3 | Submit to ProductHunt (optional, can be Day 4-5) | Pending |

---

## Verification
- `npm install -g agentvault` works from npmjs.com
- `agentvault --help` shows all commands
- `agentvault init && agentvault wrap -p moderate "echo test"` runs end-to-end
- Website is live and all pages work (`/`, `/documentation`, `/acss`)
- Claude Code skill is findable and functional
- ACSS v1.0 release exists on GitHub
