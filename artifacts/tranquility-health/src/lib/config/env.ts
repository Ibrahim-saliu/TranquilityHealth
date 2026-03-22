// Environment configuration — use this module instead of reading import.meta.env directly.

export const ENV = import.meta.env.MODE as "development" | "production" | "test";
export const IS_DEV = ENV === "development";
export const IS_PROD = ENV === "production";

// TODO (Phase 3): Set VITE_API_BASE_URL in .env when backend routes are live.
export const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"] ?? "/api";

// Feature flags — all off in Phase 0. Enable per-phase as features ship.
export const FEATURES = {
  AUTH: false,          // Phase 3
  VIDEO_SESSION: false, // Phase TBD
  MESSAGING: false,     // Phase TBD
} as const;
