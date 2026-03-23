import { Redirect } from "wouter";
import type { ReactNode } from "react";
import { useAuth } from "./context";

// ---------------------------------------------------------------------------
// RequirePatient — redirects to /login if not authenticated as a patient
// ---------------------------------------------------------------------------
export function RequirePatient({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <AuthLoadingScreen />;
  if (!user) return <Redirect to="/login" />;
  if (user.role !== "patient") return <Redirect to="/" />;
  return <>{children}</>;
}

// ---------------------------------------------------------------------------
// RequireAdmin — redirects to /login if not authenticated as an admin
// ---------------------------------------------------------------------------
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <AuthLoadingScreen />;
  if (!user) return <Redirect to="/login" />;
  if (user.role !== "admin") return <Redirect to="/" />;
  return <>{children}</>;
}

// ---------------------------------------------------------------------------
// Shared loading screen shown while session is being verified
// ---------------------------------------------------------------------------
function AuthLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Verifying session…</p>
      </div>
    </div>
  );
}
