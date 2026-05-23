import { useState, useEffect, useRef } from "react";
import { Instagram, Youtube, ExternalLink } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getProduct } from "@/lib/shopify";
import ConcernBundleModal from "@/components/ConcernBundleModal";
import FaqAccordion from "@/components/FaqAccordion";
import WhatsAppButton from "@/components/WhatsAppButton";
import HowToUse from "@/components/HowToUse";
import FormulationAndComparison from "@/components/FormulationAndComparison";

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
    tag: "Acne · Oily Skin",
    badge: "Clearer skin in 2–3 weeks",
    stat: "89% saw fewer breakouts in 3 weeks",
    stock: 14,
    name: "2% Green Tea Face Wash",
    desc: "1.5% Salicylic Acid clears pores and prevents breakouts. pH-balanced. Won't strip your skin.",
    price: "269",
    was: "399",
    stars: 4.8,
    reviewCount: 124,
    reviewId: "reviews-product-1",
    reviewsCount: 58,
    reviewFilter: "Green Tea Face Wash",
    imgBg: "#E3F0E8",
    img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/rn-image_picker_lib_temp_4a417ad0-216e-4d69-973a-667118fc1af8.jpg?v=1779168775",
    ingredients: [
      { n: "Camellia Sinensis (Green Tea) Extract", v: "2.0%" },
      { n: "Salicylic Acid", v: "1.5%" },
      { n: "Aloe Barbadensis (Aloe Vera) Extract", v: "2.0%" },
      { n: "Betaine", v: "1.0%" },
      { n: "Allantoin", v: "0.5%" },
      { n: "Tocopheryl Acetate (Vitamin E)", v: "0.5%" },
    ],
    fullInci: "Aqua, Cocamidopropyl Betaine, Sodium Lauroyl Sarcosinate, Propylene Glycol, Glycerin, Aloe Barbadensis Leaf Extract, Camellia Sinensis Leaf Extract, Salicylic Acid, Betaine, Allantoin, Tocopheryl Acetate, Citric Acid, Phenoxyethanol, Ethylhexylglycerin, Trisodium Ethylenediamine Disuccinate, Fragrance",
  },
  {
    handle: "14-vitamin-c-serum",
    tag: "Dark Spots · Dullness",
    badge: "Visible glow\nin 4 weeks",
    stat: "91% noticed brighter skin in 4 weeks",
    stock: 9,
    name: "14% Vitamin C Serum",
    desc: "Brightens. Boosts collagen. Fades dark spots. Lightweight. Won't oxidize.",
    price: "618",
    was: "899",
    stars: 4.8,
    reviewCount: 124,
    reviewId: "reviews-product-2",
    reviewsCount: 52,
    reviewFilter: "Vitamin C Serum",
    imgBg: "#FEF0DE",
    img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/rn-image_picker_lib_temp_dc6610da-ef7f-4601-a220-9a39070ba226.jpg?v=1779168760",
    ingredients: [
      { n: "3-O-Ethyl Ascorbic Acid (Vitamin C)", v: "14%" },
      { n: "Sodium Hyaluronate (Hyaluronic Acid)", v: "5%" },
      { n: "Niacinamide (Vitamin B3)", v: "2%" },
      { n: "Panthenol (Provitamin B5)", v: "1.5%" },
      { n: "Dipotassium Glycyrrhizate (Licorice Root)", v: "1.0%" },
      { n: "Tocopherol (Vitamin E)", v: "0.5%" },
    ],
    fullInci: "Aqua, 3-O-Ethyl Ascorbic Acid, Propanediol, Butylene Glycol, Glycerin, Sodium Hyaluronate, Niacinamide, Betaine, Panthenol, Dipotassium Glycyrrhizate, Allantoin, Tocopherol, Acrylates/C10-30 Alkyl Acrylate Crosspolymer, Phenoxyethanol, Ethylhexylglycerin, Triethanolamine, Sodium Gluconate",
  },
  {
    handle: "brightening-moisturiser",
    tag: "Dryness · Sensitivity",
    badge: "Hydrated within minutes",
    stat: "94% felt skin hydrated all day",
    stock: 11,
    name: "Kojic Acid Moisturizer",
    desc: "Locks hydration. Balances pH. Strengthens skin barrier. Non-comedogenic.",
    price: "449",
    was: "599",
    stars: 4.7,
    reviewCount: 98,
    reviewId: "reviews-product-3",
    reviewsCount: 48,
    reviewFilter: "Kojic Acid Moisturizer",
    imgBg: "#E2ECF8",
    img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/rn-image_picker_lib_temp_e3eac689-1807-47d8-8b98-279a4b3d09a1.png?v=1779168826",
    ingredients: [
      { n: "Niacinamide (Vitamin B3)", v: "5.0%" },
      { n: "3-O-Ethyl Ascorbic Acid (Vitamin C)", v: "5.0%" },
      { n: "Sodium Hyaluronate (Hyaluronic Acid)", v: "2.0%" },
      { n: "Kojic Acid", v: "1.0%" },
      { n: "Panthenol (Provitamin B5)", v: "1.0%" },
      { n: "Tocopherol (Vitamin E)", v: "0.5%" },
    ],
    fullInci: "Aqua, Glycerin, Caprylic/Capric Triglyceride, Cetearyl Alcohol, Niacinamide, Butylene Glycol, 3-O-Ethyl Ascorbic Acid, Glyceryl Stearate, PEG-100 Stearate, Dimethicone, Sodium Hyaluronate, Kojic Acid, Panthenol, Tocopherol, Allantoin, Carbomer, Triethanolamine, Phenoxyethanol, Ethylhexylglycerin, Trisodium Ethylenediamine Disuccinate, Fragrance",
  },
  {
    handle: "fluid-sunscreen-spf-50",
    tag: "UV Protection · Aging",
    badge: "Zero white cast.\nAll day.",
    stat: "96% reported zero white cast",
    stock: 6,
    name: "Fluid Sunscreen SPF 50 PA++++",
    desc: "Invisible. Weightless. Won't clog pores. Reef-safe.",
    price: "489",
    was: "699",
    stars: 4.9,
    reviewCount: 147,
    reviewId: "reviews-product-4",
    reviewsCount: 45,
    reviewFilter: "Fluid Sunscreen",
    imgBg: "#FBF5DF",
    img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/rn-image_picker_lib_temp_56d282bc-cec2-41e4-a230-e932af58ffc3.jpg?v=1779168858",
    ingredients: [
      { n: "Ethylhexyl Methoxycinnamate (Octinoxate)", v: "10%" },
      { n: "Zinc Oxide (Nano)", v: "8%" },
      { n: "Titanium Dioxide", v: "6%" },
      { n: "Avobenzone", v: "5%" },
      { n: "Sodium Hyaluronate (Hyaluronic Acid)", v: "2%" },
      { n: "Hippophae Rhamnoides (Sea Buckthorn)", v: "0.8%" },
    ],
    fullInci: "Aqua, Ethylhexyl Methoxycinnamate, Zinc Oxide, Titanium Dioxide, Butyl Methoxydibenzoylmethane, Caprylic/Capric Triglyceride, Cetearyl Alcohol, Glyceryl Stearate, Ceteareth-20, Glycerin, Aloe Barbadensis Leaf Juice, Sodium Hyaluronate, Hippophae Rhamnoides Fruit Extract, Tocopherol, Phenoxyethanol, Ethylhexylglycerin, Carbomer, Triethanolamine, Trisodium Ethylenediamine Disuccinate, Fragrance",
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
    name: "Fluid Sunscreen SPF 50 PA++++",
    subtitle: "Protector + Antioxidant",
    ingredients: [{ n: "Zinc Oxide", v: "8%" }, { n: "Titanium Dioxide", v: "6%" }, { n: "Avobenzone", v: "5%" }, { n: "Sea Buckthorn", v: "0.8%" }],
    benefit: "Broad-spectrum UV + antioxidant protection",
  },
];

