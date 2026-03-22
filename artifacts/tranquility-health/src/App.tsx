/**
 * App.tsx — Root application component for Tranquility Health.
 *
 * Organizes routes into three distinct groups:
 *  - Public routes: marketing pages accessible to all visitors
 *  - App routes (/app/*): patient-facing secure application (placeholder shell)
 *  - Admin routes (/admin/*): admin dashboard (placeholder shell)
 *
 * TODO (Phase 3): Wrap /app and /admin routes with authentication guards
 * using the middleware stubs in src/lib/auth/middleware.ts
 */

import { Switch, Route, Router as WouterRouter } from "wouter";

import { PublicLayout } from "@/layouts/PublicLayout";
import { AppLayout } from "@/layouts/AppLayout";
import { AdminLayout } from "@/layouts/AdminLayout";

import HomePage from "@/pages/public/Home";
import AboutPage from "@/pages/public/About";
import ServicesPage from "@/pages/public/Services";
import HoursPage from "@/pages/public/Hours";
import FaqPage from "@/pages/public/Faq";
import ContactPage from "@/pages/public/Contact";
import RequestAppointmentPage from "@/pages/public/RequestAppointment";

import AppDashboardPage from "@/pages/app/Dashboard";
import OnboardingPage from "@/pages/app/Onboarding";
import AppointmentsPage from "@/pages/app/Appointments";
import SessionPage from "@/pages/app/Session";

import AdminDashboardPage from "@/pages/admin/Dashboard";
import AdminRequestsPage from "@/pages/admin/Requests";
import AdminAppointmentsPage from "@/pages/admin/Appointments";
import AdminProvidersPage from "@/pages/admin/Providers";

import NotFoundPage from "@/pages/NotFound";

function Router() {
  return (
    <Switch>
      {/* Public routes — wrapped in public layout (navbar + footer) */}
      <Route path="/">
        <PublicLayout>
          <HomePage />
        </PublicLayout>
      </Route>
      <Route path="/about">
        <PublicLayout>
          <AboutPage />
        </PublicLayout>
      </Route>
      <Route path="/services">
        <PublicLayout>
          <ServicesPage />
        </PublicLayout>
      </Route>
      <Route path="/hours">
        <PublicLayout>
          <HoursPage />
        </PublicLayout>
      </Route>
      <Route path="/faq">
        <PublicLayout>
          <FaqPage />
        </PublicLayout>
      </Route>
      <Route path="/contact">
        <PublicLayout>
          <ContactPage />
        </PublicLayout>
      </Route>
      <Route path="/request-appointment">
        <PublicLayout>
          <RequestAppointmentPage />
        </PublicLayout>
      </Route>

      {/* Patient app routes — wrapped in authenticated app shell */}
      {/* TODO (Phase 3): Add authentication guard around AppLayout */}
      <Route path="/app/dashboard">
        <AppLayout>
          <AppDashboardPage />
        </AppLayout>
      </Route>
      <Route path="/app/onboarding">
        <AppLayout>
          <OnboardingPage />
        </AppLayout>
      </Route>
      <Route path="/app/appointments">
        <AppLayout>
          <AppointmentsPage />
        </AppLayout>
      </Route>
      <Route path="/app/session">
        <AppLayout>
          <SessionPage />
        </AppLayout>
      </Route>

      {/* Admin routes — wrapped in admin shell */}
      {/* TODO (Phase 3): Add admin role check around AdminLayout */}
      <Route path="/admin/dashboard">
        <AdminLayout>
          <AdminDashboardPage />
        </AdminLayout>
      </Route>
      <Route path="/admin/requests">
        <AdminLayout>
          <AdminRequestsPage />
        </AdminLayout>
      </Route>
      <Route path="/admin/appointments">
        <AdminLayout>
          <AdminAppointmentsPage />
        </AdminLayout>
      </Route>
      <Route path="/admin/providers">
        <AdminLayout>
          <AdminProvidersPage />
        </AdminLayout>
      </Route>

      {/* 404 fallback */}
      <Route component={NotFoundPage} />
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
    </WouterRouter>
  );
}

export default App;
