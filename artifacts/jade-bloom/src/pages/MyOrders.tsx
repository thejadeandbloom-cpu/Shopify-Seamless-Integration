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

function StatusBadge({ review }: { review: MyReview }) {
  const now = new Date();
  const isLive = review.isApproved && new Date(review.visibleAfter) <= now;
  const isPending = !review.isApproved;
  const isScheduled = review.isApproved && new Date(review.visibleAfter) > now;
  const daysLeft = Math.ceil((new Date(review.visibleAfter).getTime() - now.getTime()) / 864e5);

  if (isLive)      return <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-[3px] rounded-full font-semibold">✓ Live on website</span>;
  if (isPending)   return <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-[3px] rounded-full font-semibold">⏳ Awaiting approval</span>;
  if (isScheduled) return <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-[3px] rounded-full font-semibold">🕐 Goes live in {daysLeft}d</span>;
  return null;
}

export default function MyOrders() {
  const params = new URLSearchParams(window.location.search);
  const [email,      setEmail]      = useState(params.get("email") ?? "");
  const [submitted,  setSubmitted]  = useState(!!params.get("email"));
  const [loading,    setLoading]    = useState(!!params.get("email"));
  const [reviews,    setReviews]    = useState<MyReview[]>([]);
  const [error,      setError]      = useState("");

  const lookup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    setSubmitted(true);
    try {
      const res = await fetch(`${API_BASE}/my-reviews?email=${encodeURIComponent(email.trim())}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json() as MyReview[];
      setReviews(data);
    } catch {
      setError("Could not load your reviews. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.get("email")) lookup();
  }, []);

  const reviewedProducts = new Set(reviews.map((r) => r.productLabel));
  const unreviewedProducts = PRODUCTS.filter((p) => !reviewedProducts.has(p.label));

  return (
    <div className="min-h-screen bg-[#F9F7F5]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-[600px] mx-auto px-5 py-12">

        {/* Brand nav */}
        <a href="/" className="inline-flex items-center gap-2 mb-10 group">
          <span style={{ fontFamily: "'Cinzel', serif" }} className="text-[10px] tracking-[.22em] uppercase text-[#C65D3B] font-semibold">Jade and Bloom</span>
          <span className="text-[#EBEBEB]">·</span>
          <span className="text-[12px] text-[#969696] group-hover:text-[#C65D3B] transition-colors">← Back to store</span>
        </a>

        <div className="text-[9px] tracking-[.25em] uppercase text-[#C65D3B] font-semibold mb-1">My Reviews</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[30px] font-normal text-[#0D0D0D] mb-2">Your order history</h1>
        <p className="text-[13px] text-[#696969] leading-[1.6] mb-8">
          Enter the email you used to place your order to see your reviews and write new ones. No password needed.
        </p>

        {/* Email lookup form */}
        <form onSubmit={lookup} className="flex gap-3 mb-8">
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setSubmitted(false); }}
            placeholder="Email used for your order"
            className="flex-1 border border-[#EBEBEB] rounded-[4px] px-4 py-[11px] text-[13px] text-[#0D0D0D] placeholder:text-[#ABABAB] focus:outline-none focus:border-[#C65D3B] transition-colors bg-white"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-[11px] bg-[#C65D3B] text-white text-[11px] font-bold tracking-[.14em] uppercase rounded-[4px] hover:bg-[#A84828] transition-colors disabled:opacity-60 whitespace-nowrap"
          >
            {loading ? "Looking up…" : "Look up"}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-[6px] px-4 py-3 text-[13px] text-red-600 mb-6">{error}</div>
        )}

        {submitted && !loading && (
          <>
            {/* Reviews already written */}
            {reviews.length > 0 && (
              <div className="mb-8">
                <div className="text-[10px] tracking-[.2em] uppercase text-[#484848] font-semibold mb-3">Your reviews ({reviews.length})</div>
                <div className="space-y-3">
                  {reviews.map((r) => (
                    <div key={r.id} className="bg-white border border-[#EBEBEB] rounded-[8px] p-5">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <span className="text-[11px] bg-[#FFF5F2] text-[#C65D3B] border border-[#F2D4C8] px-2 py-[2px] rounded-full font-semibold">{r.productLabel}</span>
                        </div>
                        <StatusBadge review={r} />
                      </div>
                      <div className="text-[#C8902A] text-[14px] tracking-[1px] mb-2">
                        {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                      </div>
                      {r.title && <p className="text-[13px] font-semibold text-[#0D0D0D] mb-1">{r.title}</p>}
                      <p className="text-[13px] text-[#484848] leading-[1.65]">"{r.body}"</p>
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
                  {reviews.length > 0 ? "Other products you can review" : "Write your first review"}
                </div>
                <div className="space-y-2">
                  {unreviewedProducts.map((p) => (
                    <a
                      key={p.handle}
                      href={`/write-review?product=${p.handle}&email=${encodeURIComponent(email)}`}
                      className="flex items-center justify-between bg-white border border-[#EBEBEB] hover:border-[#C65D3B] rounded-[8px] px-5 py-4 transition-colors group"
                    >
                      <span className="text-[13px] font-semibold text-[#0D0D0D] group-hover:text-[#C65D3B] transition-colors">{p.label}</span>
                      <span className="text-[11px] font-bold text-[#C65D3B] tracking-[.08em] uppercase flex items-center gap-1">
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
                No data found for this email.
              </div>
            )}

            {reviews.length === 0 && !loading && unreviewedProducts.length === PRODUCTS.length && (
              <p className="text-[12px] text-[#969696] text-center -mt-6 mb-6">
                No reviews found for this email — but you can still write one for any product you've purchased.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
