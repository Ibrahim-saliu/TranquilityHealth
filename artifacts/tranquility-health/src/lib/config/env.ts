/**
 * env.ts — Environment flag configuration for Tranquility Health.
 *
 * Centralizes access to environment variables and feature flags.
 * Use this module instead of reading import.meta.env directly, so that
 * environment access is auditable and testable.
 *
 * TODO (future phase): Add feature flags for gradual rollout of features.
 * TODO (Phase compliance): Add HIPAA audit mode flag to enable enhanced logging.
 */

/**
 * Current application environment.
 * Vite injects "development", "production", or "test".
 */
export const ENV = import.meta.env.MODE as "development" | "production" | "test";

/**
 * Environment flags — derived from ENV for cleaner conditional logic.
 */
export const IS_DEV = ENV === "development";
export const IS_PROD = ENV === "production";

/**
 * API base URL — used for client-side API calls.
 * TODO (Phase 3): Set VITE_API_BASE_URL in .env when backend routes are live.
 */
export const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"] ?? "/api";

/**
 * Feature flags — all disabled by default in Phase 0.
 * Enable in future phases as features are built.
 *
 * TODO (Phase 3): Enable FEATURE_AUTH when authentication is implemented.
 * TODO (future phase): Enable FEATURE_VIDEO when telehealth session is ready.
 */
export const FEATURES = {
  AUTH: false,         // TODO (Phase 3): Set to true when auth is live
  VIDEO_SESSION: false, // TODO (future phase): Set to true when video SDK is integrated
  MESSAGING: false,    // TODO (future phase): Set to true when patient-provider messaging is ready
} as const;
