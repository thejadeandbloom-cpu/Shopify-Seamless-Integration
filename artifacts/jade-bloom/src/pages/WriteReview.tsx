import { useState, useEffect, useRef } from "react";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

const BASE_URL = import.meta.env.BASE_URL ?? "/";
const API_BASE = `${BASE_URL}api`.replace(/\/+/g, "/");

const PRODUCTS = [
  { handle: "green-tea-face-wash",      label: "Green Tea Face Wash" },
  { handle: "14-vitamin-c-serum",       label: "Vitamin C Serum" },
  { handle: "brightening-moisturiser",  label: "Kojic Acid Moisturizer" },
  { handle: "fluid-sunscreen-spf-50",   label: "Fluid Sunscreen SPF 50" },
];

const RATING_LABELS = ["", "Poor", "Below average", "Average", "Good", "Excellent"];

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)}
          className="text-[36px] leading-none transition-all duration-100 hover:scale-110"
          style={{ color: n <= (hovered || value) ? "#C8902A" : "#E0D9D0" }}
          aria-label={`${n} star`}>★</button>
      ))}
    </div>
  );
}

export default function WriteReview() {
  const { customer } = useCustomerAuth();
  const params     = new URLSearchParams(window.location.search);
  const reviewId   = params.get("reviewId") ?? "";
  const preProduct = params.get("product") ?? "";
  const preEmail   = params.get("email") ?? customer?.email ?? "";
  const preOrder   = params.get("order") ?? "";
  const isEdit     = !!reviewId;

  const preHandle = PRODUCTS.find((p) => p.handle === preProduct || p.label === preProduct)?.label ?? "";

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
    imageUrl:      "",
  });

  const [imagePreview, setImagePreview]   = useState("");
  const [submitting,   setSubmitting]     = useState(false);
  const [submitted,    setSubmitted]      = useState(false);
  const [error,        setError]          = useState("");
  const [loadingEdit,  setLoadingEdit]    = useState(isEdit);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing review when editing
  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/reviews/${reviewId}?email=${encodeURIComponent(preEmail)}`);
        if (!res.ok) { setError("Could not load your review. Please try again."); setLoadingEdit(false); return; }
        const data = await res.json() as {
          productHandle: string; productLabel: string; customerName: string;
          customerEmail: string; city: string; orderId: string; rating: number;
          title: string; body: string; imageUrl: string;
        };
        const label = data.productLabel || PRODUCTS.find(p => p.handle === data.productHandle)?.label || "";
        setForm({
          productLabel:  label,
          productHandle: data.productHandle,
          customerEmail: data.customerEmail,
          orderId:       data.orderId,
          rating:        data.rating,
          body:          data.body,
          customerName:  data.customerName,
          city:          data.city,
          title:         data.title,
          imageUrl:      data.imageUrl || "",
        });
        if (data.imageUrl) setImagePreview(data.imageUrl);
      } catch {
        setError("Failed to load review.");
      } finally {
        setLoadingEdit(false);
      }
    };
    load();
  }, [isEdit, reviewId, preEmail]);

  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const handleProductChange = (label: string) => {
    const p = PRODUCTS.find((p) => p.label === label);
    setForm((f) => ({ ...f, productLabel: label, productHandle: p?.handle ?? "" }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { setError("Image must be under 3 MB."); return; }
    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setForm((f) => ({ ...f, imageUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview("");
    setForm((f) => ({ ...f, imageUrl: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productLabel) { setError("Please select which product you're reviewing."); return; }
    if (!form.rating)       { setError("Please select a star rating."); return; }
    if (!form.body.trim())  { setError("Please write your review."); return; }
    if (!isEdit && !form.orderId.trim()) { setError("Please enter your order number for verification."); return; }
    setError(""); setSubmitting(true);

    try {
      let res: Response;
      if (isEdit) {
        res = await fetch(`${API_BASE}/reviews/${reviewId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email:        form.customerEmail.trim(),
            rating:       form.rating,
            title:        form.title.trim(),
            body:         form.body.trim(),
            imageUrl:     form.imageUrl,
            city:         form.city.trim(),
            customerName: form.customerName.trim(),
          }),
        });
      } else {
        res = await fetch(`${API_BASE}/reviews`, {
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
            imageUrl:      form.imageUrl,
          }),
        });
      }

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

  if (loadingEdit) {
    return (
      <div className="min-h-screen bg-[#F9F7F5] flex items-center justify-center" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="text-[13px] text-[#969696]">Loading your review…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F7F5]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-[540px] mx-auto px-5 py-10">

        {submitted ? (
          <div className="bg-white border border-[#EBEBEB] rounded-[10px] p-10 text-center shadow-sm">
            <div className="w-14 h-14 rounded-full bg-[#E8F5EC] flex items-center justify-center mx-auto mb-5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5 9-9" stroke="#22863A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[26px] text-[#0D0D0D] mb-2">
              {isEdit ? "Review updated!" : "Thank you!"}
            </h2>
            <p className="text-[13px] text-[#696969] leading-[1.7] max-w-[340px] mx-auto">
              {isEdit
                ? "Your changes have been saved and will be re-reviewed by our team before going live."
                : "Your review has been received. It'll appear on our website after our team verifies it — usually within 7 days."}
            </p>
            <div className="flex gap-3 justify-center mt-7">
              <a href="/my-orders" className="px-5 py-3 border border-[#C65D3B] text-[#C65D3B] text-[11px] font-bold tracking-[.14em] uppercase rounded-[3px] hover:bg-[#FFF5F2] transition-colors">
                My reviews
              </a>
              <a href="/" className="px-5 py-3 bg-[#C65D3B] text-white text-[11px] font-bold tracking-[.14em] uppercase rounded-[3px] hover:bg-[#A84828] transition-colors">
                Back to store
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>

            {/* Badge */}
            {isEdit && (
              <div className="bg-[#FFF5F2] border border-[#F2D4C8] rounded-[6px] px-4 py-3 mb-5 text-[12px] text-[#C65D3B] font-semibold">
                Editing your review for <span className="text-[#0D0D0D]">{form.productLabel}</span>
              </div>
            )}

            {/* ── SECTION 1: The review ── */}
            <div className="bg-white border border-[#EBEBEB] rounded-[10px] p-6 mb-4 shadow-sm">
              <div className="text-[9px] tracking-[.25em] uppercase text-[#C65D3B] font-semibold mb-1">
                {isEdit ? "Edit review" : "Step 1 of 2"}
              </div>
              <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[24px] font-normal text-[#0D0D0D] mb-5">Your review</h1>

              {/* Product — locked in edit mode */}
              {!isEdit && (
                <div className="mb-5">
                  <label className="block text-[12px] font-semibold text-[#0D0D0D] mb-2">Which product are you reviewing?</label>
                  <select value={form.productLabel} onChange={(e) => handleProductChange(e.target.value)} className={`${inp} cursor-pointer`}>
                    <option value="">Select a product…</option>
                    {PRODUCTS.map((p) => (
                      <option key={p.handle} value={p.label}>{p.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Star rating */}
              <div className="mb-5">
                <label className="block text-[12px] font-semibold text-[#0D0D0D] mb-3">How would you rate it?</label>
                <StarPicker value={form.rating} onChange={(v) => set("rating", v)} />
                {form.rating > 0 && (
                  <p className="text-[12px] text-[#C65D3B] font-semibold mt-2">{RATING_LABELS[form.rating]}</p>
                )}
              </div>

              {/* Review body */}
              <div className="mb-5">
                <label className="block text-[12px] font-semibold text-[#0D0D0D] mb-2">Tell us about your experience</label>
                <textarea value={form.body} onChange={(e) => set("body", e.target.value)}
                  rows={4} placeholder="What did you like? How did your skin respond? How long have you been using it?"
                  className={`${inp} resize-none`} />
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-[12px] font-semibold text-[#0D0D0D] mb-2">
                  Add a photo <span className="text-[#C65D3B] font-normal">(optional)</span>
                </label>
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="Preview" className="w-full max-h-[200px] object-cover rounded-[6px] border border-[#EBEBEB]" />
                    <button type="button" onClick={removeImage}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2L2 10" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#EBEBEB] rounded-[6px] p-6 text-center cursor-pointer hover:border-[#C65D3B] hover:bg-[#FFF9F7] transition-colors"
                  >
                    <div className="text-[28px] mb-2">📷</div>
                    <p className="text-[12px] text-[#969696]">Click to upload a photo of your results</p>
                    <p className="text-[10px] text-[#ABABAB] mt-1">JPG, PNG or WEBP · Max 3 MB</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange} className="hidden" />
              </div>
            </div>

            {/* ── SECTION 2: Details ── */}
            <div className="bg-white border border-[#EBEBEB] rounded-[10px] p-6 mb-4 shadow-sm">
              <div className="text-[9px] tracking-[.25em] uppercase text-[#C65D3B] font-semibold mb-1">
                {isEdit ? "Your details" : "Step 2 of 2"}
              </div>
              <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[20px] font-normal text-[#0D0D0D] mb-1">A few details</h2>
              <p className="text-[12px] text-[#969696] mb-5">Your name and city are shown on the review — leave blank to appear as "Verified Buyer".</p>

              {/* Email + Order */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#484848] tracking-[.08em] uppercase mb-[6px]">
                    Email <span className="text-[#969696] font-normal normal-case tracking-normal">(for verification)</span>
                  </label>
                  <input type="email" value={form.customerEmail} onChange={(e) => set("customerEmail", e.target.value)}
                    placeholder="you@email.com" className={`${inp} ${isEdit ? "bg-[#F9F7F5] text-[#969696]" : ""}`}
                    readOnly={isEdit} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#484848] tracking-[.08em] uppercase mb-[6px]">
                    Order # <span className="text-[#969696] font-normal normal-case tracking-normal">(from email)</span>
                    {!isEdit && <span className="text-[#C65D3B]"> *</span>}
                  </label>
                  <input type="text" value={form.orderId} onChange={(e) => set("orderId", e.target.value)}
                    placeholder="#1001" className={`${inp} ${isEdit ? "bg-[#F9F7F5] text-[#969696]" : ""}`}
                    readOnly={isEdit} />
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

            <button type="submit" disabled={submitting}
              className="w-full py-[14px] bg-[#C65D3B] text-white text-[11px] font-bold tracking-[.18em] uppercase rounded-[4px] hover:bg-[#A84828] transition-colors disabled:opacity-60 shadow-sm">
              {submitting ? (isEdit ? "Saving…" : "Submitting…") : (isEdit ? "Save Changes" : "Submit My Review")}
            </button>

            <p className="text-[10px] text-[#ABABAB] text-center mt-3">
              {isEdit
                ? "Edited reviews are re-reviewed by our team before publishing."
                : "Reviews are verified by our team · One review per product · Visible 7 days after purchase"}
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
