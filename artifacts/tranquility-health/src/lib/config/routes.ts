// Central route path constants — import from here instead of using raw strings.

export const ROUTES = {
  public: {
    home: "/",
    about: "/about",
    services: "/services",
    hours: "/hours",
    faq: "/faq",
    contact: "/contact",
    requestAppointment: "/request-appointment",
  },
  // Requires auth — Phase 3
  app: {
    dashboard: "/app/dashboard",
    onboarding: "/app/onboarding",
    appointments: "/app/appointments",
    session: "/app/session",
  },
  // Requires admin role — Phase 3
  admin: {
    dashboard: "/admin/dashboard",
    requests: "/admin/requests",
    appointments: "/admin/appointments",
    providers: "/admin/providers",
    team: "/admin/team",
  },
} as const;

// TODO (Phase 3): Use in route protection middleware.
export const ROUTE_PREFIXES = {
  APP: "/app",
  ADMIN: "/admin",
} as const;