const RESULTS = [
  { img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/file_000000008f707207b881a98a418432b8.png?v=1779354251" },
  { img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/file_0000000054987207a7784b6ae3988a34.png?v=1779354261" },
  { img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/file_00000000937c7207adbdbe1b7cf19d8e.png?v=1779354284" },
  { img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/IMG_4773.png?v=1779558440" },
];

const WHATSAPP_REVIEWS = [
  {
    img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/IMG-20260523-WA0051.jpg?v=1779558423",
    name: "Verified Customer",
    product: "14% Vitamin C Serum",
    quote: "",
  },
  {
    img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/IMG-20260523-WA0054.jpg?v=1779558408",
    name: "Verified Customer",
    product: "Kojic Acid + Vitamin C Moisturizer",
    quote: "",
  },
  {
    img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/IMG-20260523-WA0056.jpg?v=1779558397",
    name: "Verified Customer",
    product: "Full Routine",
    quote: "",
  },
  {
    img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/IMG-20260523-WA0058.jpg?v=1779558352",
    name: "Verified Customer",
    product: "Full Routine",
    quote: "",
  },
];

function getAvatarColor(name: string): string {
  const palette = ["#C65D3B", "#2A6BBF", "#3A8C5C", "#8B4A9C", "#C8902A", "#1A7A7A", "#B84545", "#5C6BC0"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

function getInitials(name: string): string {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

type Review = { stars: number; title?: string; text: string; name: string; city: string; product: string };
type ApiReview = { id: number; productLabel: string; customerName: string; city: string; rating: number; title: string; body: string };

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

function ProductCard({ product, index, onReviewClick, showIngredients, extraReviewCount = 0 }: { product: typeof PRODUCTS[0]; index: number; onReviewClick: (filter: string) => void; showIngredients: boolean; extraReviewCount?: number }) {
  const { addToCart, isLoading } = useCart();
  const [variantId, setVariantId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [showFullInci, setShowFullInci] = useState(false);

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
    <RevealDiv delay={index * 80} className="rounded-[8px] overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
      {/* Product name — above image for instant scannability */}
      <div
        className="px-3 pt-3 pb-2"
        style={{ background: product.imgBg }}
      >
        <div style={{ fontFamily: "'Cinzel', serif" }} className="text-[11px] md:text-[12px] tracking-[.04em] text-[#0D0D0D] leading-snug font-semibold uppercase">
          {product.name}
        </div>
      </div>

      {/* Image area — same bg continues, aspect-ratio driven */}
      <div
        className="relative w-full overflow-hidden"
        style={{ background: product.imgBg, aspectRatio: "4/5" }}
      >
        <img
          src={product.img}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-contain p-2"
          data-testid={`product-img-${product.handle}`}
        />
      </div>

      {/* Info */}
      <div className="p-3 md:p-4 flex-1 flex flex-col gap-2">
        {/* Benefit badge */}
        <span className="text-[10px] font-semibold text-[#C65D3B] bg-[#FFF9F5] border border-[#F2E0D6] px-2 py-[3px] rounded-full w-full text-center block whitespace-pre-line leading-[1.4]">
          {product.badge}
        </span>

        {/* Star rating — own row */}
        <button
          onClick={() => onReviewClick(product.reviewFilter)}
          className="flex items-center gap-[4px] w-fit hover:opacity-70 transition-opacity"
        >
          <span className="text-[#C8902A] text-[11px] leading-none">★</span>
          <span className="text-[11px] font-semibold text-[#0D0D0D] leading-none">{product.stars}</span>
          <span className="text-[11px] text-[#969696] leading-none">({product.reviewsCount + extraReviewCount})</span>
        </button>

        {/* Before/after stat */}
        <div className="text-[9.5px] text-[#484848] leading-snug bg-[#F9F7F5] rounded px-2 py-[5px] border-l-2 border-[#C65D3B]">
          {product.stat}
        </div>

        {/* Urgency — low stock FOMO */}
        {product.stock <= 15 && (
          <div className="flex items-center gap-1">
            <span className="w-[6px] h-[6px] rounded-full bg-[#E05C2A] animate-pulse flex-shrink-0" />
            <span className="text-[9px] font-semibold text-[#E05C2A] tracking-[.04em]">Only {product.stock} left</span>
          </div>
        )}

        {/* Price row */}
        <div className="flex items-baseline gap-[5px] mt-auto pt-1">
          <span style={{ fontFamily: "'Cinzel', serif" }} className="text-[17px] md:text-[19px] text-[#0D0D0D] font-semibold leading-none">
            ₹{product.price}
          </span>
          <span className="text-[11px] text-[#ABABAB] line-through">₹{product.was}</span>
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={adding || isLoading}
          className="mt-1 w-full py-[10px] bg-[#0D0D0D] text-white text-[9px] tracking-[.18em] uppercase font-bold rounded-[3px] hover:bg-[#C65D3B] transition-colors duration-200 disabled:opacity-50"
          data-testid={`add-to-cart-${product.handle}`}
        >
          {adding ? "Adding..." : "Add to Cart"}
        </button>

        {/* Trust badges */}
        <div className="flex flex-wrap gap-[4px] mt-2">
          {["🇮🇳 Made in India", "🐰 Cruelty-Free", "✓ Paraben & Sulphate Free", "⚗ pH Balanced"].map((b) => (
            <span key={b} className="text-[8px] text-[#484848] bg-[#F4F4F4] border border-[#E5E5E5] rounded-full px-[6px] py-[2px] leading-snug">
              {b}
            </span>
          ))}
        </div>

        {/* Key Ingredients panel — controlled globally */}
        {showIngredients && (
          <div className="mt-2 border-t border-[#EBEBEB] pt-2">
            <p style={{ fontFamily: "'Cinzel', serif" }} className="text-[9px] tracking-[.12em] uppercase text-[#969696] mb-[6px]">Key Actives</p>
            {product.ingredients.map(({ n, v }) => (
              <div key={n} className="flex items-start justify-between gap-2 py-[3px] border-b border-[#F4F4F4] last:border-0">
                <span className="text-[10px] text-[#484848] leading-snug">{n}</span>
                <span className="text-[10px] font-semibold text-[#C65D3B] flex-none">{v}</span>
              </div>
            ))}
            <button
              onClick={() => setShowFullInci((v) => !v)}
              className="mt-2 text-[9px] text-[#969696] hover:text-[#C65D3B] transition-colors underline underline-offset-2 w-full text-left"
            >
              {showFullInci ? "Hide full ingredient list" : "View full ingredient list (INCI)"}
            </button>
            {showFullInci && (
              <p className="text-[9px] text-[#969696] leading-[1.7] mt-1">{product.fullInci}</p>
            )}
          </div>
        )}
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

const PRODUCTS_LIST = ["Face Wash", "Vitamin C Serum", "Kojic Acid Moisturizer", "Fluid Sunscreen"];

const BASE_URL = import.meta.env.BASE_URL ?? "/";
const API_BASE = `${BASE_URL}api`.replace(/\/+/g, "/");

function RefundClaimForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    orderId: "",
    product: "",
    purchaseDate: "",
    usageLog: "",
    reason: "",
    bankDetails: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch(`${API_BASE}/refund-claims`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error || "Submission failed");
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full bg-white/5 border border-white/15 rounded-[4px] px-3 py-[10px] text-[13px] text-white placeholder-white/30 focus:outline-none focus:border-[#C65D3B] transition-colors";
  const labelCls = "block text-[11px] tracking-[.14em] uppercase text-white/50 font-semibold mb-[6px]";

  if (submitted) {
    return (
      <div id="refund-claim" className="border border-white/10 rounded-[8px] p-8 mb-10 text-center">
        <div className="text-[#C65D3B] text-[28px] mb-3">✓</div>
        <h3 style={{ fontFamily: "'Cinzel', serif" }} className="text-[16px] text-white mb-2">Claim Received</h3>
        <p className="text-[13px] text-white/60 max-w-[400px] mx-auto">
          Your refund claim has been submitted. We'll review it and respond to your email within 48 hours.
        </p>
        <button onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", orderId: "", product: "", purchaseDate: "", usageLog: "", reason: "", bankDetails: "" }); }} className="mt-5 text-[11px] text-[#C65D3B] hover:underline tracking-[.1em] uppercase">
          Submit another claim
        </button>
      </div>
    );
  }

  return (
    <div id="refund-claim" className="border border-white/10 rounded-[8px] p-6 md:p-8 mb-10">
      <div className="text-[10px] tracking-[.25em] uppercase text-[#C65D3B] font-semibold mb-2">30-Day Results Guarantee</div>
      <h3 style={{ fontFamily: "'Cinzel', serif" }} className="text-[18px] text-white mb-1">Refund Claim Form</h3>
      <p className="text-[12px] text-white/45 mb-6">Used the product consistently for 30 days and didn't see results? Submit your claim below. A daily usage log is required. Claims must be within 30 days of purchase.</p>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <div>
          <label className={labelCls}>1. Your Name</label>
          <input required className={inputCls} placeholder="Full name" value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>

        <div>
          <label className={labelCls}>2. Email Address</label>
          <input required type="email" className={inputCls} placeholder="you@email.com" value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </div>

        <div>
          <label className={labelCls}>3. Phone Number</label>
          <input required className={inputCls} placeholder="+91 98765 43210" value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        </div>

        <div>
          <label className={labelCls}>4. Order ID</label>
          <input required className={inputCls} placeholder="e.g. JB-10234 (from your order confirmation email)" value={form.orderId}
            onChange={(e) => setForm((f) => ({ ...f, orderId: e.target.value }))} />
        </div>

        <div>
          <label className={labelCls}>5. Product</label>
          <select required className={`${inputCls} appearance-none`} value={form.product}
            onChange={(e) => setForm((f) => ({ ...f, product: e.target.value }))}>
            <option value="">Select product</option>
            {PRODUCTS_LIST.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div>
          <label className={labelCls}>6. Purchase Date</label>
          <input required type="date" className={inputCls} value={form.purchaseDate}
            onChange={(e) => setForm((f) => ({ ...f, purchaseDate: e.target.value }))} />
        </div>

        <div className="md:col-span-2">
          <label className={labelCls}>7. Daily Usage Log</label>
          <div className="border border-dashed border-white/15 rounded-[4px] px-4 py-4 mb-2 text-[12px] text-white/40 leading-[1.7]">
            A daily log proves consistent 30-day use. Accepted formats:<br />
            <span className="text-white/60">• Google Photos / Drive link with dated photos (Day 1 to Day 30)</span><br />
            <span className="text-white/60">• Instagram story highlights or WhatsApp media album link</span><br />
            <span className="text-white/60">• Written diary with dates (paste it below)</span>
          </div>
          <textarea required rows={4} className={`${inputCls} resize-none`}
            placeholder="Paste your log link (Google Drive, Instagram, etc.) or describe your 30-day routine day by day..."
            value={form.usageLog} onChange={(e) => setForm((f) => ({ ...f, usageLog: e.target.value }))} />
        </div>

        <div className="md:col-span-2">
          <label className={labelCls}>8. What results did you expect vs. what you experienced?</label>
          <textarea required rows={3} className={`${inputCls} resize-none`}
            placeholder="e.g. Expected dark spots to fade, but no visible change after 30 days of consistent morning use..."
            value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} />
        </div>

        <div className="md:col-span-2">
          <label className={labelCls}>9. Bank / UPI Details for Refund</label>
          <input required className={inputCls} placeholder="UPI ID or Bank Account + IFSC" value={form.bankDetails}
            onChange={(e) => setForm((f) => ({ ...f, bankDetails: e.target.value }))} />
        </div>

        {submitError && (
          <div className="md:col-span-2 text-[12px] text-red-400 bg-red-900/20 border border-red-800/30 rounded-[4px] px-3 py-2">
            {submitError}
          </div>
        )}

        <div className="md:col-span-2">
          <button type="submit" disabled={submitting}
            className="w-full py-[13px] bg-[#C65D3B] text-white text-[11px] tracking-[.18em] uppercase font-bold rounded-[4px] hover:bg-[#A84828] transition-colors disabled:opacity-50">
            {submitting ? "Submitting..." : "Submit Refund Claim"}
          </button>
          <p className="text-[10px] text-white/30 mt-2 text-center">Must be within 30 days of purchase · Daily log required · One claim per 12 months · Excludes bundles</p>
        </div>
      </form>
    </div>
  );
}

const INSTAGRAM_REELS = [
  "https://www.instagram.com/reel/DVf8wn7DPOx/",
  "https://www.instagram.com/reel/DVQvKZJCCZv/",
  "https://www.instagram.com/reel/DVV4UhnDfmQ/",
  "https://www.instagram.com/reel/DV6ksDvCKYA/",
];

function InstagramReels() {
  useEffect(() => {
    const id = "instagram-embed-script";
    if (document.getElementById(id)) {
      // Script already present — just re-process
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).instgrm?.Embeds?.process();
      return;
    }
    const script = document.createElement("script");
    script.id = id;
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).instgrm?.Embeds?.process();
    };
    document.body.appendChild(script);
  }, []);

  return (
    <section className="bg-[#F9F7F5] px-4 md:px-16 py-12 md:py-20">
      <div className="max-w-[1200px] mx-auto">
        <RevealDiv className="mb-10 text-center">
          <div className="text-[10px] tracking-[.25em] uppercase text-[#C65D3B] font-semibold mb-3">As Seen On Instagram</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[clamp(24px,3.5vw,44px)] leading-[1.2] font-normal text-[#0D0D0D]">
            Real People. Real Results.
          </h2>
          <p className="text-[14px] text-[#969696] mt-3">
            Follow us{" "}
            <a href="https://instagram.com/the.jadeandbloom" target="_blank" rel="noopener noreferrer" className="text-[#C65D3B] hover:underline">
              @the.jadeandbloom
            </a>
          </p>
        </RevealDiv>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {INSTAGRAM_REELS.map((url) => (
            <RevealDiv key={url} className="w-full">
              <blockquote
                className="instagram-media w-full !min-w-0 !max-w-full"
                data-instgrm-permalink={url}
                data-instgrm-version="14"
                style={{
                  background: "#FFF",
                  border: 0,
                  borderRadius: "8px",
                  boxShadow: "0 1px 8px rgba(0,0,0,.08)",
                  margin: 0,
                  padding: 0,
                  width: "100%",
                  minWidth: "0 !important",
                }}
              />
            </RevealDiv>
          ))}
        </div>
      </div>
    </section>
  );
}


const HERO_VIDEOS = [
  "https://cdn.shopify.com/videos/c/o/v/c1c44399d9654bfa93ae10f6a6d9e774.mp4",
];

export default function Home() {
  const { setStickyBarVisible, stickyBarVisible } = useCart();
  const [activeConcern, setActiveConcern] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState(0);
  const [showProductIngredients, setShowProductIngredients] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const onScroll = () => setStickyBarVisible(window.scrollY > 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.load();
    v.play().catch(() => {});
  }, [activeVideo]);

  const handleVideoEnd = () => setActiveVideo((prev) => (prev + 1) % HERO_VIDEOS.length);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const [reviewFilter, setReviewFilter] = useState("All");
  const [dynamicReviews, setDynamicReviews] = useState<ApiReview[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/reviews`)
      .then((r) => r.ok ? r.json() : [])
      .then((data: ApiReview[]) => setDynamicReviews(data))
      .catch(() => {});
  }, []);

  const mergedReviews: Review[] = [
    ...ALL_REVIEWS,
    ...dynamicReviews.map((r) => ({
      stars: r.rating,
      title: r.title || undefined,
      text: r.body,
      name: r.customerName,
      city: r.city || "India",
      product: r.productLabel,
    })),
  ];

  const getDynamicCount = (filter: string) => dynamicReviews.filter((r) => r.productLabel === filter).length;

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

      {/* Trust signals bar — auto-scrolling marquee */}
      <div className="bg-[#F9F7F5] border-b border-[#EBEBEB] py-3 overflow-hidden">
        <style>{`
          @keyframes marquee {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .marquee-track { animation: marquee 22s linear infinite; }
          .marquee-track:hover { animation-play-state: paused; }
        `}</style>
        <div className="flex marquee-track w-max text-[11px] tracking-[.1em] text-[#484848]">
          {[...Array(2)].map((_, pass) =>
            ["Cruelty-Free", "Paraben-Free", "pH Balanced (4.5–5.5)", "COD Available", "Dispatch in 24 hrs", "Science-Backed Formulas"].map((t) => (
              <span key={`${pass}-${t}`} className="whitespace-nowrap mx-8">
                <b className="text-[#C65D3B]">✓</b> {t}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Hero — full-bleed video */}
      <section
        className="relative w-full overflow-hidden"
        style={{ height: "clamp(520px, 88vh, 780px)" }}
        data-testid="hero"
      >
        {/* Video */}
        <video
          ref={videoRef}
          key={activeVideo}
          autoPlay
          muted
          playsInline
          loop
          onEnded={handleVideoEnd}
          poster="https://cdn.shopify.com/s/files/1/0971/5757/9042/files/rn-image_picker_lib_temp_dc6610da-ef7f-4601-a220-9a39070ba226.jpg?v=1779168760"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={HERO_VIDEOS[activeVideo]} type="video/mp4" />
        </video>

        {/* Gradient overlay — stronger at bottom for text legibility */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.10) 40%, rgba(0,0,0,0.72) 100%)" }}
        />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end px-6 pb-10 md:pb-14 md:px-16 max-w-[680px]">
          {/* Social proof */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[#F5C842] text-[13px] tracking-[2px]">★★★★★</span>
            <span className="text-[10px] tracking-[.2em] uppercase text-white/80 font-semibold">50+ women tested</span>
          </div>

          <h1
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-[clamp(34px,6vw,66px)] leading-[1.12] font-normal text-white mb-4"
          >
            Your Dark Spots<br />
            Don't Stand{" "}
            <em className="italic" style={{ color: "#FFD580" }}>a Chance.</em>
          </h1>

          <p className="text-[14px] leading-[1.6] text-white/85 mb-7 max-w-[400px]">
            14% Vitamin C melts into skin. Kojic Acid blocks melanin. See the difference in 4 weeks — or your money back.
            <a
              href="#faq-guarantee"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = "faq-guarantee";
                document.getElementById("faq-guarantee")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              aria-label="See our 30-day money-back guarantee details"
              className="inline-block align-super text-[10px] text-[#FFD580] hover:text-white transition-colors ml-[2px] leading-none"
            >
              *
            </a>
          </p>

          {/* Trust badge */}
          <div className="flex items-center gap-2 mb-5">
            <span className="text-[#F5C842] text-[12px] tracking-[1px]">★★★★★</span>
            <span className="text-[11px] text-white/90 font-semibold">4.8 &nbsp;·&nbsp; 200+ Reviews</span>
          </div>

          <div className="flex gap-3 flex-wrap mb-6">
            <button
              onClick={() => scrollTo("products")}
              className="bg-white text-[#0D0D0D] px-7 py-[13px] rounded-[3px] text-[10px] font-bold tracking-[.18em] uppercase hover:bg-[#F2EDE8] transition-colors duration-200"
              data-testid="hero-cta-primary"
            >
              Start Your Routine
            </button>
            <button
              onClick={() => scrollTo("concerns")}
              className="border border-white/70 text-white px-7 py-[13px] rounded-[3px] text-[10px] font-bold tracking-[.18em] uppercase hover:bg-white/10 transition-colors duration-200 hidden sm:inline-flex"
              data-testid="hero-cta-secondary"
            >
              Shop by Concern
            </button>
          </div>

          {/* Video dots */}
          <div className="flex items-center gap-2">
            {HERO_VIDEOS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveVideo(i)}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: i === activeVideo ? 20 : 6,
                  height: 6,
                  background: i === activeVideo ? "#fff" : "rgba(255,255,255,0.45)",
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="bg-[#F9F7F5] px-4 md:px-16 py-12 md:py-20">
        <div className="max-w-[1200px] mx-auto">
          <RevealDiv className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="text-[10px] tracking-[.25em] uppercase text-[#C65D3B] font-semibold mb-3">The Collection</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[clamp(28px,4vw,54px)] leading-[1.2] mb-3 font-normal text-[#0D0D0D]">
                Four products. Your complete routine.
              </h2>
              <p style={{ fontFamily: "'Playfair Display', serif" }} className="text-[16px] leading-[1.6] text-[#484848]">
                Formulated together. Used in order. Designed for Indian skin.
              </p>
            </div>
            <button
              onClick={() => setShowProductIngredients((v) => !v)}
              className="flex-none flex items-center gap-2 px-4 py-[9px] border border-[#EBEBEB] rounded-full text-[10px] font-semibold tracking-[.08em] text-[#484848] hover:border-[#C65D3B] hover:text-[#C65D3B] transition-colors bg-white whitespace-nowrap"
            >
              <span>{showProductIngredients ? "▴" : "▾"}</span>
              {showProductIngredients ? "Hide Ingredients" : "See Ingredients"}
            </button>
          </RevealDiv>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 mt-6">
            {PRODUCTS.map((p, i) => <ProductCard key={p.handle} product={p} index={i} onReviewClick={handleReviewClick} showIngredients={showProductIngredients} extraReviewCount={getDynamicCount(p.reviewFilter)} />)}
          </div>
        </div>
      </section>

      {/* Formulation + Comparison */}
      <FormulationAndComparison />

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


      {/* How to Use */}
      <section id="routine" className="bg-[#F9F7F5] px-4 md:px-16 py-12 md:py-20">
        <HowToUse />
      </section>

      {/* Real Results */}
      <section className="bg-[#0D0D0D] px-4 md:px-16 py-14 md:py-22">
        <div className="max-w-[1200px] mx-auto">

          {/* Header */}
          <RevealDiv className="mb-10 md:mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="text-[10px] tracking-[.25em] uppercase text-[#C65D3B] font-semibold mb-3">Real Results</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[clamp(28px,4vw,52px)] leading-[1.15] font-normal text-white">
                What our customers<br className="hidden md:block" /> are seeing.
              </h2>
            </div>
            <p className="text-white/40 text-[13px] leading-[1.7] max-w-[260px]">
              8–12 weeks. Consistent use.<br />Real Indian skin.
            </p>
          </RevealDiv>

          {/* Two rows: before/after + screenshots */}

          {/* Row 1 — Before & After */}
          <RevealDiv className="mb-3">
            <span className="inline-flex items-center gap-2 px-3 py-[5px] rounded-full border border-white/10 text-[10px] tracking-[.14em] uppercase font-semibold text-white/40 mb-5 block w-fit">
              <span className="w-[6px] h-[6px] rounded-full bg-[#C65D3B] inline-block" />
              Before &amp; After
            </span>
          </RevealDiv>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
            {RESULTS.map((r, i) => (
              <RevealDiv
                key={`result-${i}`}
                delay={i * 60}
                className="rounded-[10px] overflow-hidden bg-[#1A1A1A]"
              >
                <img
                  src={r.img}
                  alt="Before and after result"
                  className="w-full h-auto block"
                />
              </RevealDiv>
            ))}
          </div>

          {/* Row 2 — Customer Screenshots */}
          <RevealDiv className="mb-3">
            <span className="inline-flex items-center gap-2 px-3 py-[5px] rounded-full border border-white/10 text-[10px] tracking-[.14em] uppercase font-semibold text-white/40 mb-5 block w-fit">
              <span className="w-[6px] h-[6px] rounded-full bg-[#25D366] inline-block" />
              Customer Messages
            </span>
          </RevealDiv>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {WHATSAPP_REVIEWS.map((r, i) => (
              <RevealDiv
                key={`wa-${i}`}
                delay={i * 60}
                className="rounded-[10px] overflow-hidden ring-1 ring-white/[0.07] bg-[#1A1A1A]"
              >
                <img
                  src={r.img}
                  alt="Customer message"
                  className="w-full h-auto block"
                />
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
            const reviewSet = reviewFilter === "All" ? mergedReviews : mergedReviews.filter((r) => r.product === reviewFilter);
            const totalCount = reviewSet.length;
            const avg = totalCount > 0 ? (reviewSet.reduce((s, r) => s + r.stars, 0) / totalCount).toFixed(1) : "4.8";
            const pct = (n: number) => totalCount > 0 ? Math.round(reviewSet.filter((r) => r.stars === n).length / totalCount * 100) : 0;
            const stats = { rating: avg, count: totalCount, bars: [["5 ★", pct(5)], ["4 ★", pct(4)], ["3 ★", pct(3)]] as [string, number][] };
            return (
          <RevealDiv className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="text-[10px] tracking-[.25em] uppercase text-[#C65D3B] font-semibold mb-3">Customer Reviews</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[clamp(28px,4vw,54px)] leading-[1.2] font-normal text-[#0D0D0D]">
                What people are saying.
              </h2>
              <a
                href="/write-review"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 border border-[#C65D3B] text-[#C65D3B] text-[11px] font-bold tracking-[.1em] uppercase rounded-[3px] hover:bg-[#C65D3B] hover:text-white transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8.5 1.5l2 2-7 7H1.5v-2l7-7z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Write a Review
              </a>
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
                {tab === "All" ? `All (${mergedReviews.length})` : tab}
              </button>
            ))}
          </div>

          {/* Masonry grid */}
          {(() => {
            const filtered = mergedReviews.filter((r) => reviewFilter === "All" || r.product === reviewFilter);
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
                <div className="pt-2 border-t border-[#EBEBEB] flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-none"
                    style={{ background: getAvatarColor(r.name) }}
                  >
                    {getInitials(r.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[12px] font-semibold text-[#0D0D0D] block leading-none">{r.name}</span>
                    <span className="text-[10px] text-[#969696]">{r.city} · Verified</span>
                  </div>
                </div>
              </RevealDiv>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-[11px] text-[#969696] tracking-[.08em]">
              Showing {filtered.length} of {mergedReviews.length} verified reviews
              {reviewFilter !== "All" && ` for ${reviewFilter}`}
            </p>
          </div>
          </>;
          })()}
        </div>
      </section>

      {/* Instagram Reels */}
      <InstagramReels />

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
              <p style={{ fontFamily: "'Cinzel', serif" }} className="text-[11px] tracking-[.1em] uppercase text-white/30 mb-2">Email</p>
              <a href="mailto:support@thejadeandbloom.com" className="block text-[13px] text-white/65 mb-[14px] hover:text-white transition-colors">support@thejadeandbloom.com</a>
              <p style={{ fontFamily: "'Cinzel', serif" }} className="text-[11px] tracking-[.1em] uppercase text-white/30 mb-2">WhatsApp</p>
              <a href="https://wa.me/918750557322" target="_blank" rel="noopener noreferrer" className="block text-[13px] text-white/65 mb-[14px] hover:text-white transition-colors">+91 87505 57322</a>
              <button onClick={() => scrollTo("faq")} className="block text-[13px] text-white/65 mb-[10px] hover:text-white transition-colors text-left">Shipping Info</button>
              <button onClick={() => scrollTo("faq")} className="block text-[13px] text-white/65 mb-[10px] hover:text-white transition-colors text-left">Damage Policy</button>
              <button onClick={() => scrollTo("faq")} className="block text-[13px] text-white/65 mb-[10px] hover:text-white transition-colors text-left">Privacy Policy</button>
            </div>
          </div>
          {/* 60-Day Refund Claim Form */}
          <RefundClaimForm />

          <div className="flex flex-col md:flex-row items-center justify-between pt-5 border-t border-white/10 gap-2 text-[12px] text-white/50">
            <span>© 2025 Jade and Bloom. All rights reserved.</span>
            <span className="text-[#C65D3B]">Formulated &amp; Made in India</span>
          </div>
        </div>
      </footer>

      {/* Sticky Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[150] bg-[#0D0D0D] text-white px-5 flex items-center justify-between text-[13px] transition-transform duration-300"
        style={{ transform: stickyBarVisible ? "translateY(0)" : "translateY(100%)", transitionTimingFunction: EASE, paddingTop: "12px", paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
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
