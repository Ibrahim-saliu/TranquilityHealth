/**
 * AdminProviders — /admin/providers
 * Lists all provider profiles. Admins can add, edit, and toggle active status.
 */

import { useEffect, useState, useCallback } from "react";
import { CheckCircle, Plus, X } from "lucide-react";
import {
  listProviders,
  createProvider,
  updateProvider,
  getMyProviderProfile,
  updateMyProviderProfile,
  type Provider,
  type ProviderInput,
} from "@/lib/admin-api";
import { useAuth } from "@/lib/auth/context";
import { PhotoUploader, resolvePhotoSrc } from "@/components/admin/PhotoUploader";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Provider form panel (create or edit)
// ---------------------------------------------------------------------------

interface FormPanelProps {
  editing: Provider | null; // null = create mode
  onSave: (provider: Provider) => void;
  onClose: () => void;
}

function ProviderFormPanel({ editing, onSave, onClose }: FormPanelProps) {
  const [form, setForm] = useState<ProviderInput>(
    editing ? providerToForm(editing) : EMPTY_FORM,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const saved = editing
        ? await updateProvider(editing.id, form)
        : await createProvider(form);
      onSave(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">
            {editing ? "Edit Provider" : "Add Provider"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 px-6 py-6 space-y-5">
          {/* Profile photo */}
          <div>
            <label className={labelClass}>Profile Photo</label>
            <PhotoUploader
              value={form.profileImageUrl}
              onChange={(objectPath) =>
                setForm((prev) => ({ ...prev, profileImageUrl: objectPath }))
              }
              initials={form.fullName || "?"}
            />
          </div>

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
              placeholder="e.g. Dr. Jane Smith"
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
              Professional designations only — do not add unverified claims.
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
              className="w-24 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 uppercase transition-colors"
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
              rows={4}
              value={form.bio}
              onChange={handleChange}
              placeholder="Provider bio visible to patients..."
              className={`${inputClass} resize-y`}
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

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-indigo-600 text-white font-semibold rounded-lg text-sm hover:from-teal-700 hover:to-indigo-700 transition-all shadow-sm disabled:opacity-50"
            >
              {saving ? "Saving…" : editing ? "Save Changes" : "Add Provider"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>

          <p className="text-xs text-slate-400 pt-2 border-t border-slate-100">
            Profile changes take effect immediately. Ensure all credentials have been reviewed for accuracy.
          </p>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Provider card
// ---------------------------------------------------------------------------

interface ProviderCardProps {
  provider: Provider;
  canEdit: boolean;
  onEdit: (p: Provider) => void;
}

function ProviderCard({ provider, canEdit, onEdit }: ProviderCardProps) {
  const photoSrc = resolvePhotoSrc(provider.profileImageUrl);
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex items-start gap-4">
      {/* Avatar */}
      {photoSrc ? (
        <img
          src={photoSrc}
          alt={provider.fullName}
          className="w-14 h-14 rounded-full object-cover border border-slate-200 flex-shrink-0"
        />
      ) : (
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
          {provider.fullName.charAt(0).toUpperCase()}
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-base font-semibold text-slate-900 truncate">{provider.fullName}</p>
            {provider.credentials && (
              <p className="text-sm text-slate-500">{provider.credentials}</p>
            )}
            <p className="text-xs text-slate-400 mt-0.5">Licensed in {provider.licenseState}</p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
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
            {canEdit && (
              <button
                onClick={() => onEdit(provider)}
                className="text-sm text-teal-600 hover:text-teal-800 font-medium px-3 py-1 rounded-md hover:bg-teal-50 transition-colors border border-teal-200"
              >
                Edit
              </button>
            )}
          </div>
        </div>

        {provider.bio && (
          <p className="mt-2 text-sm text-slate-600 line-clamp-2">{provider.bio}</p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function AdminProvidersPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isProvider = user?.role === "provider";

  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<Provider | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const list = await listProviders();
      setProviders(list);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load providers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setPanelOpen(true);
  }

  function openEdit(p: Provider) {
    setEditing(p);
    setPanelOpen(true);
  }

  function handleSaved(saved: Provider) {
    setProviders((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved].sort((a, b) => a.fullName.localeCompare(b.fullName));
    });
    setPanelOpen(false);
  }

  // Providers viewing their own profile get a simplified edit view
  if (isProvider) {
    return <ProviderSelfView />;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Providers</h1>
          <p className="mt-1 text-slate-500">
            Manage the provider roster and their publicly visible profiles.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-indigo-600 text-white font-semibold rounded-lg text-sm hover:from-teal-700 hover:to-indigo-700 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Provider
          </button>
        )}
      </div>

      {/* Error */}
      {loadError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {loadError}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : providers.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-4xl mb-3">👩‍⚕️</p>
          <p className="text-base font-medium text-slate-500">No providers yet</p>
          {isAdmin && (
            <p className="text-sm mt-1">
              Click <strong>Add Provider</strong> to create the first profile.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {providers.map((p) => (
            <ProviderCard key={p.id} provider={p} canEdit={isAdmin} onEdit={openEdit} />
          ))}
        </div>
      )}

      {/* Form panel */}
      {panelOpen && (
        <ProviderFormPanel
          editing={editing}
          onSave={handleSaved}
          onClose={() => setPanelOpen(false)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ProviderSelfView — shown when a provider role visits /admin/providers
// Loads their own profile and lets them edit it directly.
// ---------------------------------------------------------------------------
function ProviderSelfView() {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProviderInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const p = await getMyProviderProfile();
        setProvider(p);
        if (p) setForm(providerToForm(p));
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
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
      const saved = await updateMyProviderProfile(form);
      setProvider(saved);
      setEditing(false);
      setSaveResult({ type: "success", msg: "Profile saved successfully." });
    } catch (err) {
      setSaveResult({ type: "error", msg: err instanceof Error ? err.message : "Failed to save" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">My Profile</h1>
        <p className="text-slate-400 text-sm">Loading…</p>
      </div>
    );
  }

  const photoSrc = resolvePhotoSrc(provider?.profileImageUrl);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
          <p className="mt-1 text-slate-500">Your publicly visible provider profile.</p>
        </div>
        {!editing && provider && (
          <button
            onClick={() => { setEditing(true); setSaveResult(null); }}
            className="px-4 py-2 bg-gradient-to-r from-teal-600 to-indigo-600 text-white font-semibold rounded-lg text-sm hover:from-teal-700 hover:to-indigo-700 transition-all shadow-sm"
          >
            Edit Profile
          </button>
        )}
      </div>

      {loadError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {loadError}
        </div>
      )}

      {saveResult && !editing && (
        <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${saveResult.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-red-50 border border-red-200 text-red-800"}`}>
          {saveResult.msg}
        </div>
      )}

      {!provider && !loadError && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
          No profile linked to your account yet. Contact an administrator to set up your provider profile.
        </div>
      )}

      {provider && !editing && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 max-w-2xl">
          <div className="flex items-center gap-4 mb-4">
            {photoSrc ? (
              <img src={photoSrc} alt={provider.fullName} className="w-16 h-16 rounded-full object-cover border border-slate-200 flex-shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {provider.fullName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-lg font-semibold text-slate-900">{provider.fullName}</p>
              {provider.credentials && <p className="text-sm text-slate-500">{provider.credentials}</p>}
              <p className="text-xs text-slate-400">Licensed in {provider.licenseState}</p>
            </div>
          </div>
          {provider.bio && <p className="text-sm text-slate-600 border-t border-slate-100 pt-4">{provider.bio}</p>}
          <div className="mt-3">
            {provider.isActive ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <CheckCircle className="w-3 h-3" /> Active
              </span>
            ) : (
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">Inactive</span>
            )}
          </div>
        </div>
      )}

      {provider && editing && (
        <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-slate-200 rounded-xl shadow-sm p-6 max-w-2xl">
          {/* Profile photo */}
          <div>
            <label className={labelClass}>Profile Photo</label>
            <PhotoUploader
              value={form.profileImageUrl}
              onChange={(objectPath) => {
                setForm((prev) => ({ ...prev, profileImageUrl: objectPath }));
                setSaveResult(null);
              }}
              initials={form.fullName || "?"}
            />
          </div>

          <div>
            <label htmlFor="se-fullName" className={labelClass}>Full Name <span className="text-red-500">*</span></label>
            <input id="se-fullName" name="fullName" type="text" required value={form.fullName} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label htmlFor="se-credentials" className={labelClass}>Credentials</label>
            <input id="se-credentials" name="credentials" type="text" value={form.credentials} onChange={handleChange} placeholder="e.g. PMHNP-BC" className={inputClass} />
          </div>
          <div>
            <label htmlFor="se-licenseState" className={labelClass}>License State</label>
            <input id="se-licenseState" name="licenseState" type="text" maxLength={2} value={form.licenseState} onChange={handleChange} className="w-24 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 uppercase transition-colors" />
          </div>
          <div>
            <label htmlFor="se-bio" className={labelClass}>Bio</label>
            <textarea id="se-bio" name="bio" rows={4} value={form.bio} onChange={handleChange} placeholder="Your bio visible to patients..." className={`${inputClass} resize-y`} />
          </div>

          {saveResult && (
            <div className={`p-3 rounded-lg text-sm font-medium ${saveResult.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-red-50 border border-red-200 text-red-800"}`}>
              {saveResult.msg}
            </div>
          )}
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-indigo-600 text-white font-semibold rounded-lg text-sm hover:from-teal-700 hover:to-indigo-700 transition-all shadow-sm disabled:opacity-50">
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button type="button" onClick={() => { setEditing(false); setSaveResult(null); if (provider) setForm(providerToForm(provider)); }} className="px-5 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
