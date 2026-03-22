/**
 * AdminProviders — /admin/providers
 * Edit the active provider profile. Persists to the database via PUT /api/admin/providers/active.
 * TODO (Phase 3): Add admin role guard.
 */

import { useEffect, useState } from "react";
import { getActiveProvider, upsertProvider, type Provider, type ProviderInput } from "@/lib/admin-api";

const EMPTY_FORM: ProviderInput = {
  fullName: "",
  credentials: "",
  licenseState: "TX",
  bio: "",
  profileImageUrl: "",
  isActive: true,
};

function providerToForm(p: Provider): ProviderInput {
  return {
    fullName: p.fullName,
    credentials: p.credentials,
    licenseState: p.licenseState,
    bio: p.bio,
    profileImageUrl: p.profileImageUrl ?? "",
    isActive: p.isActive,
  };
}

const inputClass =
  "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white transition-colors";
const labelClass = "block text-sm font-semibold text-slate-700 mb-1";

export default function AdminProvidersPage() {
  const [form, setForm] = useState<ProviderInput>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveResult, setSaveResult] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const provider = await getActiveProvider();
        if (provider) setForm(providerToForm(provider));
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Failed to load provider");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
    setSaveResult(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveResult(null);
    try {
      await upsertProvider(form);
      setSaveResult({ type: "success", msg: "Provider profile saved successfully." });
    } catch (err) {
      setSaveResult({
        type: "error",
        msg: err instanceof Error ? err.message : "Failed to save provider",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Provider Profile</h1>
        <p className="text-slate-400 text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Provider Profile</h1>
        <p className="mt-1 text-slate-500">
          Manage the active provider's publicly visible profile information.
          {/* TODO (Phase 3): Support multiple providers */}
        </p>
      </div>

      {loadError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {loadError}
        </div>
      )}

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-slate-200 rounded-xl shadow-sm p-8">

          {/* Full name */}
          <div>
            <label htmlFor="fullName" className={labelClass}>
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              value={form.fullName}
              onChange={handleChange}
              placeholder="e.g. Jane Smith"
              className={inputClass}
            />
          </div>

          {/* Credentials */}
          <div>
            <label htmlFor="credentials" className={labelClass}>
              Credentials
            </label>
            <input
              id="credentials"
              name="credentials"
              type="text"
              value={form.credentials}
              onChange={handleChange}
              placeholder="e.g. PMHNP-BC, LPC"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-400">
              Professional designations only — do not add claims not backed by licensure.
            </p>
          </div>

          {/* License state */}
          <div>
            <label htmlFor="licenseState" className={labelClass}>
              License State
            </label>
            <input
              id="licenseState"
              name="licenseState"
              type="text"
              maxLength={2}
              value={form.licenseState}
              onChange={handleChange}
              placeholder="TX"
              className="w-24 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 uppercase transition-colors"
            />
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className={labelClass}>
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={5}
              value={form.bio}
              onChange={handleChange}
              placeholder="Provider bio visible to patients..."
              className={`${inputClass} resize-y`}
            />
          </div>

          {/* Profile image URL */}
          <div>
            <label htmlFor="profileImageUrl" className={labelClass}>
              Profile Image URL
            </label>
            <input
              id="profileImageUrl"
              name="profileImageUrl"
              type="url"
              value={form.profileImageUrl}
              onChange={handleChange}
              placeholder="https://..."
              className={inputClass}
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              checked={form.isActive}
              onChange={handleChange}
              className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
              Active (visible to patients)
            </label>
          </div>

          {/* Feedback */}
          {saveResult && (
            <div
              className={`p-3 rounded-lg text-sm font-medium ${
                saveResult.type === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
            >
              {saveResult.msg}
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-indigo-600 text-white font-semibold rounded-lg text-sm hover:from-teal-700 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Profile"}
            </button>
          </div>

          {/* Compliance note */}
          <p className="text-xs text-slate-400 pt-2 border-t border-slate-100">
            {/* TODO (Phase 3): Legal/compliance review before making provider info patient-facing */}
            Profile changes take effect immediately. Ensure all credentials and claims have been reviewed for accuracy before saving.
          </p>
        </form>
      </div>
    </div>
  );
}
