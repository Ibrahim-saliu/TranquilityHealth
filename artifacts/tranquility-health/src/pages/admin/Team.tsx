import { useEffect, useState } from "react";
import { Users, UserPlus, Clock, CheckCircle, Copy, Check, Mail, Link2 } from "lucide-react";
import {
  getTeam,
  inviteStaff,
  resendInvite,
  type AdminUser,
  type PendingInvite,
} from "@/lib/admin-api";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeLeft(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) return `${Math.floor(hours / 24)}d left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

function isExpired(iso: string) {
  return new Date(iso) < new Date();
}

function toAbsolute(path: string): string {
  if (path.startsWith("http")) return path;
  return window.location.origin + path;
}

function CopyButton({ text, label = "Copy link" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs text-teal-700 hover:text-teal-900 font-medium px-2.5 py-1.5 rounded-md bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors flex-shrink-0"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          Copied
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          {label}
        </>
      )}
    </button>
  );
}

function InviteLink({ url, email }: { url: string; email: string }) {
  const absolute = toAbsolute(url);
  return (
    <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
      <p className="text-sm font-semibold text-emerald-800 mb-0.5">
        Invite link created for {email}
      </p>
      <p className="text-xs text-emerald-700 mb-3">
        Copy and send this link. It expires in 72 hours and can only be used once.
      </p>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-xs bg-white border border-emerald-200 rounded px-3 py-2 text-slate-700 break-all min-w-0">
          {absolute}
        </code>
        <CopyButton text={absolute} />
      </div>
    </div>
  );
}

function PendingInviteRow({ invite, onGetLink }: {
  invite: PendingInvite;
  onGetLink: (email: string) => Promise<string>;
}) {
  const [loading, setLoading] = useState(false);
  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handleGetLink() {
    setLoading(true);
    setErr(null);
    try {
      const url = await onGetLink(invite.email);
      setLinkUrl(url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to generate link");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-6 py-3.5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
          <Mail className="w-3.5 h-3.5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">{invite.email}</p>
          <p className="text-xs text-slate-400">
            Sent {formatDate(invite.createdAt)} — {formatTimeLeft(invite.expiresAt)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] font-semibold uppercase tracking-wide bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full">
            Pending
          </span>
          {!linkUrl && (
            <button
              onClick={handleGetLink}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-xs text-indigo-700 hover:text-indigo-900 font-medium px-2.5 py-1.5 rounded-md bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors disabled:opacity-50"
            >
              <Link2 className="w-3.5 h-3.5" />
              {loading ? "Generating…" : "Get link"}
            </button>
          )}
        </div>
      </div>

      {err && (
        <p className="mt-2 text-xs text-red-600 pl-11">{err}</p>
      )}

      {linkUrl && (
        <div className="mt-3 ml-11 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
          <p className="text-xs text-indigo-700 font-medium mb-2">New invite link (72 hours):</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-white border border-indigo-200 rounded px-2.5 py-1.5 text-slate-700 break-all min-w-0">
              {toAbsolute(linkUrl)}
            </code>
            <CopyButton text={toAbsolute(linkUrl)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminTeamPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteResult, setInviteResult] = useState<{ email: string; url: string } | null>(null);

  async function loadTeam() {
    try {
      setError(null);
      const data = await getTeam();
      setAdmins(data.admins);
      setPendingInvites(data.pendingInvites);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load team");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeam();
  }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviting(true);
    setInviteError(null);
    setInviteResult(null);

    try {
      const result = await inviteStaff(inviteEmail.trim());
      setInviteResult({ email: inviteEmail.trim(), url: result.inviteUrl });
      setInviteEmail("");
      loadTeam();
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Failed to create invite");
    } finally {
      setInviting(false);
    }
  }

  async function handleResend(email: string): Promise<string> {
    const result = await resendInvite(email);
    return result.inviteUrl;
  }

  const activePending = pendingInvites.filter((i) => !i.used && !isExpired(i.expiresAt));
  const usedOrExpired = pendingInvites.filter((i) => i.used || isExpired(i.expiresAt));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Team</h1>
        <p className="mt-1 text-slate-500">Manage admin access for Tranquility Health staff.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invite form */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-teal-600" />
            <h2 className="text-base font-semibold text-slate-900">Invite a team member</h2>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm text-slate-500 mb-4">
              Enter their email address to generate a secure invite link. The link expires in 72 hours.
            </p>
            <form onSubmit={handleInvite} className="flex gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  disabled={inviting}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={inviting || !inviteEmail.trim()}
                className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-teal-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                {inviting ? "Generating…" : "Generate link"}
              </button>
            </form>

            {inviteError && (
              <p className="mt-3 text-sm text-red-600">{inviteError}</p>
            )}

            {inviteResult && (
              <InviteLink url={inviteResult.url} email={inviteResult.email} />
            )}
          </div>
        </div>

        {/* Current admins */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-600" />
            <h2 className="text-base font-semibold text-slate-900">
              Active admins
              {!loading && (
                <span className="ml-2 text-xs font-normal text-slate-400">
                  {admins.length} {admins.length === 1 ? "member" : "members"}
                </span>
              )}
            </h2>
          </div>
          <div className="divide-y divide-slate-50">
            {loading ? (
              <div className="px-6 py-10 text-center text-slate-400 text-sm">Loading…</div>
            ) : admins.length === 0 ? (
              <div className="px-6 py-10 text-center text-slate-400 text-sm">No admins found.</div>
            ) : (
              admins.map((admin) => (
                <div key={admin.id} className="px-6 py-3.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold uppercase flex-shrink-0">
                    {admin.email[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{admin.email}</p>
                    <p className="text-xs text-slate-400">Joined {formatDate(admin.createdAt)}</p>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wide bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pending invites */}
      {!loading && activePending.length > 0 && (
        <div className="mt-6 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <h2 className="text-base font-semibold text-slate-900">
              Pending invites
              <span className="ml-2 text-xs font-normal text-slate-400">
                {activePending.length} awaiting acceptance
              </span>
            </h2>
          </div>
          <div className="divide-y divide-slate-50">
            {activePending.map((invite) => (
              <PendingInviteRow
                key={invite.id}
                invite={invite}
                onGetLink={handleResend}
              />
            ))}
          </div>
        </div>
      )}

      {/* Accepted / expired invites */}
      {!loading && usedOrExpired.length > 0 && (
        <div className="mt-6 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-slate-400" />
            <h2 className="text-base font-semibold text-slate-900 text-slate-500">
              Invite history
            </h2>
          </div>
          <div className="divide-y divide-slate-50">
            {usedOrExpired.map((invite) => (
              <div key={invite.id} className="px-6 py-3.5 flex items-center gap-3 opacity-60">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{invite.email}</p>
                  <p className="text-xs text-slate-400">
                    {invite.used ? "Accepted" : "Expired"} — sent {formatDate(invite.createdAt)}
                  </p>
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                  invite.used
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-slate-50 border-slate-200 text-slate-500"
                }`}>
                  {invite.used ? "Accepted" : "Expired"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
