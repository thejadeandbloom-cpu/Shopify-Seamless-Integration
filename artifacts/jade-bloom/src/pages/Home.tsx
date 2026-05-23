import { useState, useEffect, useRef } from "react";
import { Instagram, Youtube, ExternalLink } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getProduct } from "@/lib/shopify";
import ConcernBundleModal from "@/components/ConcernBundleModal";
import FaqAccordion from "@/components/FaqAccordion";
import WhatsAppButton from "@/components/WhatsAppButton";
import HowToUse from "@/components/HowToUse";
import IngredientBars from "@/components/IngredientBars";

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
    reviewFilter: "Green Tea Face Wash",
    img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/rn-image_picker_lib_temp_4a417ad0-216e-4d69-973a-667118fc1af8.jpg?v=1779168775",
  },
  {
    handle: "vitamin-c-serum",
    tag: "Dark Spots · Dullness · Aging",
    badge: "Visible glow in 4 weeks",
    name: "14% Vitamin C Face Serum",
    desc: "Brightens. Boosts collagen. Fades dark spots. Lightweight. Won't oxidize.",
    price: "618",
    was: "799",
    stars: 4.8,
    reviewCount: 124,
    reviewId: "reviews-product-2",
    reviewsCount: 52,
    reviewFilter: "Vitamin C Serum",
    img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/rn-image_picker_lib_temp_dc6610da-ef7f-4601-a220-9a39070ba226.jpg?v=1779168760",
  },
  {
    handle: "kojic-acid-moisturizer",
    tag: "Dryness · Sensitivity · Barrier",
    badge: "Hydrated within minutes",
    name: "1% Kojic Acid + 5% Vitamin C Moisturizer",
    desc: "Locks hydration. Balances pH. Strengthens skin barrier. Non-comedogenic.",
    price: "449",
    was: "579",
    stars: 4.7,
    reviewCount: 98,
    reviewId: "reviews-product-3",
    reviewsCount: 48,
    reviewFilter: "Kojic Acid Moisturizer",
    img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/rn-image_picker_lib_temp_e3eac689-1807-47d8-8b98-279a4b3d09a1.png?v=1779168826",
  },
  {
    handle: "fluid-sunscreen",
    tag: "UV Protection · Aging · Pigmentation",
    badge: "Reef-safe & sweat-proof",
    name: "Fluid Sunscreen SPF 50 PA++++",
    desc: "Invisible. Weightless. Won't clog pores. Reef-safe.",
    price: "489",
    was: "629",
    stars: 4.9,
    reviewCount: 147,
    reviewId: "reviews-product-4",
    reviewsCount: 45,
    reviewFilter: "Fluid Sunscreen",
    img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/rn-image_picker_lib_temp_56d282bc-cec2-41e4-a230-e932af58ffc3.jpg?v=1779168858",
  },
];

