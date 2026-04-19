import type { Request, Response, NextFunction } from "express";
import type { SessionData } from "express-session";

// ---------------------------------------------------------------------------
// Session shape — extend the express-session SessionData interface
// ---------------------------------------------------------------------------
declare module "express-session" {
  interface SessionData {
    userId: string;
    role: string;
  }
}

export interface SessionUser {
  userId: string;
  role: string;
}

// ---------------------------------------------------------------------------
// getCurrentUser — returns session user or null
// ---------------------------------------------------------------------------
export function getCurrentUser(req: Request): SessionUser | null {
  if (!req.session.userId || !req.session.role) return null;
  return { userId: req.session.userId, role: req.session.role };
}

// ---------------------------------------------------------------------------
// requireAuth middleware factory
// Returns 401 if not authenticated, 403 if wrong role.
// role can be a single string or an array — any match is accepted.
// ---------------------------------------------------------------------------
export function requireAuth(role?: string | string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = getCurrentUser(req);
    if (!user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    if (role) {
      const allowed = Array.isArray(role) ? role : [role];
      if (!allowed.includes(user.role)) {
        res.status(403).json({ error: "Insufficient permissions" });
        return;
      }
    }
    next();
  };
}
