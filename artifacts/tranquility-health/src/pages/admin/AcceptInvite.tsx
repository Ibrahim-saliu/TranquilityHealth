import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Heart, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { validateAdminInviteToken, acceptAdminInvite } from "@/lib/admin-api";
import { useAuth } from "@/lib/auth/context";

interface Props {
  token: string;
}

export default function AdminAcceptInvitePage({ token }: Props) {
  const [, setLocation] = useLocation();
  const { refresh } = useAuth();

  const [validating, setValidating] = useState(true);
  const [tokenEmail, setTokenEmail] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    async function validate() {
      try {
        const result = await validateAdminInviteToken(token);
        if (!result.valid) {
          const reasons: Record<string, string> = {
            not_found: "This invite link is invalid or does not exist.",
            already_used: "This invite link has already been used.",
            expired: "This invite link has expired. Ask an admin to send a new one.",
            wrong_role: "This link is not valid for admin account setup.",
          };
          setTokenError(reasons[result.reason ?? ""] ?? "This invite link is not valid.");
        } else {
          setTokenEmail(result.email ?? null);
        }
      } catch {
        setTokenError("Unable to validate invite link. Please try again.");
      } finally {
        setValidating(false);
      }
    }
    validate();
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
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

    setSubmitting(true);
    try {
      await acceptAdminInvite(token, password);
      await refresh();
      setLocation("/admin/dashboard");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Account creation failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-indigo-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-indigo-500 shadow-lg">
              <Heart className="w-5 h-5 text-white fill-white" />
            </span>
            <span className="text-2xl font-bold text-white tracking-tight">Tranquility Health</span>
          </div>
          <p className="text-slate-400 text-sm">Admin portal setup</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {validating ? (
            <div className="text-center py-8 text-slate-400 text-sm">Validating invite…</div>
          ) : tokenError ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-red-500 text-xl">✕</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Invite not valid</h2>
              <p className="text-slate-500 text-sm">{tokenError}</p>
              <a
                href="/login"
                className="mt-6 inline-block text-sm text-teal-600 hover:text-teal-800 font-medium"
              >
                Back to login
              </a>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-50 to-indigo-50 border border-teal-100 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Set up your admin account</h2>
                  <p className="text-sm text-slate-500">{tokenEmail}</p>
                </div>
              </div>

              <p className="text-sm text-slate-500 mb-6">
                Choose a strong password to activate your admin account.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full pr-10 px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      disabled={submitting}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Confirm password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    disabled={submitting}
                    required
                  />
                </div>

                {formError && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting || !password || !confirmPassword}
                  className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-teal-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md mt-2"
                >
                  {submitting ? "Creating account…" : "Activate admin account"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