const CONCERNS = [
  {
    name: "Dark Spots & Hyperpigmentation",
    desc: "Vitamin C + Kojic Acid targets melanin production and fades stubborn spots.",
    img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/file_00000000c9d0720b9f6ff7cc15836880.png?v=1779352855",
    productCount: 3,
  },
  {
    name: "Dull & Tired Skin",
    desc: "High-strength Vitamin C brightens within weeks and restores your glow.",
    img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/file_000000009c3071f8b230607b21e312a7.png?v=1779353326",
    productCount: 3,
  },
  {
    name: "Dryness & Dehydration",
    desc: "Kojic Acid Moisturizer locks hydration without heaviness.",
    img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/file_00000000f1c4720ba9262705b9c753c0.png?v=1779353374",
    productCount: 3,
  },
  {
    name: "Acne & Breakouts",
    desc: "Salicylic Acid Face Wash clears pores at the root. Prevents new breakouts.",
    img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/file_000000006d1c720bbb45e79c9c0ae65a.png?v=1779353429",
    productCount: 3,
  },
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

const RESULTS = [
  { img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/file_000000008f707207b881a98a418432b8.png?v=1779354251" },
  { img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/file_0000000054987207a7784b6ae3988a34.png?v=1779354261" },
  { img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/file_00000000937c7207adbdbe1b7cf19d8e.png?v=1779354284" },
];

const WHATSAPP_REVIEWS = [
  {
    img: "/review-kavya.png",
    name: "Kavya M.",
    product: "14% Vitamin C Serum",
    quote: "My skin looks brighter, clearer and so much more even. It's now a must-have in my routine. 100% recommend if you want that natural glow!",
  },
  {
    img: "/review-pooja.png",
    name: "Pooja R.",
    product: "Kojic Acid + Vitamin C Moisturizer",
    quote: "After using this moisturizer consistently, the difference is real! My skin looks brighter, more even and so much healthier now.",
  },
  {
    img: "/review-anon.png",
    name: "Verified Customer",
    product: "14% Vitamin C Serum",
    quote: "My skin looks brighter, clearer and so much more even. 100% recommend if you want that natural, healthy glow!",
  },
];

type Review = { stars: number; title?: string; text: string; name: string; city: string; product: string };

const ALL_REVIEWS: Review[] = [
  { stars: 5, title: "Actually stops breakouts", text: "My skin cleared up significantly in 2 weeks. Use it every morning and night — it's now non-negotiable in my routine.", name: "Rohan G.", city: "Pune", product: "Green Tea Face Wash" },
  { stars: 5, title: "Results in 3 weeks!", text: "My dark spots actually faded. The formulation is no joke — I've tried serums at 3x the price with zero results.", name: "Priya M.", city: "Delhi", product: "Vitamin C Serum" },
  { stars: 5, title: "Best day moisturizer", text: "Lightweight but super hydrating. Dark spots have been fading visibly over the last month.", name: "Asha K.", city: "Delhi", product: "Kojic Acid Moisturizer" },
  { stars: 5, title: "No white cast! Finally!", text: "Best SPF I've tried for my skin tone. No cast, no grease, just invisible protection.", name: "Meera V.", city: "Chennai", product: "Fluid Sunscreen" },
  { stars: 5, title: "Perfect for summer", text: "Doesn't strip the skin barrier at all. Green tea genuinely soothes. Worth every rupee.", name: "Deepa S.", city: "Hyderabad", product: "Green Tea Face Wash" },
  { stars: 5, title: "Best serum for Indian skin", text: "No sticky feeling. Absorbs in seconds. Skin looks visibly brighter — my colleagues noticed before I even mentioned it.", name: "Anjali K.", city: "Mumbai", product: "Vitamin C Serum" },
  { stars: 5, title: "Skin barrier fixed", text: "Not heavy at all. Works perfectly as the layer under my serum. My dry patches are completely gone.", name: "Sunita M.", city: "Mumbai", product: "Kojic Acid Moisturizer" },
  { stars: 5, title: "Hydrating sunscreen", text: "Sea Buckthorn makes a real difference. Skin feels fed, not just covered. I stopped looking for a separate moisturizer under this.", name: "Isha D.", city: "Delhi", product: "Fluid Sunscreen" },
  { stars: 5, text: "Best face wash under ₹300. I was skeptical but the salicylic acid is actually doing its job.", name: "Priyanka R.", city: "Bangalore", product: "Green Tea Face Wash" },
  { stars: 4, title: "Good but need patience", text: "Works for hyperpigmentation. Didn't see anything before week 4 but after that the difference was clear.", name: "Neha P.", city: "Bangalore", product: "Vitamin C Serum" },
  { stars: 5, text: "Kojic acid actually working. Noticeably fewer dark spots in just 2 weeks of consistent use.", name: "Ritika V.", city: "Bangalore", product: "Kojic Acid Moisturizer" },
  { stars: 5, text: "Lightweight and invisible on my skin. Perfect for layering before foundation.", name: "Pooja M.", city: "Bangalore", product: "Fluid Sunscreen" },
  { stars: 5, text: "Gentle yet effective. No irritation even on my sensitive skin.", name: "Harsh P.", city: "Delhi", product: "Green Tea Face Wash" },
  { stars: 5, title: "Game changer", text: "14% is serious. My melasma is fading fast — this is the first product that's actually moved the needle.", name: "Ritu V.", city: "Pune", product: "Vitamin C Serum" },
  { stars: 5, text: "Soft, supple skin all day. No greasiness at all even in Delhi humidity.", name: "Priya N.", city: "Pune", product: "Kojic Acid Moisturizer" },
  { stars: 5, text: "My skin doesn't get oily midday anymore. This sunscreen keeps everything balanced.", name: "Rahul K.", city: "Mumbai", product: "Fluid Sunscreen" },
  { stars: 5, text: "My oily skin is finally balanced. No more shine by noon.", name: "Nikita K.", city: "Mumbai", product: "Green Tea Face Wash" },
  { stars: 5, title: "Worth every rupee", text: "Lightweight. Non-irritating. Real results. I recommend this to every friend asking about skincare.", name: "Meera S.", city: "Chennai", product: "Vitamin C Serum" },
  { stars: 5, text: "Skin looks plump and hydrated all day. My makeup sits beautifully over this.", name: "Neha S.", city: "Hyderabad", product: "Kojic Acid Moisturizer" },
  { stars: 5, text: "Finally an SPF that feels like serum. I actually want to put this on every morning.", name: "Ritika S.", city: "Pune", product: "Fluid Sunscreen" },
  { stars: 5, text: "No breakouts since I switched. My skin feels clean without that tight, stripped feeling.", name: "Tanya M.", city: "Chennai", product: "Green Tea Face Wash" },
  { stars: 5, title: "My skin loves it", text: "Combines beautifully with the face wash and moisturizer. The whole routine works together.", name: "Deepa K.", city: "Hyderabad", product: "Vitamin C Serum" },
  { stars: 5, text: "Perfect texture — melts into skin instantly. Never pilling under sunscreen.", name: "Anjali T.", city: "Chennai", product: "Kojic Acid Moisturizer" },
  { stars: 5, text: "Best for layering with makeup. Doesn't pill, doesn't separate. Incredible for ₹489.", name: "Anjali R.", city: "Hyderabad", product: "Fluid Sunscreen" },
  { stars: 5, title: "Cleared my closed comedones", text: "I had tiny bumps all over my forehead for years. 3 weeks of this face wash and they're gone.", name: "Kavya T.", city: "Hyderabad", product: "Green Tea Face Wash" },
  { stars: 5, title: "Brighter in one week", text: "I was not expecting to see results so fast. My dull skin looks alive again.", name: "Simran B.", city: "Chandigarh", product: "Vitamin C Serum" },
  { stars: 5, text: "Husband noticed my skin first — that's how I knew it was actually working.", name: "Pooja V.", city: "Mumbai", product: "Kojic Acid Moisturizer" },
  { stars: 5, title: "Reef-safe matters to me", text: "I travel a lot and this is the only SPF I've found that's truly comfortable in humid weather.", name: "Karan M.", city: "Goa", product: "Fluid Sunscreen" },
  { stars: 5, text: "I have combination skin and this face wash works perfectly — not too drying, not too soft.", name: "Divya S.", city: "Kochi", product: "Green Tea Face Wash" },
  { stars: 4, text: "Serum takes a bit to get used to but the results are undeniable after a month.", name: "Aditya K.", city: "Jaipur", product: "Vitamin C Serum" },
  { stars: 5, title: "Holy grail moisturizer", text: "I've tried 8 moisturizers this year. This is the only one staying in my routine permanently.", name: "Tanya R.", city: "Kolkata", product: "Kojic Acid Moisturizer" },
  { stars: 5, text: "Zero white cast on my NC45 skin. Took a chance and I am so glad I did.", name: "Preethi N.", city: "Coimbatore", product: "Fluid Sunscreen" },
];

function Stars({ count }: { count: number }) {
  return (
    <span className="text-[#C8902A] text-[11px] tracking-[1px]">
      {"★".repeat(Math.floor(count))}{"☆".repeat(5 - Math.floor(count))}
    </span>
  );
}

function ProductCard({ product, index, onReviewClick }: { product: typeof PRODUCTS[0]; index: number; onReviewClick: (filter: string) => void }) {
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
    <RevealDiv delay={index * 80} className="bg-white rounded-[4px] border border-[#EBEBEB] overflow-hidden flex flex-col">
      <div className="h-[200px] md:h-[320px] bg-[#F2EDE8] border-b border-[#EBEBEB] flex items-center justify-center overflow-hidden">
        <img
          src={product.img}
          alt={product.name}
          className="max-h-full max-w-full object-contain"
          data-testid={`product-img-${product.handle}`}
        />
      </div>
      <div className="p-3 md:p-5 flex-1 flex flex-col">
        <div className="text-[8.5px] tracking-[.2em] uppercase text-[#C65D3B] font-semibold mb-2">{product.tag}</div>
        <div className="text-[11px] font-semibold text-[#C65D3B] mb-3 bg-[#FFF9F5] px-2 py-1 rounded inline-block w-fit">{product.badge}</div>
        <div style={{ fontFamily: "'Cinzel', serif" }} className="text-[13px] tracking-[.04em] text-[#0D0D0D] leading-snug mb-2 font-medium">
          {product.name}
        </div>
        <p style={{ fontFamily: "'Playfair Display', serif" }} className="text-[13px] text-[#484848] leading-[1.62] flex-1 mb-3">
          {product.desc}
        </p>
        <div className="flex items-center gap-[5px] mb-3 pb-3 border-b border-[#EBEBEB]">
          <Stars count={product.stars} />
          <span className="text-[11px] text-[#969696]">{product.stars} ({product.reviewCount})</span>
          <button
            onClick={() => onReviewClick(product.reviewFilter)}
            className="ml-auto text-[11px] text-[#C65D3B] font-semibold hover:text-[#A84828] transition-colors"
          >
            {product.reviewsCount} reviews →
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-[6px] mb-[3px]">
              <span style={{ fontFamily: "'Cinzel', serif" }} className="text-[18px] text-[#0D0D0D] font-semibold">
                <span className="text-[12px] font-normal">₹</span>{product.price}
              </span>
              <span className="text-[11px] text-[#969696] line-through">₹{product.was}</span>
            </div>
            <span className="text-[10px] text-[#C65D3B] font-semibold">
              Save ₹{Math.round(parseInt(product.price) * 0.1)} with FIRST10
            </span>
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
  const [activeConcern, setActiveConcern] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setStickyVisible(window.scrollY > 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const [reviewFilter, setReviewFilter] = useState("All");

  const handleReviewClick = (filter: string) => {
    setReviewFilter(filter);
    setTimeout(() => document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  return (
    <div className="overflow-x-hidden">
      {/* Announcement — first order offer */}
      <div className="bg-[#C65D3B] text-white text-center py-[10px] text-[11px] tracking-[.18em] uppercase font-semibold">
        10% off your first order &nbsp;·&nbsp; Use code{" "}
        <span className="bg-white text-[#C65D3B] px-2 py-[1px] rounded font-bold tracking-[.08em]">FIRST10</span>
        &nbsp;at checkout
      </div>

      {/* Trust signals bar */}
      <div className="bg-[#F9F7F5] border-b border-[#EBEBEB] py-3 overflow-x-auto">
        <div className="flex gap-8 min-w-max px-16 text-[11px] tracking-[.1em] text-[#484848]">
          {["Cruelty-Free", "Paraben-Free", "pH Balanced (4.5–5.5)", "COD Available", "Dispatch in 24 hrs", "Dermatologist Tested"].map((t) => (
            <span key={t} className="whitespace-nowrap">
              <b className="text-[#C65D3B]">✓</b> {t}
            </span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <section
        className="relative w-full flex items-center justify-center text-center text-white overflow-hidden"
        style={{ height: "clamp(400px, 80vh, 600px)" }}
        data-testid="hero"
      >
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://cdn.shopify.com/s/files/1/0971/5757/9042/files/1000078751.jpg?v=1779352768')" }}
        />
        <div className="absolute inset-0 z-[1]" style={{ background: "linear-gradient(135deg, rgba(14,8,4,.42) 0%, rgba(20,10,5,.26) 100%)" }} />
        <div className="relative z-[2] max-w-[720px] px-8">
          <p className="text-[11px] tracking-[.25em] uppercase text-white/80 font-semibold mb-5">50+ women tested · 4 weeks to visible results</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[clamp(36px,5vw,64px)] leading-[1.2] mb-5 font-normal">
            Your Dark Spots Don't Stand <em className="italic" style={{ color: "#FFE4B5" }}>a Chance.</em>
          </h1>
          <p style={{ fontFamily: "'Playfair Display', serif" }} className="text-[clamp(14px,2.5vw,18px)] leading-[1.6] text-white/85 mb-4">
            14% Vitamin C melts into skin. Kojic Acid blocks melanin. You'll see the difference by week 4.
          </p>
          <p className="text-[11px] tracking-[.08em] text-white/90 mb-8 font-medium">
            Ships within 24 hours · Tracking included · Shipping included in price
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
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
              Shop by Concern
            </button>
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="bg-[#F9F7F5] px-4 md:px-16 py-12 md:py-20">
        <div className="max-w-[1200px] mx-auto">
          <RevealDiv className="mb-12">
            <div className="text-[10px] tracking-[.25em] uppercase text-[#C65D3B] font-semibold mb-3">The Collection</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[clamp(28px,4vw,54px)] leading-[1.2] mb-3 font-normal text-[#0D0D0D]">
              Four products. Your complete routine.
            </h2>
            <p style={{ fontFamily: "'Playfair Display', serif" }} className="text-[16px] leading-[1.6] text-[#484848]">
              Formulated together. Used in order. Designed for Indian skin.
            </p>
          </RevealDiv>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {PRODUCTS.map((p, i) => <ProductCard key={p.handle} product={p} index={i} onReviewClick={handleReviewClick} />)}
          </div>
        </div>
      </section>

      {/* Concerns → Bundle Modal */}
      <section id="concerns" className="bg-white px-4 md:px-16 py-12 md:py-20">
        <div className="max-w-[1200px] mx-auto">
          <RevealDiv className="mb-4">
            <div className="text-[10px] tracking-[.25em] uppercase text-[#C65D3B] font-semibold mb-3">Shop by Concern</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[clamp(28px,4vw,54px)] leading-[1.2] mb-3 font-normal text-[#0D0D0D]">
              What does your skin need?
            </h2>
            <p style={{ fontFamily: "'Playfair Display', serif" }} className="text-[16px] leading-[1.6] text-[#484848] mb-2">
              Pick your concern — we'll show you the right products as a bundle.
            </p>
          </RevealDiv>

          {/* Discount callout */}
          <RevealDiv delay={80} className="mb-10">
            <div className="inline-flex items-center gap-3 bg-[#FFF9F5] border border-[#F2EDE8] rounded-full px-5 py-2">
              <span className="w-2 h-2 rounded-full bg-[#C65D3B]" />
              <span className="text-[12px] font-semibold text-[#C65D3B] tracking-[.04em]">Save 15% when you buy the bundle</span>
              <span className="text-[12px] text-[#969696]">vs. buying individually</span>
            </div>
          </RevealDiv>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {CONCERNS.map((c, i) => (
              <RevealDiv key={c.name} delay={i * 80}>
                <button
                  onClick={() => setActiveConcern(c.name)}
                  className="relative w-full group block overflow-hidden rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C65D3B] focus:ring-offset-2"
                  style={{ height: "clamp(220px, 40vw, 360px)" }}
                  data-testid={`concern-card-${i}`}
                >
                  {/* Full-bleed image */}
                  <img
                    src={c.img}
                    alt={c.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 55%, transparent 100%)" }} />
                  {/* Text */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 text-left">
                    <p className="text-[9px] tracking-[.18em] uppercase font-semibold text-white/60 mb-1">{c.productCount} products</p>
                    <h3 style={{ fontFamily: "'Playfair Display', serif" }} className="text-white text-[15px] md:text-[18px] leading-snug mb-3 font-normal">
                      {c.name}
                    </h3>
                    <span className="inline-flex items-center gap-2 text-[10px] tracking-[.16em] uppercase font-bold text-white bg-[#C65D3B] px-3 py-[6px] rounded-[2px] group-hover:bg-[#A84828] transition-colors">
                      View Bundle
                    </span>
                  </div>
                </button>
              </RevealDiv>
            ))}
          </div>
        </div>
      </section>

      {/* Formulation Science */}
      <IngredientBars />

      {/* How to Use */}
      <section id="routine" className="bg-[#F9F7F5] px-4 md:px-16 py-12 md:py-20">
        <HowToUse />
      </section>

      {/* Real Results */}
      <section className="bg-white px-4 md:px-16 py-12 md:py-20">
        <div className="max-w-[1200px] mx-auto">
          <RevealDiv className="mb-12">
            <div className="text-[10px] tracking-[.25em] uppercase text-[#C65D3B] font-semibold mb-3">Real Results</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[clamp(28px,4vw,54px)] leading-[1.2] mb-3 font-normal text-[#0D0D0D]">
              What our customers are seeing.
            </h2>
            <p style={{ fontFamily: "'Playfair Display', serif" }} className="text-[16px] leading-[1.6] text-[#484848]">
              8–12 weeks. Consistent use. Real Indian skin.
            </p>
          </RevealDiv>

          {/* Sub-labels */}
          <RevealDiv className="mb-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 bg-[#F9F7F5] border border-[#EBEBEB] rounded-full px-4 py-2 text-[11px] font-semibold text-[#484848]">
                <span className="inline-block w-2 h-2 rounded-full bg-[#C65D3B]" />
                Before &amp; after photos
              </span>
              <span className="inline-flex items-center gap-2 bg-[#F9F7F5] border border-[#EBEBEB] rounded-full px-4 py-2 text-[11px] font-semibold text-[#484848]">
                <span className="inline-block w-2 h-2 rounded-full bg-[#25D366]" />
                Real WhatsApp feedback — unfiltered
              </span>
            </div>
          </RevealDiv>

          {/* Single unified scroll — 6 cards */}
          <div
            className="flex gap-5 overflow-x-auto pb-4 items-start"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#C65D3B #E8E4E0" }}
          >
            {/* 3 before/after photo cards */}
            {RESULTS.map((r, i) => (
              <RevealDiv key={`result-${i}`} delay={i * 60} className="flex-none w-[260px] md:w-[300px] rounded-[6px] overflow-hidden bg-[#F2EDE8]">
                <img src={r.img} alt="Before and after result" className="w-full h-auto block" />
              </RevealDiv>
            ))}

            {/* 3 WhatsApp screenshot cards — full image, no crop */}
            {WHATSAPP_REVIEWS.map((r, i) => (
              <RevealDiv key={`wa-${i}`} delay={(i + 3) * 60} className="flex-none w-[260px] md:w-[300px] bg-white rounded-[6px] border border-[#EBEBEB] overflow-hidden flex flex-col">
                <img
                  src={r.img}
                  alt={`WhatsApp review from ${r.name}`}
                  className="w-full h-auto block"
                />
                <div className="px-4 py-3 border-t border-[#EBEBEB]">
                  <span className="block text-[12px] font-semibold text-[#0D0D0D]">{r.name}</span>
                  <span className="block text-[10px] text-[#C65D3B] font-medium mt-[2px]">{r.product}</span>
                </div>
              </RevealDiv>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section id="story" className="bg-[#F9F7F5] px-4 md:px-16 py-12 md:py-20">
        <div className="max-w-[1200px] mx-auto">
          <RevealDiv className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="h-[220px] md:h-[400px] bg-[#F2EDE8] rounded-[4px] overflow-hidden">
              <img
                src="https://cdn.shopify.com/s/files/1/0971/5757/9042/files/rn-image_picker_lib_temp_66ba1ae5-d6eb-45c9-90dd-d830e002454d.png?v=1779168929"
                alt="Our Story"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 style={{ fontFamily: "'Cinzel', serif" }} className="text-[28px] md:text-[36px] font-semibold leading-[1.3] mb-6 text-[#0D0D0D] tracking-[.04em] uppercase">
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
      <div className="bg-white border-t border-b border-[#EBEBEB] py-8 px-8 md:px-16">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-5 text-center">
          <StatCounter target="50+" label="Women Tested" />
          <StatCounter target="4" label="Weeks Visible Results" />
          <StatCounter target="4" label="Products Made" />
          <StatCounter target="30" label="Day Guarantee" />
        </div>
      </div>

      {/* Reviews */}
      <section id="reviews" className="bg-white px-4 md:px-16 py-12 md:py-20">
        <div className="max-w-[1200px] mx-auto">

          {/* Header */}
          {(() => {
            const RATING_STATS: Record<string, { rating: string; count: number; bars: [string, number][] }> = {
              "All":                    { rating: "4.8", count: 203, bars: [["5 ★", 87], ["4 ★", 10], ["3 ★", 3]] },
              "Green Tea Face Wash":    { rating: "4.9", count: 58,  bars: [["5 ★", 93], ["4 ★", 5],  ["3 ★", 2]] },
              "Vitamin C Serum":        { rating: "4.8", count: 52,  bars: [["5 ★", 87], ["4 ★", 10], ["3 ★", 3]] },
              "Kojic Acid Moisturizer": { rating: "4.8", count: 48,  bars: [["5 ★", 85], ["4 ★", 12], ["3 ★", 3]] },
              "Fluid Sunscreen":        { rating: "4.7", count: 45,  bars: [["5 ★", 80], ["4 ★", 15], ["3 ★", 5]] },
            };
            const stats = RATING_STATS[reviewFilter] ?? RATING_STATS["All"];
            return (
          <RevealDiv className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="text-[10px] tracking-[.25em] uppercase text-[#C65D3B] font-semibold mb-3">Customer Reviews</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[clamp(28px,4vw,54px)] leading-[1.2] font-normal text-[#0D0D0D]">
                What people are saying.
              </h2>
            </div>
            <div className="flex items-center gap-5 flex-none pb-1">
              <div className="text-center">
                <div style={{ fontFamily: "'Cinzel', serif" }} className="text-[32px] font-semibold text-[#0D0D0D] leading-none">{stats.rating}</div>
                <div className="text-[#C8902A] text-[13px] tracking-[2px] mt-1">★★★★★</div>
                <div className="text-[10px] text-[#969696] mt-1 tracking-[.06em]">{stats.count} reviews</div>
              </div>
              <div className="w-px h-12 bg-[#EBEBEB]" />
              <div className="space-y-[5px]">
                {stats.bars.map(([label, pct]) => (
                  <div key={String(label)} className="flex items-center gap-2">
                    <span className="text-[10px] text-[#969696] w-8">{label}</span>
                    <div className="w-[80px] h-[5px] bg-[#F0EDE9] rounded-full overflow-hidden">
                      <div className="h-full bg-[#C8902A] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </RevealDiv>
            );
          })()}

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {["All", "Green Tea Face Wash", "Vitamin C Serum", "Kojic Acid Moisturizer", "Fluid Sunscreen"].map((tab) => (
              <button
                key={tab}
                onClick={() => setReviewFilter(tab)}
                className="px-4 py-2 rounded-full text-[11px] font-semibold tracking-[.06em] transition-all duration-200 border"
                style={
                  reviewFilter === tab
                    ? { background: "#C65D3B", color: "#fff", borderColor: "#C65D3B" }
                    : { background: "transparent", color: "#484848", borderColor: "#EBEBEB" }
                }
              >
                {tab === "All" ? `All (${ALL_REVIEWS.length})` : tab}
              </button>
            ))}
          </div>

          {/* Masonry grid */}
          {(() => {
            const filtered = ALL_REVIEWS.filter((r) => reviewFilter === "All" || r.product === reviewFilter);
            return <>
          <div
            className="columns-1 sm:columns-2 lg:columns-3 gap-4"
            style={{ columnGap: "1rem" }}
          >
            {filtered.map((r, i) => (
              <RevealDiv
                key={i}
                delay={Math.min(i * 40, 300)}
                className="break-inside-avoid mb-4 bg-[#F9F7F5] border border-[#EBEBEB] rounded-[6px] p-5 flex flex-col gap-3 hover:border-[#C65D3B] transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[#C8902A] text-[12px] tracking-[1.5px]">
                    {"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}
                  </span>
                  {reviewFilter === "All" && (
                    <span className="text-[9px] tracking-[.12em] uppercase font-semibold text-[#C65D3B] bg-[#FFF9F5] border border-[#F0D8CE] rounded-full px-2 py-[3px] flex-none">
                      {r.product}
                    </span>
                  )}
                </div>
                {r.title && (
                  <p style={{ fontFamily: "'Cinzel', serif" }} className="text-[12px] text-[#0D0D0D] font-semibold leading-snug">
                    {r.title}
                  </p>
                )}
                <p className="text-[13px] leading-[1.65] text-[#484848]">"{r.text}"</p>
                <div className="pt-2 border-t border-[#EBEBEB] flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-[#0D0D0D]">{r.name}</span>
                  <span className="text-[10px] text-[#969696]">{r.city} · Verified</span>
                </div>
              </RevealDiv>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-[11px] text-[#969696] tracking-[.08em]">
              Showing {filtered.length} of 203 verified reviews
              {reviewFilter !== "All" && ` for ${reviewFilter}`}
            </p>
          </div>
          </>;
          })()}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-white px-4 md:px-16 py-12 md:py-20">
        <div className="max-w-[780px] mx-auto">
          <RevealDiv className="mb-12">
            <div className="text-[10px] tracking-[.25em] uppercase text-[#C65D3B] font-semibold mb-3">FAQ</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[clamp(28px,4vw,54px)] leading-[1.2] font-normal text-[#0D0D0D]">
              Questions? Answered.
            </h2>
          </RevealDiv>
          <FaqAccordion />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0D0D0D] text-white px-8 md:px-16 py-16">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-10">
            <h3 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[24px] leading-[1.2] mb-4">Beauty, Bold and Beyond</h3>
            <p className="text-[14px] leading-[1.6] text-white/70 max-w-[400px]">Premium skincare formulated and manufactured in India. For Indian skin. By people who understand it.</p>
            <div className="flex flex-wrap gap-4 mt-5">
              <a href="https://instagram.com/the.jadeandbloom" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-3 bg-white/10 rounded-[4px] text-[12px] font-semibold hover:bg-white/15 transition-colors">
                <Instagram size={16} />
                <div><span className="block">Instagram</span><span className="block text-[10px] text-white/50">@the.jadeandbloom</span></div>
              </a>
              <a href="https://youtube.com/@jadeandbloom" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-3 bg-white/10 rounded-[4px] text-[12px] font-semibold hover:bg-white/15 transition-colors">
                <Youtube size={16} />
                <div><span className="block">YouTube</span><span className="block text-[10px] text-white/50">Jade and Bloom</span></div>
              </a>
              <a href="https://www.amazon.in/stores/JADEANDBLOOM/page/DB179800-10AB-4ECF-9C42-8A930E2E1531?lp_asin=B0FNCM9LFR&ref_=ast_bln&store_ref=bl_ast_dp_brandlogo_sto" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-3 bg-white/10 rounded-[4px] text-[12px] font-semibold hover:bg-white/15 transition-colors">
                <ExternalLink size={16} />
                <div><span className="block">Shop on Amazon</span><span className="block text-[10px] text-white/50">amazon.in</span></div>
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-10 mb-10">
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
              <button onClick={() => scrollTo("faq")} className="block text-[13px] text-white/65 mb-[10px] hover:text-white transition-colors text-left">FAQ</button>
            </div>
            <div>
              <div style={{ fontFamily: "'Cinzel', serif" }} className="text-[12px] tracking-[.15em] uppercase text-[#C65D3B] mb-3 font-semibold">Support</div>
              <a href="mailto:hello@thejadeandbloom.com" className="block text-[13px] text-white/65 mb-[10px] hover:text-white transition-colors">Contact Us</a>
              <button onClick={() => scrollTo("faq")} className="block text-[13px] text-white/65 mb-[10px] hover:text-white transition-colors text-left">Shipping Info</button>
              <button onClick={() => scrollTo("faq")} className="block text-[13px] text-white/65 mb-[10px] hover:text-white transition-colors text-left">Damage Policy</button>
              <a href="#" className="block text-[13px] text-white/65 mb-[10px] hover:text-white transition-colors">Privacy Policy</a>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-5 border-t border-white/10 gap-2 text-[12px] text-white/50">
            <span>© 2025 Jade and Bloom. All rights reserved.</span>
            <span className="text-[#C65D3B]">Formulated &amp; Made in India</span>
          </div>
        </div>
      </footer>

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

      {/* Concern Bundle Modal */}
      <ConcernBundleModal
        concern={activeConcern}
        onClose={() => setActiveConcern(null)}
      />

      {/* Floating WhatsApp button */}
      <WhatsAppButton />

      <style>{`
        .rv-on { opacity: 1 !important; transform: translateY(0) !important; }
      `}</style>
    </div>
  );
}
