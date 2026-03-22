/**
 * routes.ts — Central route path constants for Tranquility Health.
 *
 * All route strings are defined here. Import from this module instead of
 * using raw string literals to prevent typos and make refactoring easy.
 *
 * Route groups:
 * - public: Marketing and informational pages (no auth required)
 * - app: Patient-facing authenticated application routes
 * - admin: Admin dashboard routes (admin role required)
 */

export const ROUTES = {
  /**
   * Public marketing routes — accessible to all visitors.
   */
  public: {
    home: "/",
    about: "/about",
    services: "/services",
    hours: "/hours",
    faq: "/faq",
    contact: "/contact",
    requestAppointment: "/request-appointment",
  },

  /**
   * Patient app routes — require authentication (Phase 3).
   * All paths are prefixed with /app/.
   */
  app: {
    dashboard: "/app/dashboard",
    onboarding: "/app/onboarding",
    appointments: "/app/appointments",
    session: "/app/session",
  },

  /**
   * Admin routes — require admin role (Phase 3).
   * All paths are prefixed with /admin/.
   */
  admin: {
    dashboard: "/admin/dashboard",
    requests: "/admin/requests",
    appointments: "/admin/appointments",
    providers: "/admin/providers",
  },
} as const;

/**
 * Route prefixes used for middleware matching.
 * TODO (Phase 3): Use these in middleware.ts for route protection logic.
 */
export const ROUTE_PREFIXES = {
  APP: "/app",
  ADMIN: "/admin",
} as const;
