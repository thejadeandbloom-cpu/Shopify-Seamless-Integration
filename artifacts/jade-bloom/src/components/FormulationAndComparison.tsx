import { useEffect, useRef, useState } from "react";

const INGREDIENTS = [
  {
    ingredient: "Vitamin C",
    product: "Vitamin C Serum",
    jbLabel: "14%",
    jb: 14,
    industryLabel: "avg 5%",
    industry: 5,
    max: 16,
    multiplier: "2.8×",
    benefit: "Fades dark spots · Boosts collagen · Brightens skin",
  },
  {
    ingredient: "Green Tea Extract",
    product: "Green Tea Face Wash",
    jbLabel: "2.0%",
    jb: 2.0,
    industryLabel: "avg 0.1%",
    industry: 0.1,
    max: 2.2,
    multiplier: "20×",
    benefit: "Controls oil · Soothes inflammation · Antioxidant defence",
  },
  {
    ingredient: "Hyaluronic Acid",
    product: "Kojic Acid Moisturizer",
    jbLabel: "5%",
    jb: 5,
    industryLabel: "avg 2%",
    industry: 2,
    max: 5.5,
    multiplier: "2.5×",
    benefit: "Deep hydration · Plumps skin · Strengthens barrier",
  },
  {
    ingredient: "Kojic Acid",
    product: "Kojic Acid Moisturizer",
    jbLabel: "1%",
    jb: 1,
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

function IngredientCard({ row, animate }: { row: typeof INGREDIENTS[0]; animate: boolean }) {
  const jbWidth = (row.jb / row.max) * 100;
  const industryWidth = (row.industry / row.max) * 100;

  return (
    <div className="bg-white/[0.05] border border-white/10 rounded-[10px] p-5 flex flex-col gap-4">
      {/* Top: name + product */}
      <div>
        <span
          style={{ fontFamily: "'Cinzel', serif" }}
          className="text-white text-[13px] md:text-[14px] font-semibold tracking-[.04em] block leading-tight"
        >
          {row.ingredient}
        </span>
        <span className="text-white/35 text-[10px] mt-[3px] block">in {row.product}</span>
      </div>

      {/* Dose + multiplier */}
      <div className="flex items-end gap-3">
        <span
          style={{ fontFamily: "'Cinzel', serif" }}
          className="text-[#C65D3B] text-[36px] md:text-[40px] font-semibold leading-none"
        >
          {row.jbLabel}
        </span>
        <div className="pb-[3px]">
          <span className="text-[10px] font-bold text-[#C65D3B] bg-[#C65D3B]/15 px-2 py-[3px] rounded-full tracking-[.04em]">
            {row.multiplier} the industry
          </span>
        </div>
      </div>

      {/* Bars */}
      <div className="flex flex-col gap-[10px]">
        {/* J&B bar */}
        <div>
          <div className="flex items-center justify-between mb-[5px]">
            <span className="text-[8.5px] tracking-[.18em] uppercase font-bold text-[#C65D3B]">
              Jade and Bloom
            </span>
            <span
              style={{ fontFamily: "'Cinzel', serif" }}
              className="text-[#C65D3B] text-[11px] font-bold"
            >
              {row.jbLabel}
            </span>
          </div>
          <div className="h-[8px] bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#C65D3B] rounded-full transition-all duration-[1200ms] ease-out"
              style={{ width: animate ? `${jbWidth}%` : "0%" }}
            />
          </div>
        </div>

        {/* Industry bar */}
        <div>
          <div className="flex items-center justify-between mb-[5px]">
            <span className="text-[8.5px] tracking-[.18em] uppercase font-bold text-white/30">
              Industry average
            </span>
            <span className="text-white/30 text-[11px] font-bold">{row.industryLabel}</span>
          </div>
          <div className="h-[8px] bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/25 rounded-full transition-all duration-[1200ms] ease-out"
              style={{ width: animate ? `${industryWidth}%` : "0%", transitionDelay: "200ms" }}
            />
          </div>
        </div>
      </div>

      {/* Benefit */}
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
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="bg-[#0D0D0D] px-4 md:px-16 py-14 md:py-24">
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="mb-10 md:mb-14">
          <div className="text-[10px] tracking-[.25em] uppercase text-[#C65D3B] font-semibold mb-4">
            Formulation Science
          </div>
          <h2
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-[clamp(26px,4vw,52px)] leading-[1.15] font-normal text-white mb-4"
          >
            Most brands use trace amounts.{" "}
            <span className="italic text-[#C65D3B]">We use clinical doses.</span>
          </h2>
          <p className="text-white/45 text-[14px] leading-[1.75] max-w-[560px]">
            Every active is dosed at the concentration where science says it works — not the minimum needed to appear on the label.
          </p>
        </div>

        {/* Ingredient Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-12 md:mb-16">
          {INGREDIENTS.map((row) => (
            <IngredientCard key={row.ingredient} row={row} animate={animate} />
          ))}
        </div>

        {/* Feature checklist */}
        <div className="border-t border-white/10 pt-10 mb-12 md:mb-16">
          <p className="text-white/35 text-[10px] tracking-[.22em] uppercase font-semibold mb-6">
            What else sets us apart
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {FEATURES.map((f) => (
              <div key={f.label} className="flex items-start gap-3 bg-white/[0.04] border border-white/[0.08] rounded-[8px] px-4 py-3">
                <span className="mt-[1px] flex-none inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-[#C65D3B]/20">
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                    <path d="M1.5 4.5l2.25 2.25 3.75-4.5" stroke="#C65D3B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div>
                  <p className="text-white text-[11px] font-semibold leading-tight">{f.label}</p>
                  <p className="text-white/35 text-[10px] mt-[2px] leading-snug">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price breakdown */}
        <div className="border-t border-white/10 pt-10">
          <p className="text-white/35 text-[10px] tracking-[.22em] uppercase font-semibold mb-6">
            Every product. Clinical dose. Fair price.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
            {PRICE_CARDS.map((item) => (
              <div key={item.product} className="bg-white/[0.04] border border-white/[0.08] rounded-[8px] p-4">
                <p className="text-white/45 text-[9px] tracking-[.14em] uppercase font-semibold mb-1">{item.product}</p>
                <p className="text-white/30 text-[10px] leading-[1.5] mb-3">{item.active}</p>
                <div className="flex items-baseline gap-2">
                  <span style={{ fontFamily: "'Cinzel', serif" }} className="text-[#C65D3B] text-[20px] font-semibold">
                    {item.price}
                  </span>
                  <span className="text-white/20 text-[11px] line-through">{item.was}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-white/40 text-[12px]">Full routine total</p>
              <p style={{ fontFamily: "'Cinzel', serif" }} className="text-white text-[22px] font-semibold mt-[2px]">
                ₹1,825{" "}
                <span className="text-white/25 text-[13px] font-normal line-through">₹2,596</span>
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
              className="flex-none px-8 py-4 bg-[#C65D3B] text-white text-[10px] tracking-[.2em] uppercase font-bold rounded-[2px] hover:bg-[#A84828] transition-colors text-center"
            >
              Shop the Routine
            </a>
          </div>

          <p className="text-white/20 text-[10px] mt-6 text-center">
            Industry average figures based on publicly available formulation data. Comparisons are illustrative.
          </p>
        </div>

      </div>
    </div>
  );
}
