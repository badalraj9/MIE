/**
 * Central application configuration — all env-driven values in one place.
 * Fall back to sensible defaults so the app works out of the box with minimal setup.
 */

const env = process.env;

// ─── AI Models ────────────────────────────────────────────────────────────────

export const CHAT_MODEL        = env.CHAT_MODEL        ?? "gpt-4o-mini";
export const GENERATION_MODEL  = env.GENERATION_MODEL  ?? "gpt-4o";
export const SCORING_MODEL     = env.SCORING_MODEL     ?? "gpt-4o-mini";
export const ANTHROPIC_MODEL   = env.ANTHROPIC_MODEL   ?? "claude-3-5-sonnet-20240620";
export const GROQ_MODEL        = env.GROQ_MODEL        ?? "llama-3.3-70b-versatile";

// ─── Case Builder ─────────────────────────────────────────────────────────────

export const TEACHABILITY_THRESHOLD = parseInt(env.TEACHABILITY_THRESHOLD ?? "25", 10);
export const MAX_GENERATION_TOKENS = parseInt(env.MAX_GENERATION_TOKENS ?? "8000", 10);

// ─── Chat API ─────────────────────────────────────────────────────────────────

export const MAX_CHAT_TOKENS = parseInt(env.MAX_CHAT_TOKENS ?? "500", 10);
export const RATE_LIMIT_MAX_REQUESTS = parseInt(env.RATE_LIMIT_MAX_REQUESTS ?? "20", 10);
export const RATE_LIMIT_WINDOW_MS = parseInt(env.RATE_LIMIT_WINDOW_MS ?? "60000", 10);

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const PROFESSOR_SECRET = env.PROFESSOR_SECRET ?? "";
export const SIGNING_SECRET = env.SIGNING_SECRET ?? "dev-secret-change-in-production";
export const SESSION_DURATION_MS = parseInt(env.SESSION_DURATION_MS ?? "604800000", 10); // 7 days default
export const REFRESH_TOKEN_DAYS = parseInt(env.REFRESH_TOKEN_DAYS ?? "30", 10); // 30 days for persistent login

// ─── Pagination ───────────────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = parseInt(env.DEFAULT_PAGE_SIZE ?? "12", 10);
export const MAX_PAGE_SIZE = parseInt(env.MAX_PAGE_SIZE ?? "50", 10);

// ─── Analytics ───────────────────────────────────────────────────────────────

export const ANALYTICS_ENABLED = env.ANALYTICS_ENABLED !== "false";

// ─── Context Generation ───────────────────────────────────────────────────────

export const CONTEXT_GENERATION_TIMEOUT = parseInt(env.CONTEXT_GENERATION_TIMEOUT ?? "60000", 10); // 60 seconds
export const MAX_CONTEXT_ITEMS = parseInt(env.MAX_CONTEXT_ITEMS ?? "20", 10);

// ─── AI Debate Settings ────────────────────────────────────────────────────────

export const DEBATE_MAX_TOKENS = parseInt(env.DEBATE_MAX_TOKENS ?? "1000", 10);
export const DEBATE_INITIAL_CONTEXT_TOKENS = parseInt(env.DEBATE_INITIAL_CONTEXT_TOKENS ?? "4000", 10);
export const AI_ROLES = ["CHALLENGER", "DEFENDER", "REGULATOR", "INVESTOR", "BOARD_MEMBER", "COMPETITOR"];
export const DEFAULT_AI_ROLE = "CHALLENGER";