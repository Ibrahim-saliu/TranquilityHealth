// Environment configuration — use this module instead of reading import.meta.env directly.

export const ENV = import.meta.env.MODE as "development" | "production" | "test";
export const IS_DEV = ENV === "development";
export const IS_PROD = ENV === "production";

// Base path for the API server. Defaults to the same-origin `/api` proxy.
export const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"] ?? "/api";
