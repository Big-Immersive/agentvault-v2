# Plan: Publish AgentVault as a Public Standard (ACSS)

## Context

AgentVault has a working CLI tool and website, but we want to establish the credential sandboxing approach as a **public standard** before launching the tool. This gives the project legitimacy, invites community input, and positions AgentVault as the reference implementation of a broader standard — similar to how Anthropic published MCP (Model Context Protocol) before it became widely adopted.

## What We're Standardizing

Based on the existing codebase, these are the formalizable components:

| Component | Current Implementation | Standard Name |
|---|---|---|
| Profile schema + rule matching | YAML profiles with pattern/access rules | **Permission Profile Format** |
| Three-state access model | allow / deny / redact | **Access Decision Model** |
| Rule evaluation algorithm | Last-match-wins with glob patterns | **Rule Evaluation** |
| Audit trail format | SQLite schema with session correlation | **Audit Trail Format** |
| Vault encryption format | AES-256-GCM with scrypt key derivation | **Encrypted Vault Format** |
| Session lifecycle | Create → track → revoke with PID binding | **Session Management** |
| Sandbox metadata injection | `AGENTVAULT_SESSION`, `_PROFILE`, `_TRUST` env vars | **Runtime Metadata** |
| System variable passthrough | PATH, HOME, SHELL, etc. always allowed | **System Variables** |

## Recommended Approach: GitHub-first Spec + Website

Based on how successful standards were published:

### Proven patterns studied
- **MCP** (Anthropic): GitHub repo with `/schema` (TypeScript-first, JSON Schema export), `/docs` (Mintlify website), `/seps` (enhancement proposals), governance files. Published at `modelcontextprotocol.io`
- **SemVer**: Single `semver.md` file in GitHub, auto-published to `semver.org` via GitHub Actions. 7.7k stars, 4 releases
- **CommonMark**: `spec.txt` with embedded test cases, reference implementations in C and JS

### Our approach (fastest path)
Follow the **SemVer model** — lightweight, spec-in-markdown, GitHub-first — but with a dedicated spec website page like MCP.

## Deliverables

### 1. Specification Document (`spec/acss-v1.0.md`)

Structure (following RFC/MCP conventions):

```
# Agent Credential Sandboxing Standard (ACSS) Specification v1.0

## Abstract
## Status of This Document
## 1. Introduction
   1.1 Purpose
   1.2 Terminology (RFC 2119 keywords: MUST, SHOULD, MAY...)
   1.3 Design Principles
## 2. Architecture Overview
   2.1 Components (Vault, Profiles, Sandbox, Audit)
   2.2 Execution Flow Diagram
## 3. Permission Profiles
   3.1 Profile Schema (YAML)
   3.2 Permission Rules
   3.3 Pattern Matching (*, PREFIX_*, exact)
   3.4 Rule Evaluation (last-match-wins)
   3.5 Trust Levels
   3.6 Session TTL
## 4. Access Decision Model
   4.1 Decision Types (allow, deny, redact, system)
   4.2 System Variables
   4.3 Redaction Format
## 5. Vault Encryption
   5.1 Encryption Algorithm (AES-256-GCM)
   5.2 Key Derivation (scrypt)
   5.3 Ciphertext Format (JSON: iv, tag, data)
   5.4 Vault Entry Schema
## 6. Audit Trail
   6.1 Entry Schema
   6.2 Storage Requirements
   6.3 Query Interface
   6.4 Export Formats (JSON, CSV)
## 7. Session Management
   7.1 Session Schema
   7.2 Lifecycle (create, track, revoke)
   7.3 Runtime Metadata Injection
## 8. Directory Structure
   8.1 .agentvault/ Layout
   8.2 File Formats
## 9. Security Considerations
   9.1 Encryption at Rest
   9.2 Passphrase Management
   9.3 Process Isolation
   9.4 Audit Integrity
## 10. Conformance
   10.1 Conformance Levels
   10.2 Required vs Optional Features
## Appendix A: JSON Schema
## Appendix B: Example Profiles
## Appendix C: Reference Implementation
```

### 2. JSON Schema (`spec/schema/v1.0/`)

Machine-readable schemas for:
- `profile.schema.json` — Profile + PermissionRule
- `audit-entry.schema.json` — AuditEntry
- `vault-entry.schema.json` — VaultEntry
- `session.schema.json` — Session

### 3. GitHub Repository Structure

```
spec/
├── acss-v1.0.md              # The specification
├── schema/
│   └── v1.0/
│       ├── profile.schema.json
│       ├── audit-entry.schema.json
│       ├── vault-entry.schema.json
│       └── session.schema.json
├── examples/
│   ├── restrictive.yml
│   ├── moderate.yml
│   ├── permissive.yml
│   └── ci-readonly.yml
├── CHANGELOG.md
└── README.md                 # Spec overview + links
```

Root-level files to add:
- `GOVERNANCE.md` — How the standard evolves
- `CONTRIBUTING.md` — How to propose changes
- `CODE_OF_CONDUCT.md`

### 4. Website Spec Page (`website/src/app/spec/page.tsx`)

A `/spec` route on the website rendering the specification with:
- Sidebar navigation matching spec sections
- Anchor links for each section
- JSON Schema viewer/download
- "Reference Implementation" link to the CLI tool
- Similar layout to the existing `/documentation` page

### 5. Navbar/Footer Updates

- Add "ACSS Standard" link to navbar and footer
- Position it prominently (before Documentation)

## Naming

**Name:** ACSS — Agent Credential Sandboxing Standard

Short, memorable, brand-neutral (not tied to "Vault"). Used as: "ACSS v1.0", "ACSS-compliant", "implements ACSS".

## Sources

- [MCP Specification Structure](https://modelcontextprotocol.io/specification/2025-11-25)
- [MCP GitHub Repo](https://github.com/modelcontextprotocol/modelcontextprotocol)
- [SemVer GitHub Repo](https://github.com/semver/semver)
- [CommonMark Spec](https://github.com/commonmark/commonmark-spec)
- [RFC 2119 — Key Words](https://datatracker.ietf.org/doc/html/rfc2119)
- [MITRE — Best Practices for Technical Standard Creation](https://www.mitre.org/sites/default/files/publications/17-1332-best-practices-for-technical-standard-creation.pdf)
