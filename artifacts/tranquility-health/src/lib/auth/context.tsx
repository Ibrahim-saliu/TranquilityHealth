import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { API_BASE_URL } from "@/lib/config/env";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  /** Refresh the session from the server. */
  refresh: () => Promise<void>;
  /** Log out and clear the session. */
  logout: () => Promise<void>;
  /** Set user directly (e.g. after login / invite accept). */
  setUser: (user: AuthUser | null) => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
    }
  }, []);

  // Check session on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
