import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useCart } from "@/context/CartContext";

const STORAGE_KEY = "jb_lead_dismissed";
const DELAY_MS = 12000;
const BASE = import.meta.env.BASE_URL ?? "/";
const API = `${BASE}api`.replace(/\/+/g, "/");

export default function LeadCapturePopup() {
  const [visible, setVisible] = useState(false);
  const { openOverlay, closeOverlay } = useCart();
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 10) {
      setError("Please enter a valid 10-digit number.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      await fetch(`${API}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleaned, source: "popup" }),
      });
    } catch {
      // Silently continue — don't block the user if network fails
    } finally {
      setLoading(false);
    }

    const waNumber = import.meta.env.VITE_WHATSAPP_NUMBER ?? "918750557322";
    const msg = encodeURIComponent(
      `Hi! I visited the Jade and Bloom website and would like my 10% welcome discount. My number is +91${cleaned.slice(-10)}.`
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
        className="relative w-full max-w-[400px] bg-white rounded-[10px] overflow-hidden shadow-2xl"
        style={{ animation: "slideUp .35s cubic-bezier(.16,1,.3,1) both" }}
      >
        <style>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(32px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        <div className="h-[6px] bg-[#C65D3B]" />

        <button
          onClick={dismiss}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#F2EDE8] transition-colors text-[#969696]"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="px-7 pt-7 pb-8">
          {!submitted ? (
            <>
              <div className="text-[9px] tracking-[.22em] uppercase text-[#C65D3B] font-semibold mb-2">
                Welcome Offer
              </div>
              <h2
                style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-[24px] leading-[1.25] font-normal text-[#0D0D0D] mb-2"
              >
                Get 10% off your first order
              </h2>
              <p className="text-[13px] text-[#484848] leading-[1.6] mb-6">
                Drop your WhatsApp number — we'll send the code directly. No spam, ever.
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
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
                  />
                </div>
                {error && <p className="text-[11px] text-red-500">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#C65D3B] text-white py-[13px] text-[10px] font-bold tracking-[.18em] uppercase rounded-[3px] hover:bg-[#A84828] transition-colors disabled:opacity-60"
                >
                  {loading ? "Saving..." : "Send My 10% Code"}
                </button>
              </form>

              <p className="text-[10px] text-[#ABABAB] mt-3 text-center">
                We'll message you on WhatsApp. Unsubscribe anytime.
              </p>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-[#E8F5EC] flex items-center justify-center mx-auto mb-4">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l5 5 7-7" stroke="#22863A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[20px] text-[#0D0D0D] mb-2">
                Number saved!
              </h3>
              <p className="text-[13px] text-[#484848]">
                Your WhatsApp is opening — send the message to get your <strong>FIRST10</strong> code.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
