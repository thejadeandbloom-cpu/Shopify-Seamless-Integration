import { useState, useEffect } from "react";

const BASE_URL = import.meta.env.BASE_URL ?? "/";
const API_BASE = `${BASE_URL}api`.replace(/\/+/g, "/");

const PRODUCTS = [
  { handle: "green-tea-face-wash",      label: "Green Tea Face Wash" },
  { handle: "14-vitamin-c-serum",       label: "Vitamin C Serum" },
  { handle: "brightening-moisturiser",  label: "Kojic Acid Moisturizer" },
  { handle: "fluid-sunscreen-spf-50",   label: "Fluid Sunscreen" },
];

type MyReview = {
  id: number;
  productLabel: string;
  rating: number;
  title: string;
  body: string;
  isApproved: boolean;
  createdAt: string;
  visibleAfter: string;
};

type Step = "email" | "otp" | "dashboard";

function StatusBadge({ review }: { review: MyReview }) {
  const now = new Date();
  const isLive      = review.isApproved && new Date(review.visibleAfter) <= now;
  const isScheduled = review.isApproved && new Date(review.visibleAfter) > now;
  const daysLeft    = Math.ceil((new Date(review.visibleAfter).getTime() - now.getTime()) / 864e5);

  if (isLive)      return <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-[3px] rounded-full font-semibold">✓ Live on website</span>;
  if (isScheduled) return <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-[3px] rounded-full font-semibold">🕐 Goes live in {daysLeft}d</span>;
  return <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-[3px] rounded-full font-semibold">⏳ Awaiting approval</span>;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="text-[#C8902A] text-[15px] tracking-[1px]">
      {"★".repeat(rating)}{"☆".repeat(5 - rating)}
    </span>
  );
}

const inp = "w-full border border-[#EBEBEB] rounded-[4px] px-4 py-[11px] text-[13px] text-[#0D0D0D] placeholder:text-[#ABABAB] focus:outline-none focus:border-[#C65D3B] transition-colors bg-white";

