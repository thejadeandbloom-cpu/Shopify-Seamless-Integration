import { useEffect, useRef, useState } from "react";

const INGREDIENTS = [
  {
    ingredient: "Vitamin C",
    product: "Vitamin C Serum",
    jbValue: 14,
    jbLabel: "14%",
    decimals: 0,
    industryLabel: "avg 5%",
    industry: 5,
    max: 16,
    multiplier: "2.8×",
    benefit: "Fades dark spots · Boosts collagen · Brightens skin",
  },
  {
    ingredient: "Green Tea Extract",
    product: "Green Tea Face Wash",
    jbValue: 2.0,
    jbLabel: "2.0%",
    decimals: 1,
    industryLabel: "avg 0.1%",
    industry: 0.1,
    max: 2.2,
    multiplier: "20×",
    benefit: "Controls oil · Soothes inflammation · Antioxidant defence",
  },
  {
    ingredient: "Hyaluronic Acid",
    product: "Kojic Acid Moisturizer",
    jbValue: 5,
    jbLabel: "5%",
    decimals: 0,
    industryLabel: "avg 2%",
    industry: 2,
    max: 5.5,
    multiplier: "2.5×",
    benefit: "Deep hydration · Plumps skin · Strengthens barrier",
  },
  {
    ingredient: "Kojic Acid",
    product: "Kojic Acid Moisturizer",
    jbValue: 1,
    jbLabel: "1%",
    decimals: 0,
    industryLabel: "avg 0.2%",
    industry: 0.2,
    max: 1.2,
    multiplier: "5×",
    benefit: "Blocks melanin · Targets hyperpigmentation · Even tone",
  },
];

const FEATURES = [
  { label: "Fragrance-Free", sub: "No irritants" },
  { label: "pH Balanced (4.5–5.5)", sub: "Barrier-safe" },
  { label: "30-Day Guarantee", sub: "Full refund if it doesn't work" },
  { label: "Built for Indian Skin", sub: "Melanin-rich · Indian climate" },
  { label: "Complete Routine", sub: "4 products formulated together" },
  { label: "COD Available", sub: "Pay on delivery" },
];

const PRICE_CARDS = [
  { product: "Face Wash", active: "2% Green Tea + 1.5% Salicylic", price: "₹269", was: "₹399" },
  { product: "Vitamin C Serum", active: "14% Vitamin C (vs avg 5%)", price: "₹618", was: "₹899" },
  { product: "Moisturizer", active: "1% Kojic Acid + 5% Vit C", price: "₹449", was: "₹599" },
  { product: "Sunscreen SPF 50", active: "PA++++ · Reef-safe formula", price: "₹489", was: "₹699" },
];

function useCounter(target: number, decimals: number, trigger: boolean, duration = 1000) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!trigger) return;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(parseFloat((eased * target).toFixed(decimals)));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setValue(target);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [trigger, target, decimals, duration]);

  return value;
}

function IngredientCard({ row, animate }: { row: typeof INGREDIENTS[0]; animate: boolean }) {
  const count = useCounter(row.jbValue, row.decimals, animate, 1200);
  const jbWidth = (row.jb / row.max) * 100;
  const industryWidth = (row.industry / row.max) * 100;

  return (
    <div className="bg-white/[0.05] border border-white/10 rounded-[10px] p-4 sm:p-5 flex flex-col gap-3">

      {/* Ingredient name + product */}
      <div>
        <span
          style={{ fontFamily: "'Cinzel', serif" }}
          className="text-white text-[12px] sm:text-[13px] md:text-[14px] font-semibold tracking-[.04em] block leading-tight"
        >
          {row.ingredient}
        </span>
        <span className="text-white/35 text-[10px] mt-[3px] block leading-tight">in {row.product}</span>
      </div>

      {/* Big counter number */}
      <div>
        <span
          style={{ fontFamily: "'Cinzel', serif" }}
          className="text-[#C65D3B] text-[38px] sm:text-[42px] md:text-[46px] font-semibold leading-none tabular-nums"
        >
          {row.decimals > 0 ? count.toFixed(row.decimals) : Math.round(count)}%
        </span>
      </div>

      {/* Multiplier badge — below the number */}
      <span className="text-[10px] sm:text-[11px] font-bold text-[#C65D3B] bg-[#C65D3B]/15 px-2 py-[4px] rounded-full tracking-[.03em] w-fit">
        {row.multiplier} the industry
      </span>

      {/* Bars — below the badge */}
      <div className="flex flex-col gap-[10px] pt-1">

        {/* J&B bar */}
        <div>
          <div className="flex items-center justify-between mb-[5px]">
            <span className="text-[8px] sm:text-[8.5px] tracking-[.15em] uppercase font-bold text-[#C65D3B]">
              Jade &amp; Bloom
            </span>
            <span
              style={{ fontFamily: "'Cinzel', serif" }}
              className="text-[#C65D3B] text-[10px] sm:text-[11px] font-bold"
            >
              {row.jbLabel}
            </span>
          </div>
          <div className="h-[7px] sm:h-[8px] bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#C65D3B] rounded-full"
              style={{
                width: animate ? `${jbWidth}%` : "0%",
                transition: animate ? "width 1.2s cubic-bezier(.16,1,.3,1)" : "none",
              }}
            />
          </div>
        </div>

        {/* Industry bar */}
        <div>
          <div className="flex items-center justify-between mb-[5px]">
            <span className="text-[8px] sm:text-[8.5px] tracking-[.15em] uppercase font-bold text-white/30">
              Industry avg
            </span>
            <span className="text-white/30 text-[10px] sm:text-[11px] font-bold">{row.industryLabel}</span>
          </div>
          <div className="h-[7px] sm:h-[8px] bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/25 rounded-full"
              style={{
                width: animate ? `${industryWidth}%` : "0%",
                transition: animate ? "width 1.2s cubic-bezier(.16,1,.3,1) 200ms" : "none",
              }}
            />
          </div>
        </div>
      </div>

      {/* Benefit text */}
      <p className="text-white/40 text-[10px] leading-[1.6] border-t border-white/[0.07] pt-3 mt-auto">
        {row.benefit}
      </p>
    </div>
  );
}

