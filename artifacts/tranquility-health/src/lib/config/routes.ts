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
    privacyPolicy: "/privacy-policy",
    termsOfService: "/terms-of-service",
    hipaaNotice: "/hipaa-notice",
  },
  // Patient app — requires an authenticated patient session
  app: {
    dashboard: "/app/dashboard",
    onboarding: "/app/onboarding",
    appointments: "/app/appointments",
    session: "/app/session",
  },
  // Staff portal — requires an admin, collaborator, or provider session
  admin: {
    dashboard: "/admin/dashboard",
    providerDashboard: "/admin/provider-dashboard",
    requests: "/admin/requests",
    appointments: "/admin/appointments",
    providers: "/admin/providers",
    team: "/admin/team",
  },
} as const;
