import { useState, useEffect } from "react";
import { X, Tag } from "lucide-react";
import { useCart } from "@/context/CartContext";

const STORAGE_KEY = "jb_lead_dismissed";
const DELAY_MS    = 12000;
const BASE        = import.meta.env.BASE_URL ?? "/";
const API         = `${BASE}api`.replace(/\/+/g, "/");

type View = "offers" | "whatsapp";

export default function LeadCapturePopup() {
  const [visible,  setVisible]  = useState(false);
  const [view,     setView]     = useState<View>("offers");
  const [phone,    setPhone]    = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const { openOverlay, closeOverlay } = useCart();

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    const timer = setTimeout(() => setVisible(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (visible) openOverlay();
    else closeOverlay();
  }, [visible]);

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  const handleWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 10) { setError("Please enter a valid 10-digit number."); return; }
    setError("");
    setLoading(true);
    try {
      await fetch(`${API}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleaned, source: "popup" }),
      });
    } catch { /* silent */ } finally { setLoading(false); }

    const waNumber = import.meta.env.VITE_WHATSAPP_NUMBER ?? "918750557322";
    const msg = encodeURIComponent(
      `Hi! I visited the Jade and Bloom website and would like my 15% bundle discount (BUNDLE15). My number is +91${cleaned.slice(-10)}.`
    );
    window.open(`https://wa.me/${waNumber}?text=${msg}`, "_blank", "noopener");
    setSubmitted(true);
    sessionStorage.setItem(STORAGE_KEY, "1");
    setTimeout(() => setVisible(false), 3000);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[10001] flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={dismiss} />

      <div
        className="relative w-full max-w-[420px] bg-white rounded-[12px] overflow-hidden shadow-2xl"
        style={{ animation: "slideUp .35s cubic-bezier(.16,1,.3,1) both" }}
      >
        <style>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(32px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        <div className="h-[5px] bg-gradient-to-r from-[#C65D3B] to-[#C8902A]" />

        <button
          onClick={dismiss}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#F2EDE8] transition-colors text-[#969696]"
          aria-label="Close"
        >
          <X size={15} />
        </button>

        <div className="px-7 pt-6 pb-7">

          {/* ── VIEW: Offers (default) ── */}
          {view === "offers" && !submitted && (
            <>
              <div className="text-[9px] tracking-[.22em] uppercase text-[#C65D3B] font-semibold mb-1">
                Member Offers
              </div>
              <h2
                style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-[22px] leading-[1.3] font-normal text-[#0D0D0D] mb-1"
              >
                Login to unlock exclusive discounts
              </h2>
              <p className="text-[12px] text-[#696969] leading-[1.6] mb-5">
                Logged-in members get access to two exclusive offers not available at checkout without an account.
              </p>

              {/* Offer cards */}
              <div className="space-y-2 mb-5">
                <div className="flex items-center gap-3 bg-[#FFF8F5] border border-[#F2D4C8] rounded-[8px] px-4 py-3">
                  <Tag size={15} className="text-[#C65D3B] flex-shrink-0" />
                  <div>
                    <div className="text-[12px] font-bold text-[#C65D3B]">FIRST10 — 10% off your first order</div>
                    <div className="text-[11px] text-[#696969]">For new members on any single product</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-[#FFF8F5] border border-[#F2D4C8] rounded-[8px] px-4 py-3">
                  <Tag size={15} className="text-[#C65D3B] flex-shrink-0" />
                  <div>
                    <div className="text-[12px] font-bold text-[#C65D3B]">BUNDLE15 — 15% off the full routine</div>
                    <div className="text-[11px] text-[#696969]">All 4 products together — best value</div>
                  </div>
                </div>
              </div>

              {/* Primary CTA */}
              <a
                href="/my-orders"
                className="block w-full text-center bg-[#C65D3B] text-white py-[13px] text-[11px] font-bold tracking-[.16em] uppercase rounded-[4px] hover:bg-[#A84828] transition-colors mb-3"
                onClick={() => sessionStorage.setItem(STORAGE_KEY, "1")}
              >
                Login / Create account
              </a>

              {/* Secondary — get bundle code via WhatsApp */}
              <button
                type="button"
                onClick={() => setView("whatsapp")}
                className="block w-full text-center border border-[#EBEBEB] text-[#484848] py-[11px] text-[11px] font-semibold tracking-[.1em] uppercase rounded-[4px] hover:border-[#C65D3B] hover:text-[#C65D3B] transition-colors mb-4"
              >
                Get BUNDLE15 on WhatsApp instead
              </button>

              {/* Guest option */}
              <p className="text-[10px] text-[#ABABAB] text-center">
                <button onClick={dismiss} className="underline hover:text-[#969696] transition-colors">
                  Continue as guest
                </button>
                {" "}— checkout works, but member discounts won't apply.
              </p>
            </>
          )}

          {/* ── VIEW: WhatsApp number entry ── */}
          {view === "whatsapp" && !submitted && (
            <>
              <button
                type="button"
                onClick={() => setView("offers")}
                className="text-[10px] text-[#969696] hover:text-[#C65D3B] transition-colors mb-4 flex items-center gap-1"
              >
                ← Back
              </button>
              <div className="text-[9px] tracking-[.22em] uppercase text-[#C65D3B] font-semibold mb-1">
                Bundle Offer
              </div>
              <h2
                style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-[22px] leading-[1.3] font-normal text-[#0D0D0D] mb-2"
              >
                Save 15% on the complete routine
              </h2>
              <p className="text-[12px] text-[#696969] leading-[1.6] mb-5">
                Drop your WhatsApp number and we'll send you the <strong>BUNDLE15</strong> code directly.
              </p>

              <form onSubmit={handleWhatsApp} className="space-y-3">
                <div className="flex items-center border border-[#EBEBEB] rounded-[4px] overflow-hidden focus-within:border-[#C65D3B] transition-colors">
                  <span className="px-3 text-[13px] text-[#484848] bg-[#F9F7F5] border-r border-[#EBEBEB] h-full flex items-center py-3 select-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="WhatsApp number"
                    maxLength={10}
                    className="flex-1 px-3 py-3 text-[13px] text-[#0D0D0D] outline-none bg-white placeholder:text-[#ABABAB]"
                    autoFocus
                  />
                </div>
                {error && <p className="text-[11px] text-red-500">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#C65D3B] text-white py-[13px] text-[10px] font-bold tracking-[.18em] uppercase rounded-[3px] hover:bg-[#A84828] transition-colors disabled:opacity-60"
                >
                  {loading ? "Saving…" : "Send My 15% Bundle Code"}
                </button>
              </form>
              <p className="text-[10px] text-[#ABABAB] mt-3 text-center">We'll message you on WhatsApp. Unsubscribe anytime.</p>
            </>
          )}

          {/* ── Submitted confirmation ── */}
          {submitted && (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-[#E8F5EC] flex items-center justify-center mx-auto mb-4">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l5 5 7-7" stroke="#22863A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[20px] text-[#0D0D0D] mb-2">Number saved!</h3>
              <p className="text-[13px] text-[#484848]">
                Your WhatsApp is opening — send the message to get your <strong>BUNDLE15</strong> code.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
