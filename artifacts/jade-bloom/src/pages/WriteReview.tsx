import { useState } from "react";

const BASE_URL = import.meta.env.BASE_URL ?? "/";
const API_BASE = `${BASE_URL}api`.replace(/\/+/g, "/");

const PRODUCTS = [
  { handle: "green-tea-face-wash",      label: "Green Tea Face Wash" },
  { handle: "14-vitamin-c-serum",       label: "Vitamin C Serum" },
  { handle: "brightening-moisturiser",  label: "Kojic Acid Moisturizer" },
  { handle: "fluid-sunscreen-spf-50",   label: "Fluid Sunscreen" },
];

const RATING_LABELS = ["", "Poor", "Below average", "Average", "Good", "Excellent"];

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="text-[36px] leading-none transition-all duration-100 hover:scale-110"
          style={{ color: n <= (hovered || value) ? "#C8902A" : "#E0D9D0" }}
          aria-label={`${n} star`}
        >★</button>
      ))}
    </div>
  );
}

export default function WriteReview() {
  const params = new URLSearchParams(window.location.search);
  const preProduct = params.get("product") ?? "";
  const preEmail   = params.get("email") ?? "";
  const preOrder   = params.get("order") ?? "";
  const preHandle  = PRODUCTS.find((p) => p.handle === preProduct || p.label === preProduct)?.label ?? "";

  const [form, setForm] = useState({
    productLabel:  preHandle,
    productHandle: PRODUCTS.find((p) => p.label === preHandle)?.handle ?? "",
    customerEmail: preEmail,
    orderId:       preOrder,
    rating:        0,
    body:          "",
    customerName:  "",
    city:          "",
    title:         "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [error,      setError]      = useState("");

  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const handleProductChange = (label: string) => {
    const p = PRODUCTS.find((p) => p.label === label);
    setForm((f) => ({ ...f, productLabel: label, productHandle: p?.handle ?? "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productLabel) { setError("Please select which product you're reviewing."); return; }
    if (!form.rating)       { setError("Please select a star rating."); return; }
    if (!form.body.trim())  { setError("Please write your review."); return; }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productHandle: form.productHandle,
          productLabel:  form.productLabel,
          customerName:  form.customerName.trim() || "Verified Buyer",
          customerEmail: form.customerEmail.trim(),
          city:          form.city.trim(),
          orderId:       form.orderId.trim(),
          rating:        form.rating,
          title:         form.title.trim(),
          body:          form.body.trim(),
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(d.error ?? "Submission failed");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inp = "w-full border border-[#EBEBEB] rounded-[4px] px-3 py-[10px] text-[13px] text-[#0D0D0D] placeholder:text-[#ABABAB] focus:outline-none focus:border-[#C65D3B] transition-colors bg-white";

  return (
    <div className="min-h-screen bg-[#F9F7F5]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-[540px] mx-auto px-5 py-12">

        {/* Brand nav */}
        <a href="/" className="inline-flex items-center gap-2 mb-10 group">
          <span style={{ fontFamily: "'Cinzel', serif" }} className="text-[10px] tracking-[.22em] uppercase text-[#C65D3B] font-semibold">Jade and Bloom</span>
          <span className="text-[#EBEBEB]">·</span>
          <span className="text-[12px] text-[#969696] group-hover:text-[#C65D3B] transition-colors">← Back to store</span>
        </a>

        {submitted ? (
          <div className="bg-white border border-[#EBEBEB] rounded-[10px] p-10 text-center shadow-sm">
            <div className="w-14 h-14 rounded-full bg-[#E8F5EC] flex items-center justify-center mx-auto mb-5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5 9-9" stroke="#22863A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[26px] text-[#0D0D0D] mb-2">Thank you!</h2>
            <p className="text-[13px] text-[#696969] leading-[1.7] max-w-[340px] mx-auto">
              Your review has been received. It'll appear on our website 7 days after your purchase — no action needed.
            </p>
            <a href="/" className="mt-7 inline-block px-6 py-3 bg-[#C65D3B] text-white text-[11px] font-bold tracking-[.14em] uppercase rounded-[3px] hover:bg-[#A84828] transition-colors">
              Back to Store
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>

            {/* ── SECTION 1: The review itself ── */}
            <div className="bg-white border border-[#EBEBEB] rounded-[10px] p-6 mb-4 shadow-sm">
              <div className="text-[9px] tracking-[.25em] uppercase text-[#C65D3B] font-semibold mb-1">Step 1 of 2</div>
              <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[24px] font-normal text-[#0D0D0D] mb-5">Your review</h1>

              {/* Product */}
              <div className="mb-5">
                <label className="block text-[12px] font-semibold text-[#0D0D0D] mb-2">Which product are you reviewing?</label>
                <select
                  value={form.productLabel}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className={`${inp} cursor-pointer`}
                >
                  <option value="">Select a product…</option>
                  {PRODUCTS.map((p) => (
                    <option key={p.handle} value={p.label}>{p.label}</option>
                  ))}
                </select>
              </div>

              {/* Star rating */}
              <div className="mb-5">
                <label className="block text-[12px] font-semibold text-[#0D0D0D] mb-3">How would you rate it?</label>
                <StarPicker value={form.rating} onChange={(v) => set("rating", v)} />
                {form.rating > 0 && (
                  <p className="text-[12px] text-[#C65D3B] font-semibold mt-2">{RATING_LABELS[form.rating]}</p>
                )}
              </div>

              {/* Review body */}
              <div>
                <label className="block text-[12px] font-semibold text-[#0D0D0D] mb-2">Tell us about your experience</label>
                <textarea
                  value={form.body}
                  onChange={(e) => set("body", e.target.value)}
                  rows={4}
                  placeholder="What did you like? How did your skin respond? How long have you been using it?"
                  className={`${inp} resize-none`}
                />
              </div>
            </div>

            {/* ── SECTION 2: Verification + optional ── */}
            <div className="bg-white border border-[#EBEBEB] rounded-[10px] p-6 mb-4 shadow-sm">
              <div className="text-[9px] tracking-[.25em] uppercase text-[#C65D3B] font-semibold mb-1">Step 2 of 2</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[20px] font-normal text-[#0D0D0D] mb-1">A few details</h2>
              <p className="text-[12px] text-[#969696] mb-5">Order details help us verify purchases. Your name and city are shown on the review — leave blank to appear as "Verified Buyer".</p>

              {/* Email + Order */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#484848] tracking-[.08em] uppercase mb-[6px]">
                    Email <span className="text-[#969696] font-normal normal-case tracking-normal">(for verification)</span>
                  </label>
                  <input type="email" value={form.customerEmail} onChange={(e) => set("customerEmail", e.target.value)}
                    placeholder="you@email.com" className={inp} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#484848] tracking-[.08em] uppercase mb-[6px]">
                    Order # <span className="text-[#969696] font-normal normal-case tracking-normal">(from email)</span>
                  </label>
                  <input type="text" value={form.orderId} onChange={(e) => set("orderId", e.target.value)}
                    placeholder="#1001" className={inp} />
                </div>
              </div>

              {/* Name + City */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#484848] tracking-[.08em] uppercase mb-[6px]">
                    Your name <span className="text-[#C65D3B] font-normal">(optional)</span>
                  </label>
                  <input type="text" value={form.customerName} onChange={(e) => set("customerName", e.target.value)}
                    placeholder="Priya M." className={inp} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#484848] tracking-[.08em] uppercase mb-[6px]">
                    City <span className="text-[#C65D3B] font-normal">(optional)</span>
                  </label>
                  <input type="text" value={form.city} onChange={(e) => set("city", e.target.value)}
                    placeholder="Mumbai" className={inp} />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-[11px] font-semibold text-[#484848] tracking-[.08em] uppercase mb-[6px]">
                  Review headline <span className="text-[#C65D3B] font-normal">(optional)</span>
                </label>
                <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. Skin cleared up in 2 weeks" className={inp} />
              </div>
            </div>

            {error && (
              <div className="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-[6px] px-4 py-3 mb-4">{error}</div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-[14px] bg-[#C65D3B] text-white text-[11px] font-bold tracking-[.18em] uppercase rounded-[4px] hover:bg-[#A84828] transition-colors disabled:opacity-60 shadow-sm"
            >
              {submitting ? "Submitting…" : "Submit My Review"}
            </button>

            <p className="text-[10px] text-[#ABABAB] text-center mt-3">
              Reviews are verified and approved by our team before publishing · Visible 7 days after your purchase
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
