import { useState, useEffect } from "react";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

const BASE_URL = import.meta.env.BASE_URL ?? "/";
const API_BASE = `${BASE_URL}api`.replace(/\/+/g, "/");

const PRODUCTS = [
  { handle: "green-tea-face-wash",      label: "Green Tea Face Wash",     img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/products/green-tea.jpg" },
  { handle: "14-vitamin-c-serum",       label: "Vitamin C Serum",          img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/products/vitamin-c.jpg" },
  { handle: "brightening-moisturiser",  label: "Kojic Acid Moisturizer",   img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/products/moisturiser.jpg" },
  { handle: "fluid-sunscreen-spf-50",   label: "Fluid Sunscreen SPF 50",   img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/products/sunscreen.jpg" },
];

type MyReview = {
  id: number;
  productHandle: string;
  productLabel: string;
  rating: number;
  title: string;
  body: string;
  imageUrl: string;
  isApproved: boolean;
  createdAt: string;
  visibleAfter: string;
};

type Step = "input" | "otp" | "dashboard";
type AuthMode = "email" | "phone";

function StatusBadge({ review }: { review: MyReview }) {
  const now = new Date();
  const isLive      = review.isApproved && new Date(review.visibleAfter) <= now;
  const isScheduled = review.isApproved && new Date(review.visibleAfter) > now;
  const daysLeft    = Math.ceil((new Date(review.visibleAfter).getTime() - now.getTime()) / 864e5);

  if (isLive)      return <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-[3px] rounded-full font-semibold">✓ Live</span>;
  if (isScheduled) return <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-[3px] rounded-full font-semibold">Goes live in {daysLeft}d</span>;
  return <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-[3px] rounded-full font-semibold">Awaiting approval</span>;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="text-[#C8902A] text-[14px] tracking-[1px]">
      {"★".repeat(rating)}{"☆".repeat(5 - rating)}
    </span>
  );
}

const inp = "w-full border border-[#EBEBEB] rounded-[4px] px-4 py-[11px] text-[13px] text-[#0D0D0D] placeholder:text-[#ABABAB] focus:outline-none focus:border-[#C65D3B] transition-colors bg-white";

export default function MyOrders() {
  const { customer, login, logout } = useCustomerAuth();

  const [step,      setStep]      = useState<Step>(() => customer ? "dashboard" : "input");
  const [mode,      setMode]      = useState<AuthMode>("email");
  const [email,     setEmail]     = useState(customer?.email ?? "");
  const [phone,     setPhone]     = useState("");
  const [otp,       setOtp]       = useState("");
  const [reviews,   setReviews]   = useState<MyReview[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [resendCD,  setResendCD]  = useState(0);

  // identity used for reviews fetch / display
  const identity = customer?.email ?? (mode === "phone" ? `phone:91${phone.replace(/\D/g,"").slice(-10)}` : email);

  useEffect(() => {
    if (customer && step === "dashboard") fetchReviews(customer.email);
  }, []);

  useEffect(() => {
    if (resendCD <= 0) return;
    const t = setTimeout(() => setResendCD((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCD]);

  const fetchReviews = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/my-reviews?email=${encodeURIComponent(id)}`);
      const data = await res.json() as MyReview[];
      setReviews(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
  };

  // ── Send OTP ──────────────────────────────────────────────────
  const sendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true); setError("");
    try {
      if (mode === "email") {
        if (!email.trim() || !email.includes("@")) throw new Error("Please enter a valid email");
        const res = await fetch(`${API_BASE}/auth/send-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        });
        const data = await res.json() as { error?: string };
        if (!res.ok) throw new Error(data.error ?? "Failed to send code");
      } else {
        const digits = phone.replace(/\D/g, "");
        if (digits.length < 10) throw new Error("Please enter a valid 10-digit mobile number");
        const res = await fetch(`${API_BASE}/auth/send-otp-whatsapp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: digits }),
        });
        const data = await res.json() as { error?: string };
        if (!res.ok) throw new Error(data.error ?? "Failed to send code");
      }
      setStep("otp");
      setResendCD(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP ────────────────────────────────────────────────
  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;
    setLoading(true); setError("");
    try {
      let endpoint = `${API_BASE}/auth/verify-otp`;
      let body: Record<string, string> = { email: email.trim(), code: otp.trim() };
      if (mode === "phone") {
        endpoint = `${API_BASE}/auth/verify-otp-phone`;
        body = { phone: phone.replace(/\D/g, ""), code: otp.trim() };
      }
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json() as { error?: string; token?: string; email?: string };
      if (!res.ok) throw new Error(data.error ?? "Invalid code");

      const id = data.email ?? (mode === "email" ? email.trim() : `phone:91${phone.replace(/\D/g,"").slice(-10)}`);
      login(id, data.token ?? "");
      await fetchReviews(id);
      setStep("dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setStep("input");
    setEmail(""); setPhone(""); setOtp(""); setReviews([]); setError("");
  };

  const reviewedHandles    = new Set(reviews.map((r) => r.productHandle));
  const unreviewedProducts = PRODUCTS.filter((p) => !reviewedHandles.has(p.handle));
  const reviewedProducts   = PRODUCTS.filter((p) =>  reviewedHandles.has(p.handle));
  const activeEmail        = customer?.email ?? identity;

  // Pretty label for dashboard
  const displayIdentity = activeEmail.startsWith("phone:")
    ? `+${activeEmail.replace("phone:", "")}`
    : activeEmail;

  return (
    <div className="min-h-screen bg-[#F9F7F5]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-[600px] mx-auto px-5 py-10">

        {/* ── STEP 1: Input (email or phone) ── */}
        {step === "input" && (
          <>
            <div className="text-[9px] tracking-[.25em] uppercase text-[#C65D3B] font-semibold mb-1">My Account</div>
            <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[30px] font-normal text-[#0D0D0D] mb-2">Sign in</h1>
            <p className="text-[13px] text-[#696969] leading-[1.65] mb-6">
              We'll send a 6-digit code — no password needed.
            </p>

            {/* Tab switcher */}
            <div className="flex bg-white border border-[#EBEBEB] rounded-[6px] p-1 mb-6 shadow-sm">
              <button
                type="button"
                onClick={() => { setMode("email"); setError(""); }}
                className={`flex-1 py-2 text-[11px] font-bold tracking-[.1em] uppercase rounded-[4px] transition-colors ${
                  mode === "email"
                    ? "bg-[#C65D3B] text-white shadow-sm"
                    : "text-[#696969] hover:text-[#0D0D0D]"
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => { setMode("phone"); setError(""); }}
                className={`flex-1 py-2 text-[11px] font-bold tracking-[.1em] uppercase rounded-[4px] transition-colors ${
                  mode === "phone"
                    ? "bg-[#C65D3B] text-white shadow-sm"
                    : "text-[#696969] hover:text-[#0D0D0D]"
                }`}
              >
                WhatsApp
              </button>
            </div>

            <form onSubmit={sendOtp} className="bg-white border border-[#EBEBEB] rounded-[10px] p-6 shadow-sm">
              {mode === "email" ? (
                <>
                  <label className="block text-[11px] font-semibold tracking-[.1em] uppercase text-[#484848] mb-2">Your email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className={`${inp} mb-4`}
                    required
                    autoFocus
                  />
                </>
              ) : (
                <>
                  <label className="block text-[11px] font-semibold tracking-[.1em] uppercase text-[#484848] mb-2">WhatsApp mobile number</label>
                  <div className="flex gap-2 mb-4">
                    <div className="flex items-center px-3 border border-[#EBEBEB] rounded-[4px] bg-[#F9F7F5] text-[13px] font-semibold text-[#484848] select-none whitespace-nowrap">
                      🇮🇳 +91
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="98765 43210"
                      className={inp}
                      required
                      autoFocus
                      maxLength={10}
                    />
                  </div>
                  <div className="flex items-start gap-2 mb-4 text-[11px] text-[#696969] bg-[#F9F7F5] border border-[#EBEBEB] rounded-[6px] px-3 py-2">
                    <span className="text-[#25D366] text-[14px] leading-none mt-[1px]">✓</span>
                    <span>We'll send your code as a <strong>WhatsApp message</strong> to this number.</span>
                  </div>
                </>
              )}

              {error && (
                <div className="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-[4px] px-3 py-2 mb-4">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-[13px] bg-[#C65D3B] text-white text-[11px] font-bold tracking-[.18em] uppercase rounded-[4px] hover:bg-[#A84828] transition-colors disabled:opacity-60"
              >
                {loading ? "Sending…" : mode === "phone" ? "Send code on WhatsApp" : "Send login code"}
              </button>
              <p className="text-[10px] text-[#ABABAB] text-center mt-3">
                {mode === "phone"
                  ? "You'll receive a WhatsApp message with a 6-digit code."
                  : "We'll send a one-time 6-digit code to this address."}
              </p>
            </form>
          </>
        )}

        {/* ── STEP 2: Enter OTP ── */}
        {step === "otp" && (
          <>
            <div className="text-[9px] tracking-[.25em] uppercase text-[#C65D3B] font-semibold mb-1">
              {mode === "phone" ? "Check your WhatsApp" : "Check your inbox"}
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[30px] font-normal text-[#0D0D0D] mb-2">Enter your code</h1>
            <p className="text-[13px] text-[#696969] leading-[1.65] mb-8">
              {mode === "phone" ? (
                <>We sent a 6-digit code via WhatsApp to <strong className="text-[#0D0D0D]">+91 {phone}</strong>. It expires in 10 minutes.</>
              ) : (
                <>We sent a 6-digit code to <strong className="text-[#0D0D0D]">{email}</strong>. It expires in 10 minutes.</>
              )}
            </p>
            <form onSubmit={verifyOtp} className="bg-white border border-[#EBEBEB] rounded-[10px] p-6 shadow-sm">
              <label className="block text-[11px] font-semibold tracking-[.1em] uppercase text-[#484848] mb-2">6-digit code</label>
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
              {error && (
                <div className="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-[4px] px-3 py-2 mb-4">{error}</div>
              )}
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
                  onClick={() => { setStep("input"); setOtp(""); setError(""); }}
                  className="text-[11px] text-[#969696] hover:text-[#C65D3B] transition-colors"
                >
                  ← {mode === "phone" ? "Change number" : "Change email"}
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
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="text-[9px] tracking-[.25em] uppercase text-[#C65D3B] font-semibold mb-[2px]">My Account</div>
                <div className="text-[17px] font-semibold text-[#0D0D0D]">{displayIdentity}</div>
              </div>
              <button
                onClick={handleLogout}
                className="text-[11px] font-semibold text-[#969696] hover:text-red-500 transition-colors border border-[#EBEBEB] px-3 py-2 rounded-[4px] hover:border-red-300"
              >
                Sign out
              </button>
            </div>

            {/* ── Reviews Written ── */}
            {reviews.length === 0 ? (
              <div className="bg-white border border-[#EBEBEB] rounded-[10px] p-8 text-center mb-6 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-[#FFF5F2] flex items-center justify-center mx-auto mb-4">
                  <span className="text-[20px]">✍️</span>
                </div>
                <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[20px] text-[#0D0D0D] mb-2">
                  No reviews yet
                </h2>
                <p className="text-[13px] text-[#696969] leading-[1.65] max-w-[340px] mx-auto">
                  You haven't written any reviews yet. If you've purchased from us, share your experience below — your honest feedback helps other customers.
                </p>
              </div>
            ) : (
              <div className="mb-8">
                <div className="text-[10px] tracking-[.2em] uppercase text-[#484848] font-semibold mb-3">
                  Your Reviews ({reviews.length})
                </div>
                <div className="space-y-3">
                  {reviews.map((r) => (
                    <div key={r.id} className="bg-white border border-[#EBEBEB] rounded-[10px] p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                        <span className="text-[11px] bg-[#FFF5F2] text-[#C65D3B] border border-[#F2D4C8] px-2 py-[2px] rounded-full font-semibold">
                          {r.productLabel}
                        </span>
                        <StatusBadge review={r} />
                      </div>
                      <StarRow rating={r.rating} />
                      {r.title && <p className="text-[13px] font-semibold text-[#0D0D0D] mt-2 mb-1">{r.title}</p>}
                      <p className="text-[13px] text-[#484848] leading-[1.65] mt-1">"{r.body}"</p>
                      {r.imageUrl && (
                        <img src={r.imageUrl} alt="Review photo" className="mt-3 rounded-[6px] max-h-[160px] object-cover" />
                      )}
                      <div className="flex items-center justify-between mt-4">
                        <p className="text-[10px] text-[#969696]">
                          Submitted {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                        <a
                          href={`/write-review?reviewId=${r.id}&email=${encodeURIComponent(activeEmail)}`}
                          className="text-[11px] font-semibold text-[#C65D3B] hover:underline flex items-center gap-1"
                        >
                          Edit review
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Products available to review ── */}
            {unreviewedProducts.length > 0 && (
              <div className="mb-6">
                <div className="text-[10px] tracking-[.2em] uppercase text-[#484848] font-semibold mb-3">
                  {reviews.length > 0 ? "Write more reviews" : "Share your experience"}
                </div>
                <div className="bg-[#FFF9F7] border border-[#F2D4C8] rounded-[8px] px-4 py-3 mb-4 text-[12px] text-[#C65D3B]">
                  You'll need your order number from the confirmation email to submit a verified review.
                </div>
                <div className="space-y-2">
                  {unreviewedProducts.map((p) => (
                    <a
                      key={p.handle}
                      href={`/write-review?product=${p.handle}&email=${encodeURIComponent(activeEmail)}`}
                      className="flex items-center justify-between bg-white border border-[#EBEBEB] hover:border-[#C65D3B] rounded-[10px] px-5 py-4 transition-colors group shadow-sm"
                    >
                      <span className="text-[13px] font-semibold text-[#0D0D0D] group-hover:text-[#C65D3B] transition-colors">{p.label}</span>
                      <span className="text-[11px] font-bold text-[#C65D3B] tracking-[.06em] uppercase flex items-center gap-1 flex-shrink-0">
                        Write a review
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* ── All products reviewed ── */}
            {reviewedProducts.length === PRODUCTS.length && (
              <div className="bg-green-50 border border-green-200 rounded-[10px] p-5 text-center">
                <p className="text-[13px] text-green-800 font-semibold">You've reviewed all our products — thank you! 🎉</p>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-[#EBEBEB] flex items-center justify-between">
              <a href="/" className="text-[12px] font-semibold text-[#C65D3B] hover:underline flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M9.5 6H2.5M5.5 3L2.5 6l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Back to store
              </a>
              <span className="text-[11px] text-[#969696]">Jade and Bloom</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
