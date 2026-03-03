/** Directory and file names */
export declare const VAULT_DIR = ".agentvault";
export declare const VAULT_FILE = "vault.json";
export declare const MEMORY_FILE = "memory.json";
export declare const PROFILES_DIR = "profiles";
export declare const SESSIONS_FILE = "sessions.json";
export declare const AUDIT_DB = "audit.db";
export declare const MCP_BUDGET_FILE = "mcp-budget.json";
export declare const PURCHASED_BANKS_DIR = "purchased-banks";
/** Encryption */
export declare const ENCRYPTION_ALGO = "aes-256-gcm";
export declare const SCRYPT_N = 16384;
export declare const SCRYPT_R = 8;
export declare const SCRYPT_P = 1;
export declare const SCRYPT_KEYLEN = 32;
export declare const SALT_BYTES = 32;
export declare const IV_BYTES = 16;
/** Env var for passphrase */
export declare const PASSPHRASE_ENV = "AGENTVAULT_PASSPHRASE";
export declare const MCP_TOKEN_ENV = "AGENTVAULT_MCP_TOKEN";
/** System env vars that always pass through sandboxing */
export declare const SYSTEM_VARS: string[];
/** Vault limits */
export declare const VAULT_MAX_ENTRIES = 1000;
export declare const VAULT_MAX_BYTES: number;
export declare const VAULT_WARN_PERCENT = 0.8;
/** Memory limits */
export declare const MEMORY_MAX_ENTRIES = 10000;
export declare const MEMORY_MAX_BYTES: number;
export declare const MEMORY_WARN_PERCENT = 0.8;
/** Memory search */
export declare const MIN_KEYWORD_LENGTH = 3;
export declare const MAX_KEYWORDS = 20;
export declare const MIN_SEARCH_SCORE = 0.1;
/** MCP rate limit */
export declare const MCP_RATE_LIMIT = 60;
export declare const MCP_DRAIN_TIMEOUT_MS = 5000;
/** Stopwords for keyword extraction */
export declare const STOPWORDS: Set<string>;
//# sourceMappingURL=defaults.d.ts.map