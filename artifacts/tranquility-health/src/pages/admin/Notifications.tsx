import { useCallback, useEffect, useState } from "react";
import { Redirect } from "wouter";
import {
  BellRing,
  CheckCircle2,
  Mail,
  MessageSquare,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import {
  createNotificationRecipient,
  deleteNotificationRecipient,
  getNotificationSettings,
  updateNotificationRecipient,
  type NotificationDeliveryConfig,
  type NotificationRecipient,
  type NotificationRecipientInput,
} from "@/lib/admin-api";
import { useAuth } from "@/lib/auth/context";

const EMPTY_FORM: NotificationRecipientInput = {
  label: "",
  email: "",
  phone: "",
  isActive: true,
};

const inputClass =
  "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white transition-colors";

function configStatus(ready: boolean, label: string) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
        ready
          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
          : "bg-amber-50 border-amber-200 text-amber-800"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${ready ? "bg-emerald-500" : "bg-amber-500"}`} />
      {ready ? "Ready" : `${label} needed`}
    </span>
  );
}

interface RecipientEditorProps {
  editing: NotificationRecipient | null;
  onSaved: (recipient: NotificationRecipient) => void;
  onClose: () => void;
}

function RecipientEditor({ editing, onSaved, onClose }: RecipientEditorProps) {
  const [form, setForm] = useState<NotificationRecipientInput>(
    editing
      ? {
          label: editing.label,
          email: editing.email ?? "",
          phone: editing.phone ?? "",
          isActive: editing.isActive,
        }
      : EMPTY_FORM,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const saved = editing
        ? await updateNotificationRecipient(editing.id, form)
        : await createNotificationRecipient(form);
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save recipient");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <button
        type="button"
        className="flex-1 bg-black/40 cursor-default"
        onClick={onClose}
        aria-label="Close recipient form"
      />
      <div className="w-full max-w-lg bg-white shadow-2xl overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {editing ? "Edit alert recipient" : "Add alert recipient"}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Add the administrator’s preferred email and/or mobile number.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-5">
          <div>
            <label htmlFor="recipient-label" className="block text-sm font-semibold text-slate-700 mb-1">
              Label
            </label>
            <input
              id="recipient-label"
              required
              value={form.label}
              onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))}
              placeholder="On-call administrator"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="recipient-email" className="block text-sm font-semibold text-slate-700 mb-1">
              Email address
            </label>
            <input
              id="recipient-email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="admin@example.com"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="recipient-phone" className="block text-sm font-semibold text-slate-700 mb-1">
              Mobile number
            </label>
            <input
              id="recipient-phone"
              type="tel"
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              placeholder="+1 555 123 4567"
              className={inputClass}
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Use a country code for international numbers. US ten-digit numbers are accepted.
            </p>
          </div>
          <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
              className="w-4 h-4 accent-teal-700"
            />
            <span>
              <span className="block text-sm font-medium text-slate-800">Send alerts to this recipient</span>
              <span className="block text-xs text-slate-500 mt-0.5">Turn this off to pause without deleting delivery history.</span>
            </span>
          </label>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">{error}</div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-teal-700 text-white font-semibold rounded-lg text-sm hover:bg-teal-800 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving…" : editing ? "Save changes" : "Add recipient"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SetupStatus({ config }: { config: NotificationDeliveryConfig }) {
  return (
    <div className="grid sm:grid-cols-3 gap-3">
      <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Mail className="w-4 h-4 text-teal-700" />
          Email sender
        </div>
        <div className="mt-2">{configStatus(config.emailConfigured, "sender")}</div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <MessageSquare className="w-4 h-4 text-teal-700" />
          SMS sender
        </div>
        <div className="mt-2">{configStatus(config.smsConfigured, "sender")}</div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <ShieldCheck className="w-4 h-4 text-teal-700" />
          Secure review link
        </div>
        <div className="mt-2">{configStatus(config.adminPortalUrlConfigured, "portal URL")}</div>
      </div>
    </div>
  );
}

export default function AdminNotificationsPage() {
  const { user } = useAuth();
  const [recipients, setRecipients] = useState<NotificationRecipient[]>([]);
  const [config, setConfig] = useState<NotificationDeliveryConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<NotificationRecipient | null | undefined>(undefined);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const settings = await getNotificationSettings();
      setRecipients(settings.recipients);
      setConfig(settings.deliveryConfig);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load notification settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (user?.role !== "admin") return <Redirect to="/admin/dashboard" />;

  function handleSaved(recipient: NotificationRecipient) {
    setRecipients((current) => {
      const next = current.filter((item) => item.id !== recipient.id);
      return [...next, recipient].sort((a, b) => a.label.localeCompare(b.label));
    });
    setEditing(undefined);
  }

  async function removeRecipient(recipient: NotificationRecipient) {
    if (!window.confirm(`Stop sending appointment request alerts to ${recipient.label}?`)) return;
    setRemovingId(recipient.id);
    setError(null);
    try {
      await deleteNotificationRecipient(recipient.id);
      setRecipients((current) =>
        current.map((item) => (item.id === recipient.id ? { ...item, isActive: false } : item)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to remove recipient");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] uppercase text-teal-700">Clinic operations</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Request alerts</h1>
          <p className="mt-1 text-slate-500">
            Keep the team informed when a new appointment request is ready for review.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing(null)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-700 text-white font-semibold rounded-lg text-sm hover:bg-teal-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add recipient
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">{error}</div>
      )}

      <section className="mb-6 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <BellRing className="w-4 h-4 text-teal-700" />
          <div>
            <h2 className="text-base font-semibold text-slate-900">Delivery setup</h2>
            <p className="text-xs text-slate-500 mt-0.5">Provider sender information is kept outside the portal.</p>
          </div>
        </div>
        <div className="p-5">
          {config ? <SetupStatus config={config} /> : <div className="h-24 rounded-lg bg-slate-100 animate-pulse" />}
          <p className="mt-4 text-xs text-slate-500">
            Alerts contain only a generic notice and a secure link. Patient details are never included in email or SMS.
          </p>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Alert recipients</h2>
            <p className="text-xs text-slate-500 mt-0.5">Each active recipient receives email and SMS when configured.</p>
          </div>
          {!loading && (
            <span className="text-xs font-medium text-slate-500">
              {recipients.filter((recipient) => recipient.isActive).length} active
            </span>
          )}
        </div>
        {loading ? (
          <div className="p-6 space-y-3">
            <div className="h-20 rounded-lg bg-slate-100 animate-pulse" />
            <div className="h-20 rounded-lg bg-slate-100 animate-pulse" />
          </div>
        ) : recipients.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <BellRing className="w-9 h-9 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-sm font-semibold text-slate-600">No alert recipients yet</p>
            <p className="mt-1 text-xs text-slate-500">Add administrators to begin delivering new-request alerts.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recipients.map((recipient) => (
              <div key={recipient.id} className={`px-6 py-4 flex items-center gap-4 ${recipient.isActive ? "" : "opacity-60"}`}>
                <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center flex-none">
                  {recipient.isActive ? <CheckCircle2 className="w-5 h-5 text-teal-700" /> : <BellRing className="w-5 h-5 text-slate-400" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-sm text-slate-900">{recipient.label}</p>
                    <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                      recipient.isActive
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-slate-50 border-slate-200 text-slate-500"
                    }`}>
                      {recipient.isActive ? "Active" : "Paused"}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    {recipient.email && <span className="inline-flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{recipient.email}</span>}
                    {recipient.phone && <span className="inline-flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" />{recipient.phone}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditing(recipient)}
                    className="p-2 rounded-md text-slate-500 hover:text-teal-800 hover:bg-teal-50 transition-colors"
                    aria-label={`Edit ${recipient.label}`}
                    title="Edit recipient"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  {recipient.isActive && (
                    <button
                      type="button"
                      disabled={removingId === recipient.id}
                      onClick={() => void removeRecipient(recipient)}
                      className="p-2 rounded-md text-slate-400 hover:text-red-700 hover:bg-red-50 disabled:opacity-40 transition-colors"
                      aria-label={`Pause alerts for ${recipient.label}`}
                      title="Pause alerts"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {editing !== undefined && (
        <RecipientEditor
          editing={editing}
          onSaved={handleSaved}
          onClose={() => setEditing(undefined)}
        />
      )}
    </div>
  );
}