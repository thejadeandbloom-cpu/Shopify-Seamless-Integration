import { useEffect, useRef, useState } from "react";

const ROWS = [
  {
    ingredient: "Vitamin C",
    benefit: "Fades dark spots · Boosts collagen · Brightens skin",
    jb: 14,
    jbLabel: "14%",
    industry: 5,
    industryLabel: "Avg 5%",
    max: 16,
  },
  {
    ingredient: "Green Tea Extract",
    benefit: "Controls oil · Soothes inflammation · Antioxidant defence",
    jb: 20,
    jbLabel: "2.0%",
    industry: 1,
    industryLabel: "Avg 0.1%",
    max: 22,
  },
  {
    ingredient: "Hyaluronic Acid",
    benefit: "Deep hydration · Plumps skin · Strengthens barrier",
    jb: 50,
    jbLabel: "5%",
    industry: 20,
    industryLabel: "Avg 2%",
    max: 55,
  },
  {
    ingredient: "Kojic Acid",
    benefit: "Blocks melanin · Targets hyperpigmentation · Even tone",
    jb: 10,
    jbLabel: "1%",
    industry: 2,
    industryLabel: "Avg 0.2%",
    max: 12,
  },
];

function Bar({ row, animate }: { row: typeof ROWS[0]; animate: boolean }) {
  return (
    <div className="mb-8 md:mb-10 last:mb-0">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span
            style={{ fontFamily: "'Cinzel', serif" }}
            className="text-white text-[14px] md:text-[16px] font-semibold tracking-[.04em]"
          >
            {row.ingredient}
          </span>
          <p className="text-white/45 text-[11px] mt-[2px] leading-[1.5]">{row.benefit}</p>
        </div>
      </div>

      {/* J&B bar */}
      <div className="mb-2">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-[9px] tracking-[.18em] uppercase font-bold text-[#C65D3B] w-[90px] flex-none">
            Jade &amp; Bloom
          </span>
          <span
            style={{ fontFamily: "'Cinzel', serif" }}
            className="text-[#C65D3B] text-[13px] font-bold"
          >
            {row.jbLabel}
          </span>
        </div>
        <div className="h-[10px] bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#C65D3B] rounded-full transition-all duration-[1200ms] ease-out"
            style={{ width: animate ? `${(row.jb / row.max) * 100}%` : "0%" }}
          />
        </div>
      </div>

      {/* Industry bar */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-[9px] tracking-[.18em] uppercase font-bold text-white/30 w-[90px] flex-none">
            Industry Avg
          </span>
          <span className="text-white/30 text-[13px] font-bold">{row.industryLabel}</span>
        </div>
        <div className="h-[10px] bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-white/25 rounded-full transition-all duration-[1200ms] ease-out"
            style={{
              width: animate ? `${(row.industry / row.max) * 100}%` : "0%",
              transitionDelay: "200ms",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function IngredientBars() {
  const ref = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setAnimate(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="bg-[#0D0D0D] px-4 md:px-16 py-14 md:py-20">
      <div className="max-w-[900px] mx-auto">

        {/* Header */}
        <div className="mb-12 md:mb-16">
          <div className="text-[10px] tracking-[.25em] uppercase text-[#C65D3B] font-semibold mb-4">
            Formulation Science
          </div>
          <h2
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-[clamp(28px,4vw,52px)] leading-[1.15] font-normal text-white mb-4"
          >
            Most brands use 5% Vitamin C.{" "}
            <span className="italic text-[#C65D3B]">We use 14%.</span>
          </h2>
          <p className="text-white/50 text-[14px] leading-[1.7] max-w-[560px]">
            Clinical concentrations aren't a selling point for us — they're the minimum. Every active is dosed at the level where the science says it actually works.
          </p>
        </div>

        {/* Bars */}
        <div className="mb-12 md:mb-16">
          {ROWS.map((row) => (
            <Bar key={row.ingredient} row={row} animate={animate} />
          ))}
        </div>

        {/* Price punch line */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p
              style={{ fontFamily: "'Playfair Display', serif" }}
              className="text-white/70 text-[14px] leading-[1.7]"
            >
              All of this — in a face wash that costs
            </p>
            <p
              style={{ fontFamily: "'Cinzel', serif" }}
              className="text-white text-[28px] md:text-[36px] font-semibold mt-1"
            >
              ₹269.{" "}
              <span className="text-white/35 text-[18px] md:text-[22px] line-through font-normal">
                Competitors charge ₹349–₹399
              </span>
            </p>
          </div>
          <a
            href="#products"
            onClick={(e) => { e.preventDefault(); document.getElementById("products")?.scrollIntoView({ behavior: "smooth" }); }}
            className="flex-none px-8 py-4 bg-[#C65D3B] text-white text-[10px] tracking-[.2em] uppercase font-bold rounded-[2px] hover:bg-[#A84828] transition-colors text-center"
          >
            Shop the Routine
          </a>
        </div>
      </div>
    </div>
  );
}
