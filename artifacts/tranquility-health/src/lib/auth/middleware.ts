// Auth middleware stubs — Phase 0 placeholders. Implement in Phase 3.

import type { UserRole } from "@/types/roles";

// TODO (Phase 3): Replace with real session/token validation.
export function isAuthenticated(): boolean {
  return false;
}

// TODO (Phase 3): Replace with real role check from auth context or session.
export function hasRole(_role: UserRole): boolean {
  return false;
}

// TODO (Phase 3): Redirect unauthenticated users to /login.
export function requireAuth(onUnauthenticated: () => void): void {
  if (!isAuthenticated()) {
    void onUnauthenticated;
  }
}

// TODO (Phase 3): Redirect users who lack the required role.
export function requireRole(_role: UserRole, onUnauthorized: () => void): void {
  if (!hasRole(_role)) {
    void onUnauthorized;
  }
}
