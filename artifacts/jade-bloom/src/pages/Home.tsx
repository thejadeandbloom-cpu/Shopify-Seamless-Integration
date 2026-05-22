import { useState, useEffect, useRef } from "react";
import { Instagram, Youtube, ExternalLink, ChevronRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getProduct } from "@/lib/shopify";

const EASE = "cubic-bezier(.16,1,.3,1)";

function useReveal(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add("rv-on"), delay);
          obs.unobserve(el);
        }
      },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return ref;
}

function RevealDiv({ delay = 0, className = "", children }: { delay?: number; className?: string; children: React.ReactNode }) {
  const ref = useReveal(delay);
  return (
    <div
      ref={ref}
      className={`rv ${className}`}
      style={{ opacity: 0, transform: "translateY(28px)", transition: `opacity .6s ${EASE}, transform .6s ${EASE}`, transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const PRODUCTS = [
  {
    handle: "green-tea-face-wash",
    tag: "Acne · Oily Skin · Pores",
    badge: "Clearer skin in 2–3 weeks",
    name: "2% Green Tea Extract Face Wash",
    desc: "1.5% Salicylic Acid clears pores and prevents breakouts. pH-balanced. Won't strip your skin.",
    price: "269",
    was: "349",
    stars: 4.8,
    reviewCount: 124,
    reviewId: "reviews-product-1",
    reviewsCount: 58,
    img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/rn-image_picker_lib_temp_4a417ad0-216e-4d69-973a-667118fc1af8.jpg?v=1779168775",
  },
  {
    handle: "vitamin-c-serum",
    tag: "Dark Spots · Dullness · Aging",
    badge: "Visible glow in 4 weeks",
    name: "14% Vitamin C Face Serum",
    desc: "Brightens. Boosts collagen. Fades dark spots. Lightweight. Won't oxidize. The gold standard of serums.",
    price: "618",
    was: "799",
    stars: 4.8,
    reviewCount: 124,
    reviewId: "reviews-product-2",
    reviewsCount: 52,
    img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/rn-image_picker_lib_temp_dc6610da-ef7f-4601-a220-9a39070ba226.jpg?v=1779168760",
  },
  {
    handle: "kojic-acid-moisturizer",
    tag: "Dryness · Sensitivity · Barrier",
    badge: "Hydrated within minutes",
    name: "1% Kojic Acid + 5% Vitamin C Moisturizer",
    desc: "Locks hydration. Balances pH. Strengthens skin barrier. Non-comedogenic. Lightweight formula.",
    price: "449",
    was: "579",
    stars: 4.7,
    reviewCount: 98,
    reviewId: "reviews-product-3",
    reviewsCount: 48,
    img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/rn-image_picker_lib_temp_e3eac689-1807-47d8-8b98-279a4b3d09a1.png?v=1779168826",
  },
  {
    handle: "fluid-sunscreen",
    tag: "UV Protection · Aging · Pigmentation",
    badge: "Reef-safe & sweat-proof",
    name: "Fluid Sunscreen SPF 50 PA++++",
    desc: "Invisible. Weightless. Won't clog pores. Reef-safe. The only sunscreen your skin will actually use.",
    price: "489",
    was: "629",
    stars: 4.9,
    reviewCount: 147,
    reviewId: "reviews-product-4",
    reviewsCount: 45,
    img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/rn-image_picker_lib_temp_56d282bc-cec2-41e4-a230-e932af58ffc3.jpg?v=1779168858",
  },
];

const CONCERNS = [
  { name: "Dark Spots & Hyperpigmentation", desc: "Vitamin C + Kojic Acid combo targets melanin production and fades stubborn dark spots.", img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/file_00000000c9d0720b9f6ff7cc15836880.png?v=1779352855" },
  { name: "Dull & Tired Skin", desc: "High-strength Vitamin C brightens within weeks and restores that coveted glass skin glow.", img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/file_000000009c3071f8b230607b21e312a7.png?v=1779353326" },
  { name: "Dryness & Dehydration", desc: "Kojic Acid Moisturizer locks hydration and strengthens your skin barrier without heaviness.", img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/file_00000000f1c4720ba9262705b9c753c0.png?v=1779353374" },
  { name: "Acne & Breakouts", desc: "Salicylic Acid Face Wash clears pores at the root. Prevents new breakouts before they form.", img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/file_000000006d1c720bbb45e79c9c0ae65a.png?v=1779353429" },
];

const FORMULATION = [
  {
    name: "Green Tea Face Wash",
    subtitle: "Cleanser + Exfoliant + Soother",
    ingredients: [{ n: "Green Tea Extract", v: "2%" }, { n: "Salicylic Acid", v: "1.5%" }, { n: "Aloe Vera", v: "2%" }],
    benefit: "Deep clean + gentle exfoliate + soothe",
  },
  {
    name: "Vitamin C Serum",
    subtitle: "Brightener + Antioxidant + Hydrator",
    ingredients: [{ n: "Vitamin C (3-O-Ethyl)", v: "14%" }, { n: "Hyaluronic Acid", v: "5%" }, { n: "Niacinamide", v: "2%" }],
    benefit: "Brightens dark spots + firms + hydrates",
  },
  {
    name: "Kojic Acid Moisturizer",
    subtitle: "Brightener + Firmer + Protector",
    ingredients: [{ n: "Vitamin C", v: "5%" }, { n: "Kojic Acid", v: "1%" }, { n: "Hyaluronic Acid", v: "2%" }, { n: "Niacinamide", v: "5%" }, { n: "Vitamin E", v: "0.5%" }],
    benefit: "Reduces discoloration + firms + nourishes",
  },
  {
    name: "Fluid Sunscreen SPF 50",
    subtitle: "Protector + Antioxidant",
    ingredients: [{ n: "Zinc Oxide", v: "8%" }, { n: "Titanium Dioxide", v: "6%" }, { n: "Avobenzone", v: "5%" }, { n: "Sea Buckthorn", v: "0.8%" }],
    benefit: "Broad-spectrum UV + antioxidant protection",
  },
];

const PILLARS = [
  { n: "01", h: "Real Percentages. Not Trace Amounts.", p: "An ingredient at 0.001% is marketing. An ingredient at 14% is medicine. We disclose every concentration — because that's the only way you can know whether a product will actually work." },
  { n: "02", h: "Made for Indian Skin. Not Adapted for It.", p: "Indian skin faces Indian summers, Indian humidity, Indian pollution. Melanin-rich skin that wasn't considered in most formulations. We built for this skin from the beginning." },
  { n: "03", h: "Results Without Harshness.", p: "Your skin barrier is not an obstacle to results — it is the foundation of them. We chose not to strip or over-exfoliate for short-term change at the cost of long-term damage." },
];

const BUNDLES = [
  { name: "Starter Routine Bundle", desc: "Face Wash + Serum + Moisturizer. Everything you need to start seeing results.", price: "1,299", img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/rn-image_picker_lib_temp_43998e88-53cc-47f0-a07c-534640abfaba.png?v=1779169482" },
  { name: "Complete Protection Set", desc: "All 4 products + exclusive skincare guide. The complete arsenal for Indian skin.", price: "1,799", img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/rn-image_picker_lib_temp_19967fc6-b70e-4f24-bd1f-cee254071cdc.png?v=1779169645" },
  { name: "Summer Essential Bundle", desc: "Serum + Moisturizer + Sunscreen. Perfect for monsoon and summer months.", price: "1,499", img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/file_00000000ee9072079b3a32a32346aaa9.png?v=1779362101" },
];

const RESULTS = [
  { img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/file_000000008f707207b881a98a418432b8.png?v=1779354251", caption: "Week 0 → Week 4 → Week 8", tag: "Vitamin C Serum", source: "WhatsApp · 47 members" },
  { img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/file_0000000054987207a7784b6ae3988a34.png?v=1779354261", caption: "Dark spots fade. Glow returns.", tag: "Face Wash + Serum", source: "Instagram DM · Unfiltered" },
  { img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/file_00000000937c7207adbdbe1b7cf19d8e.png?v=1779354284", caption: "Clearer skin. No irritation.", tag: "Complete Routine", source: "Real feedback · Verified" },
];

const REVIEWS: { product: string; rating: string; count: number; id: string; reviews: { stars: number; title?: string; text: string; name: string; city: string }[] }[] = [
  {
    product: "2% Green Tea Face Wash", rating: "4.9", count: 58, id: "reviews-product-1",
    reviews: [
      { stars: 5, title: "Actually stops breakouts", text: "My skin cleared up significantly. Daily use is great.", name: "Rohan G.", city: "Pune" },
      { stars: 5, title: "Perfect for summer", text: "Doesn't strip skin. Green tea soothes. Worth the price.", name: "Deepa S.", city: "Hyderabad" },
      { stars: 5, text: "Best face wash under ₹300. Amazing.", name: "Priyanka R.", city: "Bangalore" },
      { stars: 5, text: "Gentle yet effective. No irritation.", name: "Harsh P.", city: "Delhi" },
      { stars: 5, text: "My oily skin is finally balanced.", name: "Nikita K.", city: "Mumbai" },
      { stars: 5, text: "No breakouts since I started using.", name: "Tanya M.", city: "Chennai" },
    ],
  },
  {
    product: "14% Vitamin C Face Serum", rating: "4.8", count: 52, id: "reviews-product-2",
    reviews: [
      { stars: 5, title: "Results in 3 weeks!", text: "My dark spots actually faded. The formulation is no joke.", name: "Priya M.", city: "Delhi" },
      { stars: 5, title: "Best serum for Indian skin", text: "No sticky feeling. Absorbs instantly. Skin visibly brighter.", name: "Anjali K.", city: "Mumbai" },
      { stars: 4, title: "Good but need patience", text: "Works for hyperpigmentation. Results at week 4.", name: "Neha P.", city: "Bangalore" },
      { stars: 5, title: "Game changer", text: "14% is serious. My melasma is fading fast.", name: "Ritu V.", city: "Pune" },
      { stars: 5, title: "Worth every rupee", text: "Lightweight. Non-irritating. Real results.", name: "Meera S.", city: "Chennai" },
      { stars: 5, title: "My skin loves it", text: "Combines well with the face wash and moisturizer.", name: "Deepa K.", city: "Hyderabad" },
    ],
  },
  {
    product: "1% Kojic Acid + 5% Vitamin C Moisturizer", rating: "4.8", count: 48, id: "reviews-product-3",
    reviews: [
      { stars: 5, title: "Best day moisturizer", text: "Lightweight but super hydrating. Dark spots fading visibly.", name: "Asha K.", city: "Delhi" },
      { stars: 5, title: "Skin barrier fixed", text: "Not heavy at all. Works perfectly with serum underneath.", name: "Sunita M.", city: "Mumbai" },
      { stars: 5, text: "Kojic acid actually working. Less spots in 2 weeks.", name: "Ritika V.", city: "Bangalore" },
      { stars: 5, text: "Soft, supple skin all day. No greasiness.", name: "Priya N.", city: "Pune" },
      { stars: 5, text: "Skin looks plump and hydrated. Hyperpigmentation reducing.", name: "Neha S.", city: "Hyderabad" },
      { stars: 5, text: "Perfect texture. Melts into skin instantly.", name: "Anjali T.", city: "Chennai" },
    ],
  },
  {
    product: "Fluid Sunscreen SPF 50 PA++++", rating: "4.7", count: 45, id: "reviews-product-4",
    reviews: [
      { stars: 5, title: "No white cast! Finally!", text: "Best SPF for darker Indian skin tones.", name: "Meera V.", city: "Chennai" },
      { stars: 5, title: "Hydrating sunscreen", text: "Sea Buckthorn makes a real difference.", name: "Isha D.", city: "Delhi" },
      { stars: 5, text: "Lightweight and invisible finish.", name: "Pooja M.", city: "Bangalore" },
      { stars: 5, text: "My skin doesn't get oily with this.", name: "Rahul K.", city: "Mumbai" },
      { stars: 5, text: "Finally SPF that feels like serum.", name: "Ritika S.", city: "Pune" },
      { stars: 5, text: "Best for layering with makeup.", name: "Anjali R.", city: "Hyderabad" },
    ],
  },
];

function Stars({ count }: { count: number }) {
  return (
    <span className="text-[#C8902A] text-[11px] tracking-[1px]">
      {"★".repeat(Math.floor(count))}{"☆".repeat(5 - Math.floor(count))}
    </span>
  );
}

function ProductCard({ product, index }: { product: typeof PRODUCTS[0]; index: number }) {
  const { addToCart, isLoading } = useCart();
  const [variantId, setVariantId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      let vid = variantId;
      if (!vid) {
        const p = await getProduct(product.handle);
        vid = p?.variants?.edges?.[0]?.node?.id ?? null;
        if (vid) setVariantId(vid);
      }
      if (vid) await addToCart(vid);
    } finally {
      setAdding(false);
    }
  };

  return (
    <RevealDiv delay={index * 80} className="flex-none w-[300px] bg-white rounded-[4px] border border-[#EBEBEB] overflow-hidden flex flex-col" >
      <div
        className="h-[380px] bg-[#F2EDE8] border-b border-[#EBEBEB] flex items-center justify-center overflow-hidden"
        style={{ aspectRatio: "3/4" }}
      >
        <img
          src={product.img}
          alt={product.name}
          className="max-h-full max-w-full object-contain transition-transform duration-500"
          style={{ transitionTimingFunction: EASE }}
          data-testid={`product-img-${product.handle}`}
        />
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="text-[8.5px] tracking-[.2em] uppercase text-[#C65D3B] font-semibold mb-2">{product.tag}</div>
        <div className="text-[12px] font-semibold text-[#C65D3B] mb-3">{product.badge}</div>
        <div style={{ fontFamily: "'Cinzel', serif" }} className="text-[13px] tracking-[.04em] text-[#0D0D0D] leading-snug mb-2 font-medium">
          {product.name}
        </div>
        <p style={{ fontFamily: "'Playfair Display', serif" }} className="text-[14px] text-[#484848] leading-[1.62] flex-1 mb-3">
          {product.desc}
        </p>
        <div className="flex items-center gap-[5px] mb-3 pb-3 border-b border-[#EBEBEB]">
          <Stars count={product.stars} />
          <span className="text-[11px] text-[#969696]">{product.stars} ({product.reviewCount})</span>
          <button
            onClick={() => document.getElementById(product.reviewId)?.scrollIntoView({ behavior: "smooth" })}
            className="ml-auto text-[11px] text-[#C65D3B] font-semibold hover:text-[#A84828] transition-colors"
            data-testid={`reviews-link-${product.handle}`}
          >
            See {product.reviewsCount} reviews →
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-[6px]">
            <span style={{ fontFamily: "'Cinzel', serif" }} className="text-[18px] text-[#0D0D0D] font-semibold">
              <span className="text-[12px] font-normal">₹</span>{product.price}
            </span>
            <span className="text-[11px] text-[#969696] line-through">₹{product.was}</span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={adding || isLoading}
            className="text-[9px] tracking-[.16em] uppercase font-semibold px-4 py-[10px] bg-[#0D0D0D] text-white rounded-[1px] hover:bg-[#C65D3B] transition-colors disabled:opacity-60"
            data-testid={`add-to-cart-${product.handle}`}
          >
            {adding ? "..." : "Add to Cart"}
          </button>
        </div>
      </div>
    </RevealDiv>
  );
}

function StatCounter({ target, label }: { target: string; label: string }) {
  const [displayed, setDisplayed] = useState("0");
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const num = parseInt(target.replace(/\D/g, ""));
    const suffix = target.replace(/[0-9,]/g, "");
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let current = 0;
        const increment = Math.max(1, Math.ceil(num / 60));
        const timer = setInterval(() => {
          current += increment;
          if (current >= num) {
            setDisplayed(num.toLocaleString("en-IN") + suffix);
            clearInterval(timer);
          } else {
            setDisplayed(current.toLocaleString("en-IN") + suffix);
          }
        }, 30);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="flex flex-col gap-[6px] text-center">
      <span style={{ fontFamily: "'Cinzel', serif" }} className="text-[24px] text-[#C65D3B] font-semibold tracking-[.04em]">
        {displayed}
      </span>
      <span className="text-[11px] tracking-[.12em] uppercase text-[#969696] font-medium">{label}</span>
    </div>
  );
}

export default function Home() {
  const [stickyVisible, setStickyVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setStickyVisible(window.scrollY > 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const trustItems = ["Thoughtfully Formulated", "PA++++ Broad Spectrum", "Zero Fillers", "Made in India", "Paraben-Free", "14% Vitamin C", "Clinically Active Doses", "Tested for Indian Skin"];

  return (
    <div className="overflow-x-hidden">
      {/* Announcement */}
      <div className="bg-[#0D0D0D] text-white/60 text-center py-[9px] text-[10px] tracking-[.22em] uppercase">
        <span className="text-white font-semibold">Free shipping</span> over ₹999 ·{" "}
        <span className="text-white font-semibold">Dispatch</span> within 24 hrs · 30-day money-back guarantee · Made in India
      </div>

      {/* Trust signals bar */}
      <div className="bg-[#F9F7F5] border-b border-[#EBEBEB] py-3 overflow-x-auto">
        <div className="flex gap-8 min-w-max px-16 text-[11px] tracking-[.1em] text-[#484848]">
          {["Cruelty-Free", "Paraben-Free", "pH Balanced (4.5–5.5)", "Dispatch in 24 hrs", "30-Day Guarantee", "Dermatologist Tested"].map((t) => (
            <span key={t} className="whitespace-nowrap">
              <b className="text-[#C65D3B]">✓</b> {t}
            </span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <section
        className="relative w-full flex items-center justify-center text-center text-white overflow-hidden my-10"
        style={{ height: "clamp(400px, 80vh, 600px)" }}
        data-testid="hero"
      >
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://cdn.shopify.com/s/files/1/0971/5757/9042/files/1000078751.jpg?v=1779352768')" }}
        />
        <div className="absolute inset-0 z-[1]" style={{ background: "linear-gradient(135deg, rgba(14,8,4,.42) 0%, rgba(20,10,5,.26) 100%)" }} />
        <div className="relative z-[2] max-w-[720px] px-8 py-15">
          <p className="text-[11px] tracking-[.25em] uppercase text-white/80 font-semibold mb-5">50+ women tested · 4 weeks to visible results</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[clamp(36px,5vw,64px)] leading-[1.2] mb-5 font-normal">
            Your Dark Spots Don't Stand <em className="italic" style={{ color: "#FFE4B5" }}>a Chance.</em>
          </h1>
          <p style={{ fontFamily: "'Playfair Display', serif" }} className="text-[clamp(14px,2.5vw,18px)] leading-[1.6] text-white/85 mb-4">
            14% Vitamin C melts into skin. Kojic Acid blocks melanin. You'll see the difference by week 4. ₹269 to start. No filler. No lies.
          </p>
          <p className="text-[11px] tracking-[.08em] text-white/90 mb-8 font-medium">
            Ships within 24 hours · Tracking included · 30-day money-back guarantee
          </p>
          <div className="flex gap-4 justify-center flex-wrap mt-6">
            <button
              onClick={() => scrollTo("products")}
              className="bg-white text-[#0D0D0D] px-8 py-[14px] rounded-[2px] text-[11px] font-semibold tracking-[.14em] uppercase hover:bg-[#F2EDE8] transition-colors"
              data-testid="hero-cta-primary"
            >
              Start Your Routine
            </button>
            <button
              onClick={() => scrollTo("concerns")}
              className="bg-transparent text-white border border-white px-8 py-[14px] rounded-[2px] text-[11px] font-semibold tracking-[.14em] uppercase hover:bg-white hover:text-[#0D0D0D] transition-all"
              data-testid="hero-cta-secondary"
            >
              Find Your Perfect Match
            </button>
          </div>
        </div>
      </section>

      {/* Instagram Widget */}
      <div className="bg-white border-t border-b border-[#EBEBEB] py-10 flex justify-center items-center px-6">
        <div className="flex flex-col items-center gap-6 max-w-[320px] w-full p-6 bg-[#F2EDE8] rounded-xl border border-[#EBEBEB] text-center">
          <a
            href="https://instagram.com/the.jadeandbloom"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[13px] font-semibold text-[#0D0D0D] hover:text-[#C65D3B] transition-colors"
            data-testid="instagram-link"
          >
            <svg className="w-5 h-5 text-[#C65D3B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
            </svg>
            <span className="text-[#C65D3B]">@the.jadeandbloom</span>
          </a>
          <div className="grid grid-cols-3 gap-4 w-full">
            {[{ n: "2,850", l: "Followers" }, { n: "127", l: "Posts" }, { n: "98%", l: "Engagement" }].map((s) => (
              <div key={s.l} className="flex flex-col gap-1">
                <span style={{ fontFamily: "'Cinzel', serif" }} className="text-[20px] text-[#C65D3B] font-semibold">{s.n}</span>
                <span className="text-[10px] tracking-[.1em] uppercase text-[#969696] font-medium">{s.l}</span>
              </div>
            ))}
          </div>
          <a
            href="https://instagram.com/the.jadeandbloom"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-[10px] bg-[#C65D3B] text-white rounded-md text-[12px] font-semibold tracking-[.08em] uppercase hover:bg-[#A84828] transition-colors"
            data-testid="instagram-follow"
          >
            Follow on Instagram
          </a>
        </div>
      </div>

      {/* Trust Track */}
      <div className="bg-[#0D0D0D] overflow-hidden py-5 border-t border-b border-white/10">
        <div className="flex gap-6 w-[200%]" style={{ animation: "marquee 30s linear infinite" }}>
          {[...trustItems, ...trustItems].map((item, i) => (
            <span key={i} className="flex items-center gap-2 text-[11px] tracking-[.1em] whitespace-nowrap uppercase text-white/80">
              <span className="text-[#C65D3B] font-bold">·</span>{item}
            </span>
          ))}
        </div>
      </div>

      {/* Products */}
      <section id="products" className="bg-[#F9F7F5] px-16 py-20 my-10">
        <div className="max-w-[1200px] mx-auto">
          <RevealDiv className="mb-12">
            <div className="text-[10px] tracking-[.25em] uppercase text-[#C65D3B] font-semibold mb-3">The Collection</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[clamp(32px,4vw,54px)] leading-[1.2] mb-4 font-normal text-[#0D0D0D]">
              Four products. Your complete routine.
            </h2>
            <p style={{ fontFamily: "'Playfair Display', serif" }} className="text-[16px] leading-[1.6] text-[#484848]">
              Formulated together. Used in order. Designed for Indian skin.
            </p>
          </RevealDiv>
          <div className="flex gap-6 overflow-x-auto pb-4 cursor-grab" style={{ scrollbarWidth: "thin", scrollbarColor: "#C65D3B #E8E4E0" }}>
            {PRODUCTS.map((p, i) => <ProductCard key={p.handle} product={p} index={i} />)}
          </div>
        </div>
      </section>

      {/* Concerns */}
      <section id="concerns" className="bg-white px-16 py-20 my-10">
        <div className="max-w-[1200px] mx-auto">
          <RevealDiv className="mb-12">
            <div className="text-[10px] tracking-[.25em] uppercase text-[#C65D3B] font-semibold mb-3">Shop by Concern</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[clamp(32px,4vw,54px)] leading-[1.2] mb-4 font-normal text-[#0D0D0D]">
              What does your skin need?
            </h2>
            <p style={{ fontFamily: "'Playfair Display', serif" }} className="text-[16px] leading-[1.6] text-[#484848]">
              Find the right products for exactly what you're dealing with.
            </p>
          </RevealDiv>
          <div className="flex gap-6 overflow-x-auto pb-4" style={{ scrollbarWidth: "thin", scrollbarColor: "#C65D3B #E8E4E0" }}>
            {CONCERNS.map((c, i) => (
              <RevealDiv key={c.name} delay={i * 80} className="flex-none w-[300px] p-6 bg-[#F9F7F5] rounded-[4px] border border-[#EBEBEB] hover:border-[#C65D3B] hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className="w-full h-[220px] bg-[#F2EDE8] rounded-lg flex items-center justify-center overflow-hidden mb-5">
                  <img src={c.img} alt={c.name} className="w-full h-full object-contain" />
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[18px] leading-snug mb-3 text-[#0D0D0D]">{c.name}</h3>
                <p className="text-[13px] leading-[1.6] text-[#484848]">{c.desc}</p>
              </RevealDiv>
            ))}
          </div>
        </div>
      </section>

      {/* Formulation Science */}
      <section className="bg-[#F9F7F5] px-16 py-20 my-10">
        <div className="max-w-[1200px] mx-auto">
          <RevealDiv className="text-center mb-16">
            <div className="text-[11px] tracking-[.22em] uppercase text-[#C65D3B] font-semibold mb-3">Formulation Science</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[42px] leading-[1.2] mb-4 font-normal text-[#0D0D0D]">
              Clinical Actives. Real Percentages.
            </h2>
            <p className="text-[14px] text-[#666] max-w-[600px] mx-auto">
              Not trace amounts. Not marketing smoke. Every ingredient at its optimal concentration for visible results.
            </p>
          </RevealDiv>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {FORMULATION.map((f, i) => (
              <RevealDiv key={f.name} delay={i * 80} className="bg-white p-8 rounded-lg border border-[#EBEBEB]">
                <div className="mb-6 pb-4 border-b-2 border-[#C65D3B]">
                  <h3 className="text-[18px] font-semibold text-[#0D0D0D]">{f.name}</h3>
                  <p className="text-[12px] text-[#999] mt-2">{f.subtitle}</p>
                </div>
                <div className="space-y-0">
                  {f.ingredients.map((ing, j) => (
                    <div key={ing.n} className={`flex justify-between items-center py-3 ${j < f.ingredients.length - 1 ? "border-b border-[#f0f0f0]" : ""}`}>
                      <span className="text-[13px] text-[#333]">{ing.n}</span>
                      <span style={{ fontFamily: "'Cinzel', serif" }} className="text-[16px] font-semibold text-[#C65D3B]">{ing.v}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 p-4 bg-[#FFF9F5] border-l-[3px] border-[#C65D3B] rounded">
                  <div className="text-[11px] font-semibold text-[#666] mb-1 uppercase tracking-[.06em]">Key Benefit</div>
                  <div className="text-[12px] text-[#333]">{f.benefit}</div>
                </div>
              </RevealDiv>
            ))}
          </div>

          <div className="h-px bg-[#EBEBEB] my-16" />

          <RevealDiv className="mt-16">
            <div className="text-center mb-10">
              <div className="text-[11px] tracking-[.22em] uppercase text-[#C65D3B] font-semibold mb-3">Why We're Different</div>
              <h3 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[32px] text-[#0D0D0D] font-normal">
                Real Strength. Real Results. Real Price.
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm" style={{ minWidth: 480 }}>
                <thead>
                  <tr className="bg-[#F9F7F5] border-b-2 border-[#EBEBEB]">
                    <th className="p-4 text-left font-semibold text-[#333] text-[13px]">Key Ingredient</th>
                    <th className="p-4 text-center font-semibold text-[#C65D3B] text-[13px]">Jade &amp; Bloom</th>
                    <th className="p-4 text-center font-semibold text-[#999] text-[13px]">Competitor A</th>
                    <th className="p-4 text-center font-semibold text-[#999] text-[13px]">Competitor B</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Green Tea Extract", "2.0%", "0.1%", "Trace"],
                    ["Vitamin C", "14%", "5%", "3%"],
                    ["Salicylic Acid", "1.5%", "0.5%", "0.3%"],
                    ["Hyaluronic Acid", "5%", "2%", "1%"],
                    ["Price (Face Wash)", "₹269", "₹349", "₹399"],
                  ].map(([label, jb, ca, cb], i) => (
                    <tr key={label} className={`border-b border-[#EBEBEB] ${i === 4 ? "bg-[#FFF9F5]" : ""}`}>
                      <td className={`p-4 text-[#333] text-[13px] ${i === 4 ? "font-semibold" : ""}`}>{label}</td>
                      <td className="p-4 text-center font-semibold text-[#C65D3B] text-[14px]">{jb}</td>
                      <td className="p-4 text-center text-[#999] text-[13px]">{ca}</td>
                      <td className="p-4 text-center text-[#999] text-[13px]">{cb}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-8 p-6 bg-gradient-to-r from-[#FFF9F5] to-[#F9F7F5] border-l-4 border-[#C65D3B] rounded-md">
              <p className="text-[13px] leading-[1.8] text-[#333]">
                <strong className="text-[#C65D3B]">Why This Matters:</strong> Our formulations use significantly higher concentrations of active ingredients than competitors, yet we price them more affordably. You're not paying premium prices for premium results — you're getting clinical strength at realistic costs.
              </p>
            </div>
          </RevealDiv>
        </div>
      </section>

      {/* Pillars */}
      <section className="bg-[#F9F7F5] px-16 py-20 my-10">
        <div className="max-w-[1200px] mx-auto">
          <RevealDiv className="mb-8">
            <div className="text-[10px] tracking-[.25em] uppercase text-[#C65D3B] font-semibold mb-3">What We Believe</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[clamp(32px,4vw,54px)] leading-[1.2] font-normal text-[#0D0D0D] max-w-[700px]">
              Science is not the opposite of care. It is the highest form of it.
            </h2>
          </RevealDiv>
          <div className="flex gap-10 overflow-x-auto pb-4 mt-8" style={{ scrollbarWidth: "thin", scrollbarColor: "#C65D3B #E8E4E0" }}>
            {PILLARS.map((p, i) => (
              <RevealDiv key={p.n} delay={i * 100} className="flex-none w-[320px] p-8 bg-white rounded-[4px] border border-[#EBEBEB]">
                <div style={{ fontFamily: "'Cinzel', serif" }} className="text-[48px] text-[#C65D3B] mb-4 font-semibold leading-none">{p.n}</div>
                <h3 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[20px] leading-snug mb-4 text-[#0D0D0D]">{p.h}</h3>
                <p className="text-[14px] leading-[1.7] text-[#484848]">{p.p}</p>
              </RevealDiv>
            ))}
          </div>
        </div>
      </section>

      {/* Bundles */}
      <section id="bundles" className="bg-[#F9F7F5] px-16 py-20 my-10">
        <div className="max-w-[1200px] mx-auto">
          <RevealDiv className="mb-12">
            <div className="text-[10px] tracking-[.25em] uppercase text-[#C65D3B] font-semibold mb-3">Smart Bundles</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[clamp(32px,4vw,54px)] leading-[1.2] mb-4 font-normal text-[#0D0D0D]">
              Save more. Get complete routines.
            </h2>
            <p style={{ fontFamily: "'Playfair Display', serif" }} className="text-[16px] leading-[1.6] text-[#484848]">
              Thoughtfully curated. Save up to 20% vs. buying separately.
            </p>
          </RevealDiv>
          <div className="flex gap-6 overflow-x-auto pb-4" style={{ scrollbarWidth: "thin", scrollbarColor: "#C65D3B #E8E4E0" }}>
            {BUNDLES.map((b, i) => (
              <RevealDiv key={b.name} delay={i * 80} className="flex-none w-[300px] bg-white rounded-[4px] border border-[#EBEBEB] overflow-hidden hover:border-[#C65D3B] transition-all duration-300">
                <div className="h-[240px] bg-[#F2EDE8] flex items-center justify-center overflow-hidden">
                  <img src={b.img} alt={b.name} className="max-h-full max-w-full object-cover" />
                </div>
                <div className="p-5">
                  <div style={{ fontFamily: "'Cinzel', serif" }} className="text-[13px] tracking-[.04em] text-[#0D0D0D] mb-2 font-semibold">{b.name}</div>
                  <p className="text-[12px] text-[#484848] mb-3 leading-[1.5]">{b.desc}</p>
                  <div style={{ fontFamily: "'Cinzel', serif" }} className="text-[16px] text-[#C65D3B] font-semibold mb-3">
                    <span className="text-[12px]">₹</span>{b.price}
                  </div>
                  <a
                    href="https://www.thejadeandbloom.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-[#0D0D0D] text-white text-center py-[10px] text-[9px] tracking-[.16em] uppercase font-semibold rounded-[1px] hover:bg-[#C65D3B] transition-colors"
                    data-testid={`bundle-cta-${i}`}
                  >
                    Add to Cart
                  </a>
                </div>
              </RevealDiv>
            ))}
          </div>
        </div>
      </section>

      {/* Real Results */}
      <section className="bg-white px-16 py-20 my-10">
        <div className="max-w-[1200px] mx-auto">
          <RevealDiv className="mb-12">
            <div className="text-[10px] tracking-[.25em] uppercase text-[#C65D3B] font-semibold mb-3">Real Results</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[clamp(32px,4vw,54px)] leading-[1.2] mb-4 font-normal text-[#0D0D0D]">
              What our customers are seeing.
            </h2>
            <p style={{ fontFamily: "'Playfair Display', serif" }} className="text-[16px] leading-[1.6] text-[#484848]">
              8–12 weeks. Consistent use. Real Indian skin. Real results.
            </p>
          </RevealDiv>
          <div className="flex gap-6 overflow-x-auto pb-4" style={{ scrollbarWidth: "thin", scrollbarColor: "#C65D3B #E8E4E0" }}>
            {RESULTS.map((r, i) => (
              <RevealDiv key={i} delay={i * 80} className="flex-none w-[320px] h-[420px] rounded-[4px] overflow-hidden relative bg-[#F2EDE8]">
                <img src={r.img} alt={r.caption} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 text-white text-center p-6" style={{ background: "linear-gradient(to top, rgba(0,0,0,.8), transparent)" }}>
                  <span className="block text-[10px] tracking-[.12em] uppercase text-white/70 mb-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#25D366] mr-1" />{r.source}
                  </span>
                  <p style={{ fontFamily: "'Playfair Display', serif" }} className="text-[14px] leading-[1.5] mb-3">{r.caption}</p>
                  <span className="inline-block bg-[#C65D3B] text-white px-3 py-1 rounded-[2px] text-[9px] tracking-[.1em] uppercase font-semibold">{r.tag}</span>
                </div>
              </RevealDiv>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section id="story" className="bg-white px-16 py-20 my-10">
        <div className="max-w-[1200px] mx-auto">
          <RevealDiv className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="h-[400px] bg-[#F2EDE8] rounded-[4px] overflow-hidden">
              <img
                src="https://cdn.shopify.com/s/files/1/0971/5757/9042/files/rn-image_picker_lib_temp_66ba1ae5-d6eb-45c9-90dd-d830e002454d.png?v=1779168929"
                alt="Our Story"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 style={{ fontFamily: "'Cinzel', serif" }} className="text-[36px] font-semibold leading-[1.3] mb-6 text-[#0D0D0D] tracking-[.04em] uppercase">
                Why we started Jade and Bloom
              </h2>
              <p className="text-[14px] leading-[1.7] text-[#484848] mb-4">
                Most skincare is built for someone else's skin. The formulations that dominated the market — tested on caucasian skin in western labs — were never designed for the unique challenges of Indian skin: the melanin density, the humidity, the pollution, the summers that last 8 months.
              </p>
              <p className="text-[14px] leading-[1.7] text-[#484848] mb-4">
                We started with a single question: <strong className="text-[#C65D3B]">What if we built skincare specifically for Indian skin?</strong> Not adapted. Not "inclusive." Built from the beginning for the biology, the climate, and the real needs of melanin-rich skin in India.
              </p>
              <p className="text-[14px] leading-[1.7] text-[#484848]">
                Four products. Clinical doses. Real actives. Made in Delhi. <strong className="text-[#C65D3B]">This is what skin science looks like when it's built for you.</strong>
              </p>
            </div>
          </RevealDiv>
        </div>
      </section>

      {/* Stats */}
      <div className="bg-white border-t border-b border-[#EBEBEB] py-8 px-16">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-5 text-center">
          <StatCounter target="50+" label="Women Tested" />
          <StatCounter target="4" label="Weeks Visible Results" />
          <StatCounter target="4" label="Products Made" />
          <StatCounter target="30" label="Day Guarantee" />
        </div>
      </div>

      {/* Reviews */}
      <section id="reviews" className="bg-[#F9F7F5] px-16 py-20 my-10">
        <div className="max-w-[1200px] mx-auto">
          <RevealDiv className="mb-12">
            <div className="text-[10px] tracking-[.25em] uppercase text-[#C65D3B] font-semibold mb-3">Customer Reviews</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[clamp(32px,4vw,54px)] leading-[1.2] font-normal text-[#0D0D0D]">
              What people are saying.
            </h2>
          </RevealDiv>
          <div className="space-y-16">
            {REVIEWS.map((section) => (
              <div key={section.id} id={section.id}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[18px] text-[#0D0D0D] mb-2 font-medium">{section.product}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] text-[#C8902A] tracking-[2px]">{"★".repeat(5)}</span>
                      <span className="text-[12px] text-[#484848]">{section.rating} out of 5 ({section.count} reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-3" style={{ scrollbarWidth: "thin", scrollbarColor: "#C65D3B #E8E4E0" }}>
                  {section.reviews.map((r, i) => (
                    <div key={i} className="flex-none w-[280px] bg-white p-4 rounded-[4px] border border-[#EBEBEB] hover:border-[#C65D3B] transition-colors flex flex-col gap-2" data-testid={`review-card-${section.id}-${i}`}>
                      <span className="text-[12px] tracking-[1px] text-[#C8902A]">{"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}</span>
                      {r.title && <p style={{ fontFamily: "'Cinzel', serif" }} className="text-[12px] text-[#0D0D0D] font-semibold">{r.title}</p>}
                      <p className="text-[12px] leading-[1.5] text-[#484848] flex-1">{r.text}</p>
                      <div>
                        <b className="block text-[12px] text-[#0D0D0D]">{r.name}</b>
                        <span className="text-[10px] text-[#969696]">{r.city}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0D0D0D] text-white px-16 py-16">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-10">
            <h3 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[24px] leading-[1.2] mb-4">Beauty, Bold and Beyond</h3>
            <p className="text-[14px] leading-[1.6] text-white/70">Premium skincare formulated and manufactured in India. For Indian skin. By people who understand it.</p>
            <div className="flex flex-wrap gap-5 mt-5">
              <a href="https://instagram.com/the.jadeandbloom" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-3 bg-white/10 rounded-[4px] text-[12px] font-semibold hover:bg-white/15 transition-colors">
                <Instagram size={16} />
                <div><span className="block">Instagram</span><span className="block text-[10px] text-white/50">@the.jadeandbloom</span></div>
              </a>
              <a href="https://youtube.com/@jadeandbloom" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-3 bg-white/10 rounded-[4px] text-[12px] font-semibold hover:bg-white/15 transition-colors">
                <Youtube size={16} />
                <div><span className="block">YouTube</span><span className="block text-[10px] text-white/50">Jade and Bloom</span></div>
              </a>
              <a href="https://www.thejadeandbloom.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-3 bg-white/10 rounded-[4px] text-[12px] font-semibold hover:bg-white/15 transition-colors">
                <ExternalLink size={16} />
                <div><span className="block">Shop</span><span className="block text-[10px] text-white/50">www.thejadeandbloom.com</span></div>
              </a>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            <div>
              <div style={{ fontFamily: "'Cinzel', serif" }} className="text-[12px] tracking-[.15em] uppercase text-[#C65D3B] mb-3 font-semibold">Products</div>
              {["Face Wash", "Vitamin C Serum", "Moisturizer", "Sunscreen SPF 50"].map((p) => (
                <button key={p} onClick={() => scrollTo("products")} className="block text-[13px] text-white/65 mb-[10px] hover:text-white transition-colors text-left">{p}</button>
              ))}
            </div>
            <div>
              <div style={{ fontFamily: "'Cinzel', serif" }} className="text-[12px] tracking-[.15em] uppercase text-[#C65D3B] mb-3 font-semibold">About</div>
              <button onClick={() => scrollTo("story")} className="block text-[13px] text-white/65 mb-[10px] hover:text-white transition-colors text-left">Our Story</button>
              <button onClick={() => scrollTo("concerns")} className="block text-[13px] text-white/65 mb-[10px] hover:text-white transition-colors text-left">Shop by Concern</button>
              <button onClick={() => scrollTo("reviews")} className="block text-[13px] text-white/65 mb-[10px] hover:text-white transition-colors text-left">Customer Reviews</button>
              <a href="https://blog.thejadeandbloom.com" target="_blank" rel="noopener noreferrer" className="block text-[13px] text-white/65 mb-[10px] hover:text-white transition-colors">Blog</a>
            </div>
            <div>
              <div style={{ fontFamily: "'Cinzel', serif" }} className="text-[12px] tracking-[.15em] uppercase text-[#C65D3B] mb-3 font-semibold">Support</div>
              <a href="mailto:hello@thejadeandbloom.com" className="block text-[13px] text-white/65 mb-[10px] hover:text-white transition-colors">Contact Us</a>
              <a href="#" className="block text-[13px] text-white/65 mb-[10px] hover:text-white transition-colors">Shipping Policy</a>
              <a href="#" className="block text-[13px] text-white/65 mb-[10px] hover:text-white transition-colors">Returns &amp; Refunds</a>
              <a href="#" className="block text-[13px] text-white/65 mb-[10px] hover:text-white transition-colors">Privacy Policy</a>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-5 border-t border-white/10 gap-2 text-[12px] text-white/50">
            <span>© 2025 Jade and Bloom. All rights reserved.</span>
            <span className="text-[#C65D3B]">Formulated &amp; Made in India</span>
          </div>
        </div>
      </footer>

      {/* Tag Bar */}
      <div className="bg-[#C65D3B] overflow-hidden py-3">
        <div className="flex gap-4 w-[200%]" style={{ animation: "marquee 25s linear infinite" }}>
          {[..."Beauty, Bold and Beyond · Jade and Bloom · Made in India · Beauty, Bold and Beyond · Jade and Bloom · Made in India · ".repeat(3)].join("").split("·").filter(Boolean).concat(["Beauty, Bold and Beyond", "Jade and Bloom", "Made in India"]).slice(0, 24).map((item, i) => (
            <span key={i} className="text-[11px] tracking-[.1em] uppercase whitespace-nowrap text-white px-2">{item.trim()}</span>
          ))}
        </div>
      </div>

      {/* Sticky Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[150] bg-[#0D0D0D] text-white px-5 py-3 flex items-center justify-between text-[13px] transition-transform duration-300"
        style={{ transform: stickyVisible ? "translateY(0)" : "translateY(100%)", transitionTimingFunction: EASE }}
        data-testid="sticky-shop-bar"
      >
        <span><strong>4 products.</strong> Built for Indian skin.</span>
        <button
          onClick={() => scrollTo("products")}
          className="bg-[#C65D3B] text-white px-4 py-2 rounded-[2px] text-[11px] font-semibold hover:bg-[#A84828] transition-colors"
          data-testid="sticky-shop-btn"
        >
          Shop Now
        </button>
      </div>

      <style>{`
        .rv-on { opacity: 1 !important; transform: translateY(0) !important; }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>
    </div>
  );
}
