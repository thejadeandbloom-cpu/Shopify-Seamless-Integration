import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const FAQS = [
  {
    q: "30-DAY RESULTS GUARANTEE — How does it work?",
    a: "Our 30-day money-back guarantee applies exclusively to the 14% Vitamin C Serum and Kojic Acid Moisturizer when used together as a combination for the full 30 days.\n\nIf you use both products consistently as directed and don't see any visible improvement, we'll refund 100% of your purchase price.\n\nConditions:\n• Applies only to the Vitamin C Serum + Kojic Acid Moisturizer combination — not individual products\n• Both products must be used together, as directed (once or twice daily) for the full 30 days\n• Daily usage log required — a photo or written diary showing 30 days of consistent use\n• Claim must be submitted within 30 days of your purchase date\n• Proof of purchase required — your order confirmation email\n• One claim per customer per 12 months\n• Excludes bulk and bundle purchases\n\nTo submit a claim, use the Refund Claim form in the footer below.",
  },
  {
    q: "What skin types are your products suitable for?",
    a: "All Jade and Bloom products are formulated for Indian skin tones and skin types — oily, dry, combination, and sensitive. Each product is pH-balanced (4.5–5.5) so they work without causing irritation.",
  },
  {
    q: "How soon will I see results?",
    a: "Most customers notice brighter, more even skin within 3–4 weeks of consistent daily use. For deeper concerns like dark spots or pigmentation, visible improvement typically appears between weeks 6 and 12.",
  },
  {
    q: "Can I use the Vitamin C Serum and Kojic Acid Moisturizer together?",
    a: "Yes — this is actually our most recommended pairing. The Vitamin C Serum targets dark spots and boosts glow, while the Kojic Acid Moisturizer locks in hydration and continues brightening through the day. Use serum first, let it absorb, then apply moisturizer.",
  },
  {
    q: "Do I need sunscreen on top?",
    a: "Always. Vitamin C and Kojic Acid make skin more sensitive to UV exposure. Our Fluid Sunscreen SPF 50+ is lightweight, non-greasy, and designed to layer perfectly over the rest of your routine — without that white cast.",
  },
  {
    q: "Are your products free from harmful ingredients?",
    a: "Yes. All products are cruelty-free, paraben-free, and free from harsh sulfates and artificial fragrances. We use actives at clinically effective concentrations, not just for marketing.",
  },
  {
    q: "What is your return and refund policy?",
    a: "We offer a 30-day results guarantee on the Vitamin C Serum + Kojic Acid Moisturizer combination. If you use both products consistently for 30 days and don't see visible improvement, submit a claim with your daily usage log and we'll refund 100%.\n\nThis guarantee does not apply to individual products purchased separately, or to the Face Wash and Sunscreen.\n\nClaims must be submitted within 30 days of purchase. A daily usage log is required.\n\nFor damaged or incorrect orders, share photos via WhatsApp or Instagram and we'll resolve it immediately.",
  },
  {
    q: "How long does shipping take?",
    a: "Orders are dispatched within 24 hours. Standard delivery takes 3–5 business days across India. You'll receive a tracking link as soon as your order ships.",
  },
  {
    q: "Are there any additional shipping charges?",
    a: "No — all product prices are fully inclusive of shipping. What you see is what you pay. No surprise charges at checkout.",
  },
];

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="divide-y divide-[#EBEBEB] border-t border-[#EBEBEB]">
      {FAQS.map((faq, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-start justify-between gap-6 py-5 text-left group"
          >
            <span
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              className="text-[15px] font-semibold text-[#0D0D0D] leading-[1.5] group-hover:text-[#C65D3B] transition-colors"
            >
              {faq.q}
            </span>
            <span className="flex-none mt-[2px] text-[#C65D3B]">
              {open === i ? <Minus size={18} /> : <Plus size={18} />}
            </span>
          </button>

          <div
            className="overflow-hidden transition-all duration-300"
            style={{ maxHeight: open === i ? 800 : 0, opacity: open === i ? 1 : 0 }}
          >
            <div
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              className="text-[14px] leading-[1.75] text-[#484848] pb-5 pr-8 whitespace-pre-line"
            >
              {faq.a}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
