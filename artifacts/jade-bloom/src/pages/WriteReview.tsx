import { useState } from "react";

const BASE_URL = import.meta.env.BASE_URL ?? "/";
const API_BASE = `${BASE_URL}api`.replace(/\/+/g, "/");

const PRODUCTS = [
  { handle: "green-tea-face-wash",      label: "Green Tea Face Wash" },
  { handle: "14-vitamin-c-serum",       label: "Vitamin C Serum" },
  { handle: "brightening-moisturiser",  label: "Kojic Acid Moisturizer" },
  { handle: "fluid-sunscreen-spf-50",   label: "Fluid Sunscreen" },
];

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="text-[28px] leading-none transition-colors"
          style={{ color: n <= (hovered || value) ? "#C8902A" : "#DEDEDE" }}
          aria-label={`${n} star`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function WriteReview() {
  const params = new URLSearchParams(window.location.search);
  const preProduct = params.get("product") ?? "";
  const preHandle = PRODUCTS.find((p) => p.handle === preProduct || p.label === preProduct)?.label ?? "";

  const [form, setForm] = useState({
    productLabel: preHandle,
    productHandle: PRODUCTS.find((p) => p.label === preHandle)?.handle ?? "",
    customerName: "",
    customerEmail: "",
    city: "",
    orderId: "",
    rating: 0,
    title: "",
    body: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const handleProductChange = (label: string) => {
    const p = PRODUCTS.find((p) => p.label === label);
    setForm((f) => ({ ...f, productLabel: label, productHandle: p?.handle ?? "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productLabel || !form.orderId || !form.customerName || !form.customerEmail || !form.rating || !form.body) {
      setError("Please fill in all required fields and select a star rating.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productHandle: form.productHandle,
          productLabel: form.productLabel,
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          city: form.city,
          orderId: form.orderId,
          rating: form.rating,
          title: form.title,
          body: form.body,
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
  const lbl = "block text-[11px] tracking-[.14em] uppercase text-[#484848] font-semibold mb-[6px]";

  return (
    <div className="min-h-screen bg-[#F9F7F5]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-[560px] mx-auto px-6 py-14">
        {/* Brand header */}
        <a href="/" className="inline-block mb-10">
          <div style={{ fontFamily: "'Cinzel', serif" }} className="text-[10px] tracking-[.22em] uppercase text-[#C65D3B] font-semibold">Jade and Bloom</div>
          <div style={{ fontFamily: "'Cinzel', serif" }} className="text-[18px] tracking-[.06em] text-[#0D0D0D] font-bold">← Back to store</div>
        </a>

        <div className="text-[9px] tracking-[.25em] uppercase text-[#C65D3B] font-semibold mb-2">Verified Review</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[32px] font-normal text-[#0D0D0D] mb-2">Share your experience</h1>
        <p className="text-[13px] text-[#696969] leading-[1.6] mb-8">
          Your review will be visible on our website 7 days after your purchase date, once verified. No spam — just real feedback from real customers.
        </p>

        {submitted ? (
          <div className="bg-white border border-[#EBEBEB] rounded-[8px] p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-[#E8F5EC] flex items-center justify-center mx-auto mb-5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5 9-9" stroke="#22863A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[24px] text-[#0D0D0D] mb-2">Thank you!</h2>
            <p className="text-[13px] text-[#696969] leading-[1.6] max-w-[360px] mx-auto">
              Your review has been submitted. It will appear on our website 7 days after your purchase is confirmed — no further action needed.
            </p>
            <a href="/" className="mt-6 inline-block text-[11px] font-bold tracking-[.14em] uppercase text-[#C65D3B] hover:underline">
              Return to store
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-[#EBEBEB] rounded-[8px] p-7 space-y-5">
            {/* Product */}
            <div>
              <label className={lbl}>Product <span className="text-[#C65D3B]">*</span></label>
              <select
                value={form.productLabel}
                onChange={(e) => handleProductChange(e.target.value)}
                className={`${inp} cursor-pointer`}
                required
              >
                <option value="">Select product</option>
                {PRODUCTS.map((p) => (
                  <option key={p.handle} value={p.label}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* Order ID */}
            <div>
              <label className={lbl}>Shopify Order ID <span className="text-[#C65D3B]">*</span></label>
              <input
                type="text"
                value={form.orderId}
                onChange={(e) => set("orderId", e.target.value)}
                placeholder="e.g. #1001"
                className={inp}
                required
              />
              <p className="text-[10px] text-[#969696] mt-1">Found in your order confirmation email.</p>
            </div>

            {/* Star rating */}
            <div>
              <label className={lbl}>Your Rating <span className="text-[#C65D3B]">*</span></label>
              <StarPicker value={form.rating} onChange={(v) => set("rating", v)} />
              {form.rating > 0 && (
                <p className="text-[11px] text-[#969696] mt-1">
                  {["", "Poor", "Below average", "Average", "Good", "Excellent"][form.rating]}
                </p>
              )}
            </div>

            {/* Name + City */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Your Name <span className="text-[#C65D3B]">*</span></label>
                <input type="text" value={form.customerName} onChange={(e) => set("customerName", e.target.value)}
                  placeholder="Priya M." className={inp} required />
              </div>
              <div>
                <label className={lbl}>City</label>
                <input type="text" value={form.city} onChange={(e) => set("city", e.target.value)}
                  placeholder="Mumbai" className={inp} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className={lbl}>Email <span className="text-[#C65D3B]">*</span></label>
              <input type="email" value={form.customerEmail} onChange={(e) => set("customerEmail", e.target.value)}
                placeholder="you@email.com" className={inp} required />
              <p className="text-[10px] text-[#969696] mt-1">Used to verify your purchase. Not shown publicly.</p>
            </div>

            {/* Title */}
            <div>
              <label className={lbl}>Review Title</label>
              <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Skin cleared up in 2 weeks" className={inp} />
            </div>

            {/* Body */}
            <div>
              <label className={lbl}>Your Review <span className="text-[#C65D3B]">*</span></label>
              <textarea
                value={form.body}
                onChange={(e) => set("body", e.target.value)}
                rows={4}
                placeholder="Tell others what you liked, how your skin responded, how long you've been using it..."
                className={`${inp} resize-none`}
                required
              />
            </div>

            {error && (
              <div className="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-[4px] px-3 py-2">{error}</div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-[13px] bg-[#C65D3B] text-white text-[11px] font-bold tracking-[.18em] uppercase rounded-[4px] hover:bg-[#A84828] transition-colors disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>

            <p className="text-[10px] text-[#ABABAB] text-center">
              Reviews are verified against your order and approved by our team before publishing.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
