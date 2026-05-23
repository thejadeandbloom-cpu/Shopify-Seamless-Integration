import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, CheckCircle, XCircle, Clock, RefreshCw, LogOut, Users, FileText } from "lucide-react";

const BASE = import.meta.env.BASE_URL ?? "/";
const API = `${BASE}api`.replace(/\/+/g, "/");

type Claim = {
  id: number;
  name: string;
  email: string;
  phone: string;
  orderId: string;
  product: string;
  purchaseDate: string;
  usageLog: string;
  reason: string;
  bankDetails: string;
  status: string;
  refunded: boolean;
  notes: string;
  abuseFlag: string;
  createdAt: string;
};

type Lead = {
  id: number;
  phone: string;
  source: string;
  createdAt: string;
};

type ReviewItem = {
  id: number;
  productLabel: string;
  customerName: string;
  customerEmail: string;
  city: string;
  orderId: string;
  rating: number;
  title: string;
  body: string;
  isApproved: boolean;
  createdAt: string;
  visibleAfter: string;
};

const STATUS_OPTIONS = ["pending", "approved", "denied"];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  denied: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock size={13} />,
  approved: <CheckCircle size={13} />,
  denied: <XCircle size={13} />,
};

function LoginGate({ onLogin }: { onLogin: (pw: string) => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pw.trim()) return;
    onLogin(pw.trim());
    setError(true);
  };

  return (
    <div className="min-h-screen bg-[#F9F7F5] flex items-center justify-center">
      <div className="w-full max-w-[360px] bg-white border border-[#EBEBEB] rounded-[8px] p-8 shadow-sm">
        <div style={{ fontFamily: "'Cinzel', serif" }} className="text-[11px] tracking-[.2em] uppercase text-[#C65D3B] mb-1">Admin</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[22px] text-[#0D0D0D] mb-6">Dashboard</h1>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Admin password"
            value={pw}
            onChange={(e) => { setPw(e.target.value); setError(false); }}
            className="w-full border border-[#EBEBEB] rounded-[4px] px-3 py-[10px] text-[13px] focus:outline-none focus:border-[#C65D3B] transition-colors"
          />
          {error && <p className="text-[12px] text-red-500">Incorrect password.</p>}
          <button type="submit" className="w-full py-[11px] bg-[#0D0D0D] text-white text-[11px] tracking-[.15em] uppercase font-bold rounded-[4px] hover:bg-[#C65D3B] transition-colors">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminRefunds() {
  const [token, setToken] = useState(() => sessionStorage.getItem("admin_token") || "");
  const [authed, setAuthed] = useState(false);
  const [activeTab, setActiveTab] = useState<"refunds" | "leads" | "reviews">("refunds");

  const [claims, setClaims] = useState<Claim[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewSaving, setReviewSaving] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Record<number, { notes: string }>>({});
  const [saving, setSaving] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchAll = useCallback(async (pw: string) => {
    setLoading(true);
    setError("");
    try {
      const [claimsRes, leadsRes, reviewsRes] = await Promise.all([
        fetch(`${API}/refund-claims`, { headers: { Authorization: `Bearer ${pw}` } }),
        fetch(`${API}/leads`, { headers: { Authorization: `Bearer ${pw}` } }),
        fetch(`${API}/admin/reviews`, { headers: { Authorization: `Bearer ${pw}` } }),
      ]);
      if (claimsRes.status === 401) {
        setAuthed(false);
        setError("Incorrect password.");
        return;
      }
      if (!claimsRes.ok || !leadsRes.ok) throw new Error("Failed to fetch");
      const [claimsData, leadsData, reviewsData] = await Promise.all([claimsRes.json(), leadsRes.json(), reviewsRes.ok ? reviewsRes.json() : Promise.resolve([])]) as [Claim[], Lead[], ReviewItem[]];
      setClaims(claimsData);
      setLeads(leadsData);
      setReviews(reviewsData);
      setAuthed(true);
    } catch {
      setError("Could not load data. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (pw: string) => {
    setToken(pw);
    sessionStorage.setItem("admin_token", pw);
    await fetchAll(pw);
  };

  useEffect(() => {
    if (token) fetchAll(token);
  }, []);

  const patch = async (id: number, update: Partial<{ status: string; refunded: boolean; notes: string }>) => {
    setSaving(id);
    try {
      const res = await fetch(`${API}/refund-claims/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(update),
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json() as Claim;
      setClaims((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch {
      alert("Failed to save. Try again.");
    } finally {
      setSaving(null);
    }
  };

  const patchReview = async (id: number, isApproved: boolean) => {
    setReviewSaving(id);
    try {
      const res = await fetch(`${API}/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isApproved }),
      });
      if (!res.ok) throw new Error("Failed");
      const updated = await res.json() as ReviewItem;
      setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } catch {
      alert("Failed to update review. Try again.");
    } finally {
      setReviewSaving(null);
    }
  };

  const logout = () => {
    sessionStorage.removeItem("admin_token");
    setToken("");
    setAuthed(false);
    setClaims([]);
    setLeads([]);
    setReviews([]);
  };

  if (!authed) return <LoginGate onLogin={handleLogin} />;

  const filtered = filterStatus === "all" ? claims : claims.filter((c) => c.status === filterStatus);
  const counts = {
    all: claims.length,
    pending: claims.filter((c) => c.status === "pending").length,
    approved: claims.filter((c) => c.status === "approved").length,
    denied: claims.filter((c) => c.status === "denied").length,
    flagged: claims.filter((c) => c.abuseFlag).length,
    refunded: claims.filter((c) => c.refunded).length,
  };

  return (
    <div className="min-h-screen bg-[#F9F7F5]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Header */}
      <div className="bg-white border-b border-[#EBEBEB] px-6 py-4 flex items-center justify-between">
        <div>
          <div style={{ fontFamily: "'Cinzel', serif" }} className="text-[10px] tracking-[.2em] uppercase text-[#C65D3B]">Jade and Bloom</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[20px] text-[#0D0D0D] leading-tight">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => fetchAll(token)} disabled={loading} className="flex items-center gap-2 px-3 py-2 border border-[#EBEBEB] rounded-[4px] text-[12px] text-[#484848] hover:border-[#C65D3B] transition-colors">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button onClick={logout} className="flex items-center gap-2 px-3 py-2 text-[12px] text-[#969696] hover:text-red-500 transition-colors">
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-[#EBEBEB] px-6">
        <div className="flex gap-1">
          {([
            { key: "refunds", label: "Refund Claims", icon: <FileText size={14} />, count: claims.length },
            { key: "leads", label: "WhatsApp Leads", icon: <Users size={14} />, count: leads.length },
            { key: "reviews", label: "Reviews", icon: <span className="text-[13px] leading-none">★</span>, count: reviews.length },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-[12px] font-semibold border-b-2 transition-colors -mb-px ${
                activeTab === tab.key
                  ? "border-[#C65D3B] text-[#C65D3B]"
                  : "border-transparent text-[#969696] hover:text-[#484848]"
              }`}
            >
              {tab.icon}
              {tab.label}
              <span className={`text-[10px] px-[6px] py-[1px] rounded-full font-bold ${activeTab === tab.key ? "bg-[#FFF5F2] text-[#C65D3B]" : "bg-[#F2F2F2] text-[#969696]"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-[6px] px-4 py-3 text-[13px] text-red-700 mb-6">{error}</div>
        )}

        {/* ── LEADS TAB ── */}
        {activeTab === "leads" && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
              {[
                { label: "Total Leads", val: leads.length, color: "#0D0D0D" },
                { label: "This Week", val: leads.filter((l) => new Date(l.createdAt) > new Date(Date.now() - 7 * 864e5)).length, color: "#C65D3B" },
                { label: "Today", val: leads.filter((l) => new Date(l.createdAt).toDateString() === new Date().toDateString()).length, color: "#059669" },
              ].map((s) => (
                <div key={s.label} className="bg-white border border-[#EBEBEB] rounded-[6px] p-4 text-center">
                  <div className="text-[28px] font-bold" style={{ color: s.color }}>{s.val}</div>
                  <div className="text-[10px] tracking-[.1em] uppercase text-[#969696] mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {leads.length === 0 ? (
              <div className="bg-white border border-[#EBEBEB] rounded-[8px] py-16 text-center text-[14px] text-[#969696]">
                {loading ? "Loading leads..." : "No leads yet. They'll appear here when someone submits the popup."}
              </div>
            ) : (
              <div className="bg-white border border-[#EBEBEB] rounded-[8px] overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#EBEBEB] bg-[#F9F7F5]">
                      <th className="text-left px-5 py-3 text-[10px] tracking-[.12em] uppercase text-[#969696] font-semibold">#</th>
                      <th className="text-left px-5 py-3 text-[10px] tracking-[.12em] uppercase text-[#969696] font-semibold">WhatsApp Number</th>
                      <th className="text-left px-5 py-3 text-[10px] tracking-[.12em] uppercase text-[#969696] font-semibold">Source</th>
                      <th className="text-left px-5 py-3 text-[10px] tracking-[.12em] uppercase text-[#969696] font-semibold">Date</th>
                      <th className="text-left px-5 py-3 text-[10px] tracking-[.12em] uppercase text-[#969696] font-semibold">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead, i) => {
                      const waNumber = (import.meta.env.VITE_WHATSAPP_NUMBER ?? "918750557322");
                      const msg = encodeURIComponent(`Hi! I visited the Jade and Bloom website and would like my 10% welcome discount. My number is ${lead.phone}.`);
                      return (
                        <tr key={lead.id} className={`border-b border-[#EBEBEB] last:border-0 ${i % 2 === 0 ? "" : "bg-[#FAFAFA]"}`}>
                          <td className="px-5 py-4 text-[12px] text-[#969696]">{lead.id}</td>
                          <td className="px-5 py-4 text-[13px] font-semibold text-[#0D0D0D]">{lead.phone}</td>
                          <td className="px-5 py-4">
                            <span className="text-[10px] bg-[#FFF5F2] text-[#C65D3B] border border-[#F2D4C8] px-2 py-[2px] rounded-full font-semibold capitalize">{lead.source}</span>
                          </td>
                          <td className="px-5 py-4 text-[12px] text-[#484848]">{new Date(lead.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                          <td className="px-5 py-4">
                            <a
                              href={`https://wa.me/${waNumber}?text=${msg}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-semibold text-[#25D366] hover:underline"
                            >
                              Send via WhatsApp
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── REFUNDS TAB ── */}
        {activeTab === "refunds" && (
          <>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
              {[
                { label: "Total", val: counts.all, color: "#0D0D0D" },
                { label: "Pending", val: counts.pending, color: "#D97706" },
                { label: "Approved", val: counts.approved, color: "#059669" },
                { label: "Denied", val: counts.denied, color: "#DC2626" },
                { label: "Flagged", val: counts.flagged, color: "#C65D3B" },
                { label: "Refunded", val: counts.refunded, color: "#7C3AED" },
              ].map((s) => (
                <div key={s.label} className="bg-white border border-[#EBEBEB] rounded-[6px] p-4 text-center">
                  <div className="text-[22px] font-bold" style={{ color: s.color }}>{s.val}</div>
                  <div className="text-[10px] tracking-[.1em] uppercase text-[#969696] mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mb-5 flex-wrap">
              {["all", "pending", "approved", "denied"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-4 py-2 rounded-full text-[11px] font-semibold tracking-[.06em] border transition-colors capitalize ${
                    filterStatus === s ? "bg-[#0D0D0D] text-white border-[#0D0D0D]" : "bg-white text-[#484848] border-[#EBEBEB] hover:border-[#484848]"
                  }`}
                >
                  {s === "all" ? `All (${counts.all})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${counts[s as keyof typeof counts]})`}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white border border-[#EBEBEB] rounded-[8px] py-16 text-center text-[14px] text-[#969696]">
                {loading ? "Loading claims..." : "No claims found."}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filtered.map((claim) => {
                  const notesState = editing[claim.id]?.notes ?? claim.notes;
                  return (
                    <div
                      key={claim.id}
                      className={`bg-white border rounded-[8px] p-5 flex flex-col gap-4 ${claim.abuseFlag ? "border-orange-300" : "border-[#EBEBEB]"}`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex flex-col gap-[3px]">
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] font-semibold text-[#0D0D0D]">{claim.name}</span>
                            <span className="text-[11px] text-[#969696]">#{claim.id}</span>
                            {claim.abuseFlag && (
                              <span className="flex items-center gap-1 text-[10px] font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-[2px] rounded-full">
                                <AlertTriangle size={10} /> Flagged
                              </span>
                            )}
                          </div>
                          <div className="text-[12px] text-[#484848]">{claim.email} · {claim.phone}</div>
                        </div>
                        <div className={`flex items-center gap-1 px-3 py-[5px] rounded-full text-[11px] font-semibold border capitalize ${STATUS_STYLES[claim.status] ?? ""}`}>
                          {STATUS_ICONS[claim.status]}
                          {claim.status}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[12px]">
                        <div><span className="text-[10px] uppercase tracking-[.1em] text-[#969696] block mb-[2px]">Order ID</span><span className="font-semibold text-[#0D0D0D]">{claim.orderId}</span></div>
                        <div><span className="text-[10px] uppercase tracking-[.1em] text-[#969696] block mb-[2px]">Product</span><span className="font-semibold text-[#0D0D0D]">{claim.product}</span></div>
                        <div><span className="text-[10px] uppercase tracking-[.1em] text-[#969696] block mb-[2px]">Purchase Date</span><span className="font-semibold text-[#0D0D0D]">{claim.purchaseDate}</span></div>
                        <div><span className="text-[10px] uppercase tracking-[.1em] text-[#969696] block mb-[2px]">Submitted</span><span className="font-semibold text-[#0D0D0D]">{new Date(claim.createdAt).toLocaleDateString("en-IN")}</span></div>
                      </div>

                      <div className="text-[12px]">
                        <span className="text-[10px] uppercase tracking-[.1em] text-[#969696] block mb-[2px]">Expected vs. Experienced</span>
                        <p className="text-[#484848] leading-[1.6]">{claim.reason}</p>
                      </div>

                      <div className="text-[12px]">
                        <span className="text-[10px] uppercase tracking-[.1em] text-[#969696] block mb-[2px]">30-Day Usage Log</span>
                        {claim.usageLog ? (
                          claim.usageLog.startsWith("http") ? (
                            <a href={claim.usageLog} target="_blank" rel="noopener noreferrer" className="text-[#C65D3B] underline break-all">{claim.usageLog}</a>
                          ) : (
                            <p className="text-[#484848] leading-[1.6] whitespace-pre-line">{claim.usageLog}</p>
                          )
                        ) : (
                          <span className="text-[#969696] italic">Not provided</span>
                        )}
                      </div>

                      <div className="text-[12px]">
                        <span className="text-[10px] uppercase tracking-[.1em] text-[#969696] block mb-[2px]">Bank / Refund Details</span>
                        <p className="text-[#484848]">{claim.bankDetails}</p>
                      </div>

                      {claim.abuseFlag && (
                        <div className="bg-orange-50 border border-orange-200 rounded-[4px] px-3 py-2 text-[12px] text-orange-700">
                          <AlertTriangle size={12} className="inline mr-1" />
                          <strong>Abuse flag:</strong> {claim.abuseFlag}
                        </div>
                      )}

                      <div className="border-t border-[#EBEBEB] pt-4 flex flex-wrap gap-3 items-end">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] uppercase tracking-[.1em] text-[#969696]">Status</span>
                          <div className="flex gap-2">
                            {STATUS_OPTIONS.map((s) => (
                              <button
                                key={s}
                                disabled={saving === claim.id}
                                onClick={() => patch(claim.id, { status: s })}
                                className={`px-3 py-[5px] rounded-full text-[10px] font-semibold border capitalize transition-colors ${
                                  claim.status === s
                                    ? STATUS_STYLES[s]
                                    : "bg-white border-[#EBEBEB] text-[#969696] hover:border-[#484848] hover:text-[#0D0D0D]"
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer select-none ml-auto">
                          <span className="text-[12px] text-[#484848]">Refunded</span>
                          <button
                            role="switch"
                            aria-checked={claim.refunded}
                            disabled={saving === claim.id}
                            onClick={() => patch(claim.id, { refunded: !claim.refunded })}
                            className={`relative w-10 h-5 rounded-full transition-colors ${claim.refunded ? "bg-[#059669]" : "bg-[#EBEBEB]"}`}
                          >
                            <span className={`absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full shadow transition-transform ${claim.refunded ? "translate-x-5" : ""}`} />
                          </button>
                        </label>
                      </div>

                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] uppercase tracking-[.1em] text-[#969696]">Internal Notes</span>
                        <div className="flex gap-2">
                          <textarea
                            rows={2}
                            value={notesState}
                            onChange={(e) => setEditing((prev) => ({ ...prev, [claim.id]: { notes: e.target.value } }))}
                            placeholder="Add notes (visible to admins only)..."
                            className="flex-1 border border-[#EBEBEB] rounded-[4px] px-3 py-2 text-[12px] resize-none focus:outline-none focus:border-[#C65D3B] transition-colors"
                          />
                          <button
                            disabled={saving === claim.id || notesState === claim.notes}
                            onClick={() => patch(claim.id, { notes: notesState })}
                            className="px-4 py-2 bg-[#0D0D0D] text-white text-[11px] rounded-[4px] hover:bg-[#C65D3B] transition-colors disabled:opacity-40 self-end"
                          >
                            {saving === claim.id ? "..." : "Save"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── REVIEWS TAB ── */}
        {activeTab === "reviews" && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {[
                { label: "Total", val: reviews.length, color: "#0D0D0D" },
                { label: "Pending", val: reviews.filter((r) => !r.isApproved).length, color: "#D97706" },
                { label: "Approved", val: reviews.filter((r) => r.isApproved).length, color: "#059669" },
                { label: "Visible Now", val: reviews.filter((r) => r.isApproved && new Date(r.visibleAfter) <= new Date()).length, color: "#C65D3B" },
              ].map((s) => (
                <div key={s.label} className="bg-white border border-[#EBEBEB] rounded-[6px] p-4 text-center">
                  <div className="text-[28px] font-bold" style={{ color: s.color }}>{s.val}</div>
                  <div className="text-[10px] tracking-[.1em] uppercase text-[#969696] mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {reviews.length === 0 ? (
              <div className="bg-white border border-[#EBEBEB] rounded-[8px] py-16 text-center text-[14px] text-[#969696]">
                {loading ? "Loading reviews..." : "No reviews yet. Customers can submit at /write-review."}
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => {
                  const isVisible = r.isApproved && new Date(r.visibleAfter) <= new Date();
                  const visibleDate = new Date(r.visibleAfter).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
                  return (
                    <div key={r.id} className={`bg-white border rounded-[8px] p-5 ${r.isApproved ? "border-green-200" : "border-[#EBEBEB]"}`}>
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className="text-[#C8902A] text-[13px] tracking-[1px]">
                              {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                            </span>
                            <span className="text-[10px] bg-[#FFF5F2] text-[#C65D3B] border border-[#F2D4C8] px-2 py-[2px] rounded-full font-semibold">{r.productLabel}</span>
                            {r.isApproved ? (
                              <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-[2px] rounded-full font-semibold flex items-center gap-1">
                                <CheckCircle size={10} /> Approved {isVisible ? "· Live" : `· Goes live ${visibleDate}`}
                              </span>
                            ) : (
                              <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-[2px] rounded-full font-semibold flex items-center gap-1">
                                <Clock size={10} /> Pending approval
                              </span>
                            )}
                          </div>
                          {r.title && <p className="text-[13px] font-semibold text-[#0D0D0D] mb-1">{r.title}</p>}
                          <p className="text-[13px] text-[#484848] leading-[1.6] mb-3">"{r.body}"</p>
                          <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-[#969696]">
                            <span><strong className="text-[#0D0D0D]">{r.customerName}</strong>{r.city ? `, ${r.city}` : ""}</span>
                            <span>{r.customerEmail}</span>
                            <span>Order: <strong className="text-[#0D0D0D]">{r.orderId}</strong></span>
                            <span>Submitted: {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                            <span>Live after: {visibleDate}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-none">
                          {!r.isApproved ? (
                            <button
                              onClick={() => patchReview(r.id, true)}
                              disabled={reviewSaving === r.id}
                              className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white text-[11px] font-bold tracking-[.08em] uppercase rounded-[4px] hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle size={12} />{reviewSaving === r.id ? "..." : "Approve"}
                            </button>
                          ) : (
                            <button
                              onClick={() => patchReview(r.id, false)}
                              disabled={reviewSaving === r.id}
                              className="flex items-center gap-1 px-4 py-2 border border-[#EBEBEB] text-[#969696] text-[11px] font-bold tracking-[.08em] uppercase rounded-[4px] hover:border-red-300 hover:text-red-500 transition-colors disabled:opacity-50"
                            >
                              <XCircle size={12} />{reviewSaving === r.id ? "..." : "Revoke"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