export default function MyOrders() {
  const [step,     setStep]     = useState<Step>("email");
  const [email,    setEmail]    = useState("");
  const [otp,      setOtp]      = useState("");
  const [reviews,  setReviews]  = useState<MyReview[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [resendCD, setResendCD] = useState(0); // countdown seconds

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCD <= 0) return;
    const t = setTimeout(() => setResendCD((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCD]);

  // Step 1 — send OTP
  const sendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to send code");
      setStep("otp");
      setResendCD(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — verify OTP
  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: otp.trim() }),
      });
      const data = await res.json() as { error?: string; token?: string };
      if (!res.ok) throw new Error(data.error ?? "Invalid code");

      // Fetch reviews now that we're verified
      const rRes = await fetch(`${API_BASE}/my-reviews?email=${encodeURIComponent(email.trim())}`);
      const rData = await rRes.json() as MyReview[];
      setReviews(Array.isArray(rData) ? rData : []);
      setStep("dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const reviewedProducts  = new Set(reviews.map((r) => r.productLabel));
  const unreviewedProducts = PRODUCTS.filter((p) => !reviewedProducts.has(p.label));

  return (
    <div className="min-h-screen bg-[#F9F7F5]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-[540px] mx-auto px-5 py-12">

        {/* Brand nav */}
        <a href="/" className="inline-flex items-center gap-2 mb-10 group">
          <span style={{ fontFamily: "'Cinzel', serif" }} className="text-[10px] tracking-[.22em] uppercase text-[#C65D3B] font-semibold">Jade and Bloom</span>
          <span className="text-[#EBEBEB]">·</span>
          <span className="text-[12px] text-[#969696] group-hover:text-[#C65D3B] transition-colors">← Back to store</span>
        </a>

        {/* ── STEP 1: Enter email ── */}
        {step === "email" && (
          <>
            <div className="text-[9px] tracking-[.25em] uppercase text-[#C65D3B] font-semibold mb-1">My Account</div>
            <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[30px] font-normal text-[#0D0D0D] mb-2">Your reviews</h1>
            <p className="text-[13px] text-[#696969] leading-[1.65] mb-8">
              Enter your email to see the reviews you've written and leave new ones. We'll send a 6-digit code — no password needed.
            </p>

            <form onSubmit={sendOtp} className="bg-white border border-[#EBEBEB] rounded-[10px] p-6 shadow-sm">
              <label className="block text-[11px] font-semibold tracking-[.1em] uppercase text-[#484848] mb-2">
                Your email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className={`${inp} mb-4`}
                required
                autoFocus
              />
              {error && <div className="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-[4px] px-3 py-2 mb-4">{error}</div>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-[13px] bg-[#C65D3B] text-white text-[11px] font-bold tracking-[.18em] uppercase rounded-[4px] hover:bg-[#A84828] transition-colors disabled:opacity-60"
              >
                {loading ? "Sending…" : "Send login code"}
              </button>
              <p className="text-[10px] text-[#ABABAB] text-center mt-3">We'll send a one-time 6-digit code to this address.</p>
            </form>
          </>
        )}

        {/* ── STEP 2: Enter OTP ── */}
        {step === "otp" && (
          <>
            <div className="text-[9px] tracking-[.25em] uppercase text-[#C65D3B] font-semibold mb-1">Check your inbox</div>
            <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[30px] font-normal text-[#0D0D0D] mb-2">Enter your code</h1>
            <p className="text-[13px] text-[#696969] leading-[1.65] mb-8">
              We sent a 6-digit code to <strong className="text-[#0D0D0D]">{email}</strong>. It expires in 10 minutes.
            </p>

            <form onSubmit={verifyOtp} className="bg-white border border-[#EBEBEB] rounded-[10px] p-6 shadow-sm">
              <label className="block text-[11px] font-semibold tracking-[.1em] uppercase text-[#484848] mb-2">
                6-digit code
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className={`${inp} mb-4 text-center text-[22px] font-bold tracking-[.25em]`}
                required
                autoFocus
              />
              {error && <div className="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-[4px] px-3 py-2 mb-4">{error}</div>}
              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-[13px] bg-[#C65D3B] text-white text-[11px] font-bold tracking-[.18em] uppercase rounded-[4px] hover:bg-[#A84828] transition-colors disabled:opacity-60 mb-3"
              >
                {loading ? "Verifying…" : "Verify & continue"}
              </button>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => { setStep("email"); setOtp(""); setError(""); }}
                  className="text-[11px] text-[#969696] hover:text-[#C65D3B] transition-colors"
                >
                  ← Change email
                </button>
                <button
                  type="button"
                  onClick={() => sendOtp()}
                  disabled={resendCD > 0 || loading}
                  className="text-[11px] font-semibold text-[#C65D3B] disabled:text-[#969696] disabled:cursor-not-allowed hover:underline transition-colors"
                >
                  {resendCD > 0 ? `Resend in ${resendCD}s` : "Resend code"}
                </button>
              </div>
            </form>
          </>
        )}

        {/* ── STEP 3: Dashboard ── */}
        {step === "dashboard" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-[9px] tracking-[.25em] uppercase text-[#C65D3B] font-semibold mb-1">Logged in as</div>
                <div className="text-[15px] font-semibold text-[#0D0D0D]">{email}</div>
              </div>
              <button
                onClick={() => { setStep("email"); setEmail(""); setOtp(""); setReviews([]); setError(""); }}
                className="text-[11px] font-semibold text-[#969696] hover:text-[#C65D3B] transition-colors border border-[#EBEBEB] px-3 py-2 rounded-[4px] hover:border-[#C65D3B]"
              >
                Log out
              </button>
            </div>

            {/* Reviews written */}
            {reviews.length > 0 && (
              <div className="mb-7">
                <div className="text-[10px] tracking-[.2em] uppercase text-[#484848] font-semibold mb-3">
                  Your reviews ({reviews.length})
                </div>
                <div className="space-y-3">
                  {reviews.map((r) => (
                    <div key={r.id} className="bg-white border border-[#EBEBEB] rounded-[8px] p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                        <span className="text-[11px] bg-[#FFF5F2] text-[#C65D3B] border border-[#F2D4C8] px-2 py-[2px] rounded-full font-semibold">{r.productLabel}</span>
                        <StatusBadge review={r} />
                      </div>
                      <StarRow rating={r.rating} />
                      {r.title && <p className="text-[13px] font-semibold text-[#0D0D0D] mt-2 mb-1">{r.title}</p>}
                      <p className="text-[13px] text-[#484848] leading-[1.65] mt-1">"{r.body}"</p>
                      <p className="text-[10px] text-[#969696] mt-3">
                        Submitted {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Products not yet reviewed */}
            {unreviewedProducts.length > 0 && (
              <div>
                <div className="text-[10px] tracking-[.2em] uppercase text-[#484848] font-semibold mb-3">
                  {reviews.length > 0 ? "Write more reviews" : "Share your experience"}
                </div>
                <div className="space-y-2">
                  {unreviewedProducts.map((p) => (
                    <a
                      key={p.handle}
                      href={`/write-review?product=${p.handle}&email=${encodeURIComponent(email)}`}
                      className="flex items-center justify-between bg-white border border-[#EBEBEB] hover:border-[#C65D3B] rounded-[8px] px-5 py-4 transition-colors group shadow-sm"
                    >
                      <span className="text-[13px] font-semibold text-[#0D0D0D] group-hover:text-[#C65D3B] transition-colors">{p.label}</span>
                      <span className="text-[11px] font-bold text-[#C65D3B] tracking-[.06em] uppercase flex items-center gap-1">
                        Write a review
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {reviews.length === 0 && unreviewedProducts.length === 0 && (
              <div className="bg-white border border-[#EBEBEB] rounded-[8px] py-12 text-center text-[14px] text-[#969696]">
                Nothing yet — start by writing your first review below.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
