/**
 * ProviderDashboard — /admin/provider-dashboard
 *
 * Landing page for provider-role users. Shows the provider's own profile
 * (scoped via /api/providers/me) and their office hours.
 *
 * Admins who visit via the "Provider View" nav link see the same UI but
 * fall back to the first active provider if no user-linked record exists.
 */

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { User, Clock, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { getMyProviderProfile, getActiveProvider, type Provider } from "@/lib/admin-api";
import { ROUTES } from "@/lib/config/routes";
import { useAuth } from "@/lib/auth/context";
import { WEEKLY_SCHEDULE } from "@/lib/config/schedule";

export default function ProviderDashboardPage() {
  const { user } = useAuth();
  const isProvider = user?.role === "provider";

  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileMissing, setProfileMissing] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        let p: Provider | null = null;

        if (isProvider) {
          // Scope to the signed-in provider's own record
          p = await getMyProviderProfile();
          if (!p) setProfileMissing(true);
        } else {
          // Admin/collaborator visiting "Provider View" — show first active provider
          p = await getActiveProvider();
        }

        setProvider(p);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isProvider]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          {isProvider ? "Provider Dashboard" : "Provider View"}
        </h1>
        <p className="mt-1 text-slate-500">
          {isProvider
            ? `Welcome back${user?.email ? `, ${user.email}` : ""}. Here's your profile and schedule overview.`
            : "Preview of the provider dashboard as your providers see it."}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Profile not yet linked — prompt setup */}
      {!loading && profileMissing && isProvider && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Profile not set up yet</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Your provider profile hasn't been configured. Contact an admin to complete your setup.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-teal-600" />
              <h2 className="text-base font-semibold text-slate-900">
                {isProvider ? "My Profile" : "Provider Profile"}
              </h2>
            </div>
            {isProvider && (
              <Link
                href={ROUTES.admin.providers}
                className="text-sm text-teal-600 hover:text-teal-800 font-medium"
              >
                Edit →
              </Link>
            )}
          </div>
          <div className="px-6 py-5">
            {loading ? (
              <p className="text-sm text-slate-400">Loading…</p>
            ) : !provider ? (
              <p className="text-sm text-slate-500">
                No active provider profile found.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  {provider.profileImageUrl ? (
                    <img
                      src={provider.profileImageUrl}
                      alt={provider.fullName}
                      className="w-16 h-16 rounded-full object-cover border border-slate-200 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                      {provider.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{provider.fullName}</p>
                    {provider.credentials && (
                      <p className="text-sm text-slate-500">{provider.credentials}</p>
                    )}
                    <p className="text-xs text-slate-400">Licensed in {provider.licenseState}</p>
                  </div>
                </div>
                {provider.bio && (
                  <p className="text-sm text-slate-600 border-t border-slate-100 pt-3">
                    {provider.bio}
                  </p>
                )}
                <div className="flex items-center gap-2 pt-1">
                  {provider.isActive ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Schedule card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600" />
            <h2 className="text-base font-semibold text-slate-900">Office Hours</h2>
          </div>
          <div className="px-6 py-5">
            <div className="space-y-2">
              {WEEKLY_SCHEDULE.map((entry) => (
                <div key={entry.day} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700 w-28">{entry.day}</span>
                  <span className="text-slate-500">
                    {entry.closed ? (
                      <span className="text-slate-400 italic">Closed</span>
                    ) : (
                      entry.hours
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick links */}
      {isProvider && (
        <div className="mt-6 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-600" />
            <h2 className="text-base font-semibold text-slate-900">Quick Actions</h2>
          </div>
          <div className="px-6 py-5 flex flex-wrap gap-3">
            <Link
              href={ROUTES.admin.providers}
              className="px-4 py-2 bg-gradient-to-r from-teal-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-teal-700 hover:to-indigo-700 transition-all shadow-sm"
            >
              Edit My Profile
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
