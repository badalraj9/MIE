/**
 * Central application configuration — all env-driven values in one place.
 * Fall back to sensible defaults so the app works out of the box with minimal setup.
 */

const env = process.env;

// ─── AI Models ────────────────────────────────────────────────────────────────
// The specific model string sent to the provider API.

export const CHAT_MODEL        = env.CHAT_MODEL        ?? "gpt-4o-mini";
export const GENERATION_MODEL  = env.GENERATION_MODEL  ?? "gpt-4o";
export const SCORING_MODEL     = env.SCORING_MODEL     ?? "gpt-4o-mini";
export const ANTHROPIC_MODEL   = env.ANTHROPIC_MODEL   ?? "claude-3-5-sonnet-20240620";
export const GROQ_MODEL        = env.GROQ_MODEL        ?? "llama3-70b-8192";

// ─── Case Builder ─────────────────────────────────────────────────────────────

/** Cumulative teachability score required before case generation is triggered. */
export const TEACHABILITY_THRESHOLD = parseInt(env.TEACHABILITY_THRESHOLD ?? "25", 10);

/** Max tokens for case generation LLM call. */
export const MAX_GENERATION_TOKENS = parseInt(env.MAX_GENERATION_TOKENS ?? "8000", 10);

// ─── Chat API ─────────────────────────────────────────────────────────────────

/** Max tokens per chat completion response. */
export const MAX_CHAT_TOKENS = parseInt(env.MAX_CHAT_TOKENS ?? "500", 10);

/** Max requests per IP per window before rate limiting kicks in. */
export const RATE_LIMIT_MAX_REQUESTS = parseInt(env.RATE_LIMIT_MAX_REQUESTS ?? "20", 10);

/** Rate limit sliding window in milliseconds. */
export const RATE_LIMIT_WINDOW_MS = parseInt(env.RATE_LIMIT_WINDOW_MS ?? "60000", 10);

// ─── Auth ─────────────────────────────────────────────────────────────────────

/** If unset, dashboard access is open (dev mode). Set a strong random string in production. */
export const PROFESSOR_SECRET = env.PROFESSOR_SECRET ?? "";