export default function FormulationAndComparison() {
  const ref = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setAnimate(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="bg-[#0D0D0D] px-4 sm:px-6 md:px-10 lg:px-16 py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="mb-8 sm:mb-10 md:mb-14">
          <div className="text-[10px] tracking-[.25em] uppercase text-[#C65D3B] font-semibold mb-3 sm:mb-4">
            Formulation Science
          </div>
          <h2
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-[clamp(24px,5vw,52px)] leading-[1.15] font-normal text-white mb-3 sm:mb-4"
          >
            Most brands use trace amounts.{" "}
            <span className="italic text-[#C65D3B]">We use clinical doses.</span>
          </h2>
          <p className="text-white/45 text-[13px] sm:text-[14px] leading-[1.75] max-w-[560px]">
            Every active is dosed at the concentration where science says it works — not the minimum needed to appear on the label.
          </p>
        </div>

        {/* Ingredient Cards — 2-col on mobile, 4-col on md+ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-12 md:mb-16">
          {INGREDIENTS.map((row) => (
            <IngredientCard key={row.ingredient} row={row} animate={animate} />
          ))}
        </div>

        {/* Feature checklist */}
        <div className="border-t border-white/10 pt-8 sm:pt-10 mb-10 sm:mb-12 md:mb-16">
          <p className="text-white/35 text-[10px] tracking-[.22em] uppercase font-semibold mb-5 sm:mb-6">
            What else sets us apart
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="flex items-start gap-3 bg-white/[0.04] border border-white/[0.08] rounded-[8px] px-3 sm:px-4 py-3 min-h-[52px]"
              >
                <span className="mt-[2px] flex-none inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-[#C65D3B]/20">
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                    <path d="M1.5 4.5l2.25 2.25 3.75-4.5" stroke="#C65D3B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div>
                  <p className="text-white text-[11px] sm:text-[12px] font-semibold leading-tight">{f.label}</p>
                  <p className="text-white/35 text-[10px] mt-[2px] leading-snug">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price breakdown */}
        <div className="border-t border-white/10 pt-8 sm:pt-10">
          <p className="text-white/35 text-[10px] tracking-[.22em] uppercase font-semibold mb-5 sm:mb-6">
            Every product. Clinical dose. Fair price.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
            {PRICE_CARDS.map((item) => (
              <div key={item.product} className="bg-white/[0.04] border border-white/[0.08] rounded-[8px] p-3 sm:p-4">
                <p className="text-white/45 text-[9px] tracking-[.14em] uppercase font-semibold mb-1">{item.product}</p>
                <p className="text-white/30 text-[10px] leading-[1.5] mb-2 sm:mb-3">{item.active}</p>
                <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
                  <span style={{ fontFamily: "'Cinzel', serif" }} className="text-[#C65D3B] text-[18px] sm:text-[20px] font-semibold">
                    {item.price}
                  </span>
                  <span className="text-white/20 text-[10px] sm:text-[11px] line-through">{item.was}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-white/40 text-[12px]">Full routine total</p>
              <p style={{ fontFamily: "'Cinzel', serif" }} className="text-white text-[20px] sm:text-[22px] font-semibold mt-[2px]">
                ₹1,825{" "}
                <span className="text-white/25 text-[12px] sm:text-[13px] font-normal line-through">₹2,596</span>
              </p>
              <p className="text-[#C65D3B] text-[10px] font-semibold mt-[2px] tracking-[.06em]">
                Save 10% more with code FIRST10
              </p>
            </div>
            <a
              href="#products"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex-none px-6 sm:px-8 py-3 sm:py-4 bg-[#C65D3B] text-white text-[10px] tracking-[.2em] uppercase font-bold rounded-[2px] hover:bg-[#A84828] active:bg-[#A84828] transition-colors text-center touch-manipulation"
            >
              Shop the Routine
            </a>
          </div>

          <p className="text-white/20 text-[10px] mt-5 sm:mt-6 text-center">
            Industry average figures based on publicly available formulation data. Comparisons are illustrative.
          </p>
        </div>

      </div>
    </div>
  );
}
