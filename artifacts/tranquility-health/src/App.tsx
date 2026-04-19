import { Switch, Route, Router as WouterRouter } from "wouter";

import { AuthProvider } from "@/lib/auth/context";
import { RequirePatient, RequireAdmin } from "@/lib/auth/guards";

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
import PrivacyPolicyPage from "@/pages/public/PrivacyPolicy";
import TermsOfServicePage from "@/pages/public/TermsOfService";
import HipaaNoticePage from "@/pages/public/HipaaNotice";
import LoginPage from "@/pages/public/Login";
import InviteAcceptPage from "@/pages/public/InviteAccept";

import AppDashboardPage from "@/pages/app/Dashboard";
import OnboardingPage from "@/pages/app/Onboarding";
import AppointmentsPage from "@/pages/app/Appointments";
import SessionPage from "@/pages/app/Session";

import AdminDashboardPage from "@/pages/admin/Dashboard";
import AdminRequestsPage from "@/pages/admin/Requests";
import AdminAppointmentsPage from "@/pages/admin/Appointments";
import AdminProvidersPage from "@/pages/admin/Providers";
import AdminTeamPage from "@/pages/admin/Team";
import AdminAcceptInvitePage from "@/pages/admin/AcceptInvite";

import NotFoundPage from "@/pages/NotFound";

function Router() {
  return (
    <Switch>
      {/* ------------------------------------------------------------------ */}
      {/* Public routes — marketing pages accessible to all visitors          */}
      {/* ------------------------------------------------------------------ */}
      <Route path="/">
        <PublicLayout><HomePage /></PublicLayout>
      </Route>
      <Route path="/about">
        <PublicLayout><AboutPage /></PublicLayout>
      </Route>
      <Route path="/services">
        <PublicLayout><ServicesPage /></PublicLayout>
      </Route>
      <Route path="/hours">
        <PublicLayout><HoursPage /></PublicLayout>
      </Route>
      <Route path="/faq">
        <PublicLayout><FaqPage /></PublicLayout>
      </Route>
      <Route path="/contact">
        <PublicLayout><ContactPage /></PublicLayout>
      </Route>
      <Route path="/request-appointment">
        <PublicLayout><RequestAppointmentPage /></PublicLayout>
      </Route>
      <Route path="/privacy-policy">
        <PublicLayout><PrivacyPolicyPage /></PublicLayout>
      </Route>
      <Route path="/terms-of-service">
        <PublicLayout><TermsOfServicePage /></PublicLayout>
      </Route>
      <Route path="/hipaa-notice">
        <PublicLayout><HipaaNoticePage /></PublicLayout>
      </Route>

      {/* Auth pages — standalone, no shared layout */}
      <Route path="/login">
        <LoginPage />
      </Route>
      <Route path="/invite/:token">
        <InviteAcceptPage />
      </Route>

      {/* ------------------------------------------------------------------ */}
      {/* Patient app routes — require authenticated patient session          */}
      {/* ------------------------------------------------------------------ */}
      <Route path="/app/dashboard">
        <RequirePatient>
          <AppLayout><AppDashboardPage /></AppLayout>
        </RequirePatient>
      </Route>
      <Route path="/app/onboarding">
        <RequirePatient>
          <AppLayout><OnboardingPage /></AppLayout>
        </RequirePatient>
      </Route>
      <Route path="/app/appointments">
        <RequirePatient>
          <AppLayout><AppointmentsPage /></AppLayout>
        </RequirePatient>
      </Route>
      <Route path="/app/session">
        <RequirePatient>
          <AppLayout><SessionPage /></AppLayout>
        </RequirePatient>
      </Route>

      {/* ------------------------------------------------------------------ */}
      {/* Admin routes — require authenticated admin session                 */}
      {/* ------------------------------------------------------------------ */}
      <Route path="/admin/dashboard">
        <RequireAdmin>
          <AdminLayout><AdminDashboardPage /></AdminLayout>
        </RequireAdmin>
      </Route>
      <Route path="/admin/requests">
        <RequireAdmin>
          <AdminLayout><AdminRequestsPage /></AdminLayout>
        </RequireAdmin>
      </Route>
      <Route path="/admin/appointments">
        <RequireAdmin>
          <AdminLayout><AdminAppointmentsPage /></AdminLayout>
        </RequireAdmin>
      </Route>
      <Route path="/admin/providers">
        <RequireAdmin>
          <AdminLayout><AdminProvidersPage /></AdminLayout>
        </RequireAdmin>
      </Route>
      <Route path="/admin/team">
        <RequireAdmin>
          <AdminLayout><AdminTeamPage /></AdminLayout>
        </RequireAdmin>
      </Route>

      {/* Admin invite acceptance — standalone, no layout, no auth required */}
      <Route path="/admin/accept-invite/:token">
        {(params) => <AdminAcceptInvitePage token={params.token} />}
      </Route>

      {/* 404 fallback */}
      <Route component={NotFoundPage} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
    </AuthProvider>
  );
}

export default App;
