import { useState, useEffect, type FormEvent } from "react";
import { useLocation, useParams } from "wouter";
import { Link } from "wouter";
import { Heart, KeyRound, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { API_BASE_URL } from "@/lib/config/env";

type InviteState =
  | { status: "loading" }
  | { status: "valid"; email: string }
  | { status: "invalid"; reason: string }
  | { status: "submitting" }
  | { status: "success" };

export default function InviteAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const { setUser } = useAuth();
  const [, navigate] = useLocation();

  const [state, setState] = useState<InviteState>({ status: "loading" });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Validate the token on mount
  useEffect(() => {
    if (!token) {
      setState({ status: "invalid", reason: "No invite token provided." });
      return;
    }

    fetch(`${API_BASE_URL}/invite/${token}`, { credentials: "include" })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.valid) {
          setState({ status: "valid", email: data.email });
        } else {
          const reasons: Record<string, string> = {
            not_found: "This invite link is invalid or does not exist.",
            already_used: "This invite link has already been used.",
            expired: "This invite link has expired. Please contact support for a new one.",
          };
          setState({
            status: "invalid",
            reason: reasons[data.reason] ?? "This invite link is not valid.",
          });
        }
      })
      .catch(() => {
        setState({
          status: "invalid",
          reason: "Could not validate your invite. Please check your connection.",
        });
      });
  }, [token]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setState({ status: "submitting" });

    try {
      const res = await fetch(`${API_BASE_URL}/invite/${token}/accept`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg =
          data.issues?.join("; ") ?? data.error ?? "Account creation failed.";
        setState({ status: "valid", email: (state as { email: string }).email || "" });
        setFormError(msg);
        return;
      }

      setUser(data.user);
      setState({ status: "success" });

      // Brief pause so user sees the success state, then redirect to dashboard
      setTimeout(() => navigate("/app/dashboard"), 1500);
    } catch {
      setState({ status: "valid", email: (state as { email: string }).email || "" });
      setFormError("Network error. Please try again.");
    }
  }

  const email = state.status === "valid" ? state.email : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-indigo-500 shadow-lg">
              <Heart className="w-6 h-6 text-white fill-white" />
            </span>
            <span className="text-2xl font-bold text-white tracking-tight">
              Tranquility Health
            </span>
          </Link>
          <p className="mt-3 text-slate-400 text-sm">Patient Portal Setup</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Loading */}
          {state.status === "loading" && (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-500 text-sm">Validating your invite…</p>
            </div>
          )}

          {/* Invalid invite */}
          {state.status === "invalid" && (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-7 h-7 text-red-500" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 mb-2">Invite Not Valid</h1>
              <p className="text-slate-500 text-sm mb-6">{state.reason}</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium text-sm"
              >
                ← Back to home
              </Link>
            </div>
          )}

          {/* Success */}
          {state.status === "success" && (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-teal-600" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 mb-2">
                Account Created!
              </h1>
              <p className="text-slate-500 text-sm">
                Welcome to Tranquility Health. Redirecting you to your dashboard…
              </p>
            </div>
          )}

          {/* Valid invite — form */}
          {(state.status === "valid" || state.status === "submitting") && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-teal-100">
                  <KeyRound className="w-5 h-5 text-teal-600" />
                </span>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Create your account</h1>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Invited as <span className="font-medium text-slate-700">{email}</span>
                  </p>
                </div>
              </div>

              <p className="text-slate-500 text-sm mb-6">
                Choose a strong password to secure your patient portal account.
              </p>

              {formError && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{formError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Password <span className="text-slate-400 font-normal">(min. 8 characters)</span>
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={state.status === "submitting"}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {state.status === "submitting" ? (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <KeyRound className="w-4 h-4" />
                  )}
                  {state.status === "submitting" ? "Creating account…" : "Create account"}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <Link
                  href="/login"
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  Already have an account? Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
