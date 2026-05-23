import { useState } from "react";

const AM_STEPS = [
  {
    step: 1,
    label: "Cleanse",
    product: "2% Green Tea Face Wash",
    instruction: "Wet face, apply a small amount, massage gently for 30 seconds in circular motions. Rinse with lukewarm water and pat dry.",
    tip: "Don't rub — pat dry to keep skin barrier intact.",
    color: "#4CAF82",
  },
  {
    step: 2,
    label: "Treat",
    product: "14% Vitamin C Serum",
    instruction: "Take 3–4 drops on fingertips. Press gently into skin — forehead, cheeks, chin. Let absorb for 60 seconds before next step.",
    tip: "Don't rub. Press and hold for better absorption.",
    color: "#D93025",
  },
  {
    step: 3,
    label: "Moisturise",
    product: "Kojic Acid + Vitamin C Moisturizer",
    instruction: "Take a pea-sized amount. Apply in upward strokes across face and neck. Focus on dry patches and areas with dark spots.",
    tip: "Neck and jawline count too — don't stop at the chin.",
    color: "#2A6BBF",
  },
  {
    step: 4,
    label: "Protect",
    product: "Fluid Sunscreen SPF 50 PA++++",
    instruction: "Apply a generous, even layer as the final step. Cover face, neck, and ears. Reapply every 2–3 hours if outdoors.",
    tip: "SPF is only effective when applied generously. Don't skip.",
    color: "#D4A017",
  },
];

const PM_STEPS = [
  {
    step: 1,
    label: "Cleanse",
    product: "2% Green Tea Face Wash",
    instruction: "Double cleanse if wearing sunscreen. First pass removes SPF; second pass cleans skin. Massage for 60 seconds, rinse well.",
    tip: "Night cleanse is more important than morning — your skin repairs overnight.",
    color: "#4CAF82",
  },
  {
    step: 2,
    label: "Treat",
    product: "14% Vitamin C Serum",
    instruction: "Take 3–4 drops, press into skin. Night application of Vitamin C boosts its brightening effect while your skin regenerates.",
    tip: "Consistent night use accelerates dark spot fading.",
    color: "#D93025",
  },
  {
    step: 3,
    label: "Moisturise",
    product: "Kojic Acid + Vitamin C Moisturizer",
    instruction: "Apply a slightly larger amount than morning. Night is when your skin drinks in hydration. Massage in upward strokes.",
    tip: "No sunscreen needed at night — let the moisturizer do its job.",
    color: "#2A6BBF",
  },
];

type Step = typeof AM_STEPS[0];

function StepCard({ s, index }: { s: Step; index: number }) {
  return (
    <div
      className="flex gap-3 md:gap-5 items-start"
      style={{
        opacity: 0,
        transform: "translateY(16px)",
        animation: `fadeUp 0.4s ease forwards`,
        animationDelay: `${index * 80}ms`,
      }}
    >
      {/* Step number + connector */}
      <div className="flex flex-col items-center flex-none">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-none"
          style={{ background: s.color }}
        >
          {s.step}
        </div>
        {index < 3 && (
          <div className="w-[2px] flex-1 mt-1" style={{ background: `${s.color}30`, minHeight: 32 }} />
        )}
      </div>

      {/* Content */}
      <div className="pb-6 md:pb-8 flex-1">
        <div className="flex items-center gap-3 mb-1">
          <span
            className="text-[9px] tracking-[.2em] uppercase font-bold px-2 py-[3px] rounded-full text-white"
            style={{ background: s.color }}
          >
            {s.label}
          </span>
        </div>
        <h3
          style={{ fontFamily: "'Cinzel', serif" }}
          className="text-[13px] tracking-[.03em] font-semibold text-[#0D0D0D] mb-2 leading-snug"
        >
          {s.product}
        </h3>
        <p
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          className="text-[13px] leading-[1.7] text-[#484848] mb-2"
        >
          {s.instruction}
        </p>
        <div className="flex items-start gap-2">
          <span className="text-[#C65D3B] text-[12px] font-bold flex-none mt-[1px]">Pro tip:</span>
          <span
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-[12px] italic text-[#696969] leading-[1.6]"
          >
            {s.tip}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function HowToUse() {
  const [tab, setTab] = useState<"am" | "pm">("am");
  const steps = tab === "am" ? AM_STEPS : PM_STEPS;

  return (
    <div className="max-w-[780px] mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="text-[10px] tracking-[.25em] uppercase text-[#C65D3B] font-semibold mb-3">
          How to Use
        </div>
        <h2
          style={{ fontFamily: "'Playfair Display', serif" }}
          className="text-[clamp(28px,4vw,48px)] leading-[1.2] font-normal text-[#0D0D0D] mb-3"
        >
          Your daily routine, simplified.
        </h2>
        <p
          style={{ fontFamily: "'Playfair Display', serif" }}
          className="text-[15px] leading-[1.6] text-[#484848]"
        >
          4 products. 5 minutes. Consistent results from week 3.
        </p>
      </div>

      {/* AM / PM toggle */}
      <div className="flex gap-1 bg-[#EBEBEB] rounded-full p-[3px] w-fit mb-10">
        {(["am", "pm"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-6 py-[7px] rounded-full text-[11px] tracking-[.15em] uppercase font-bold transition-all duration-200"
            style={
              tab === t
                ? { background: "#0D0D0D", color: "#fff" }
                : { background: "transparent", color: "#484848" }
            }
          >
            {t === "am" ? "Morning" : "Night"}
          </button>
        ))}
      </div>

      {/* Context line */}
      <div className="mb-8 text-[11px] tracking-[.1em] uppercase text-[#969696] font-medium">
        {tab === "am"
          ? "4 steps · Takes about 5 minutes · Always end with sunscreen"
          : "3 steps · Takes about 4 minutes · No sunscreen needed at night"}
      </div>

      {/* Steps */}
      <div key={tab}>
        {steps.map((s, i) => (
          <StepCard key={s.step} s={s} index={i} />
        ))}
      </div>

      {/* Routine summary pill */}
      <div className="mt-2 bg-white border border-[#EBEBEB] rounded-[8px] px-6 py-4 flex flex-wrap gap-3 items-center">
        <span className="text-[11px] font-semibold text-[#0D0D0D] tracking-[.05em] uppercase">Full routine</span>
        <span className="text-[#EBEBEB]">|</span>
        {(tab === "am" ? AM_STEPS : PM_STEPS).map((s, i, arr) => (
          <span key={s.step} className="flex items-center gap-2 text-[12px] text-[#484848]">
            <span className="w-2 h-2 rounded-full flex-none" style={{ background: s.color }} />
            {s.label}
            {i < arr.length - 1 && <span className="text-[#EBEBEB] ml-1">→</span>}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes fadeUp {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
