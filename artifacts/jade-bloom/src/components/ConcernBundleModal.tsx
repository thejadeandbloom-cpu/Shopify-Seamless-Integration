import { useState, useEffect } from "react";
import { X, ShoppingBag, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getProduct } from "@/lib/shopify";

interface Product {
  handle: string;
  name: string;
  price: string;
  img: string;
  variantId?: string;
}

interface ConcernBundle {
  concern: string;
  tagline: string;
  products: Product[];
}

const CONCERN_BUNDLES: ConcernBundle[] = [
  {
    concern: "Dark Spots & Hyperpigmentation",
    tagline: "A targeted 3-step routine that blocks melanin production at every stage.",
    products: [
      { handle: "vitamin-c-serum", name: "14% Vitamin C Serum", price: "618", img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/rn-image_picker_lib_temp_dc6610da-ef7f-4601-a220-9a39070ba226.jpg?v=1779168760" },
      { handle: "kojic-acid-moisturizer", name: "Kojic Acid + Vitamin C Moisturizer", price: "449", img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/rn-image_picker_lib_temp_e3eac689-1807-47d8-8b98-279a4b3d09a1.png?v=1779168826" },
      { handle: "fluid-sunscreen", name: "Fluid Sunscreen SPF 50 PA++++", price: "489", img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/rn-image_picker_lib_temp_56d282bc-cec2-41e4-a230-e932af58ffc3.jpg?v=1779168858" },
    ],
  },
  {
    concern: "Dull & Tired Skin",
    tagline: "Brighten, exfoliate and restore your glow — morning and night.",
    products: [
      { handle: "green-tea-face-wash", name: "2% Green Tea Face Wash", price: "269", img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/rn-image_picker_lib_temp_4a417ad0-216e-4d69-973a-667118fc1af8.jpg?v=1779168775" },
      { handle: "vitamin-c-serum", name: "14% Vitamin C Serum", price: "618", img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/rn-image_picker_lib_temp_dc6610da-ef7f-4601-a220-9a39070ba226.jpg?v=1779168760" },
      { handle: "kojic-acid-moisturizer", name: "Kojic Acid + Vitamin C Moisturizer", price: "449", img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/rn-image_picker_lib_temp_e3eac689-1807-47d8-8b98-279a4b3d09a1.png?v=1779168826" },
    ],
  },
  {
    concern: "Dryness & Dehydration",
    tagline: "Lock in moisture and protect the barrier — from cleanser to SPF.",
    products: [
      { handle: "green-tea-face-wash", name: "2% Green Tea Face Wash", price: "269", img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/rn-image_picker_lib_temp_4a417ad0-216e-4d69-973a-667118fc1af8.jpg?v=1779168775" },
      { handle: "kojic-acid-moisturizer", name: "Kojic Acid + Vitamin C Moisturizer", price: "449", img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/rn-image_picker_lib_temp_e3eac689-1807-47d8-8b98-279a4b3d09a1.png?v=1779168826" },
      { handle: "fluid-sunscreen", name: "Fluid Sunscreen SPF 50 PA++++", price: "489", img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/rn-image_picker_lib_temp_56d282bc-cec2-41e4-a230-e932af58ffc3.jpg?v=1779168858" },
    ],
  },
  {
    concern: "Acne & Breakouts",
    tagline: "Clear pores, control oil and prevent breakouts at every step.",
    products: [
      { handle: "green-tea-face-wash", name: "2% Green Tea Face Wash", price: "269", img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/rn-image_picker_lib_temp_4a417ad0-216e-4d69-973a-667118fc1af8.jpg?v=1779168775" },
      { handle: "vitamin-c-serum", name: "14% Vitamin C Serum", price: "618", img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/rn-image_picker_lib_temp_dc6610da-ef7f-4601-a220-9a39070ba226.jpg?v=1779168760" },
      { handle: "fluid-sunscreen", name: "Fluid Sunscreen SPF 50 PA++++", price: "489", img: "https://cdn.shopify.com/s/files/1/0971/5757/9042/files/rn-image_picker_lib_temp_56d282bc-cec2-41e4-a230-e932af58ffc3.jpg?v=1779168858" },
    ],
  },
];

export { CONCERN_BUNDLES };

interface ConcernBundleModalProps {
  concern: string | null;
  onClose: () => void;
}

export default function ConcernBundleModal({ concern, onClose }: ConcernBundleModalProps) {
  const { addToCart, isLoading, openOverlay, closeOverlay } = useCart();
  const [adding, setAdding] = useState(false);
  const [variantIds, setVariantIds] = useState<Record<string, string>>({});
  const [fetchingVariants, setFetchingVariants] = useState(false);

  const bundle = CONCERN_BUNDLES.find((b) => b.concern === concern);

  // Register with global overlay counter only when modal is actually visible
  useEffect(() => {
    if (!bundle) return;
    openOverlay();
    return () => closeOverlay();
  }, [!!bundle]);

  useEffect(() => {
    if (!bundle) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [bundle]);

  useEffect(() => {
    if (!bundle) return;
    setFetchingVariants(true);
    const load = async () => {
      const ids: Record<string, string> = {};
      await Promise.all(
        bundle.products.map(async (p) => {
          if (!variantIds[p.handle]) {
            const product = await getProduct(p.handle);
            const vid = product?.variants?.edges?.[0]?.node?.id;
            if (vid) ids[p.handle] = vid;
          }
        })
      );
      setVariantIds((prev) => ({ ...prev, ...ids }));
      setFetchingVariants(false);
    };
    load();
  }, [concern]);

  if (!bundle) return null;

  const totalOriginal = bundle.products.reduce((sum, p) => sum + parseFloat(p.price), 0);
  const discount = 0.15;
  const totalDiscounted = Math.round(totalOriginal * (1 - discount));
  const savings = Math.round(totalOriginal * discount);

  const handleAddBundle = async () => {
    setAdding(true);
    try {
      for (const product of bundle.products) {
        const vid = variantIds[product.handle];
        if (vid) {
          await addToCart(vid, 1);
        }
      }
      onClose();
    } finally {
      setAdding(false);
    }
  };

  const allVariantsLoaded = bundle.products.every((p) => !!variantIds[p.handle]);

  return (
    <div className="fixed inset-0 z-[10001] flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className="relative w-full sm:max-w-[540px] bg-white rounded-t-2xl sm:rounded-xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: "90vh" }}
        data-testid="concern-bundle-modal"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-[#EBEBEB] flex-shrink-0">
          <div>
            <div className="text-[9px] tracking-[.22em] uppercase text-[#C65D3B] font-semibold mb-1">Bundle for</div>
            <h3 style={{ fontFamily: "'Cinzel', serif" }} className="text-[15px] font-semibold text-[#0D0D0D] tracking-[.04em] leading-tight mb-1">
              {bundle.concern}
            </h3>
            <p style={{ fontFamily: "'Playfair Display', serif" }} className="text-[13px] text-[#484848] leading-[1.5]">
              {bundle.tagline}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F2EDE8] transition-colors"
            data-testid="modal-close"
          >
            <X size={16} className="text-[#484848]" />
          </button>
        </div>

        {/* Products */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <div className="text-[10px] tracking-[.16em] uppercase text-[#969696] font-medium mb-3">
            {bundle.products.length} products included
          </div>
          {bundle.products.map((product, i) => (
            <div
              key={product.handle}
              className="flex items-center gap-4 p-3 bg-[#F9F7F5] rounded-lg border border-[#EBEBEB]"
              data-testid={`bundle-product-${product.handle}`}
            >
              <div className="w-14 h-14 rounded-md bg-white flex items-center justify-center overflow-hidden flex-shrink-0 border border-[#EBEBEB]">
                <img src={product.img} alt={product.name} className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-[#0D0D0D] leading-tight mb-[3px]">{product.name}</p>
                <div className="flex items-center gap-2">
                  <span style={{ fontFamily: "'Cinzel', serif" }} className="text-[12px] text-[#C65D3B] font-semibold">
                    ₹{product.price}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#C65D3B] text-white text-[10px] font-bold flex items-center justify-center">
                {i + 1}
              </div>
            </div>
          ))}
        </div>

        {/* Pricing + CTA */}
        <div className="p-6 pt-4 border-t border-[#EBEBEB] flex-shrink-0">
          {/* Discount badge */}
          <div className="flex items-center justify-between mb-4 p-3 bg-[#FFF9F5] rounded-lg border border-[#F2EDE8]">
            <div>
              <div className="text-[10px] tracking-[.1em] uppercase text-[#969696] font-medium mb-[2px]">Bundle savings</div>
              <div className="text-[13px] font-semibold text-[#0D0D0D]">
                Save <span className="text-[#C65D3B]">₹{savings}</span> (15% off)
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-[#969696] line-through mb-[1px]">₹{Math.round(totalOriginal)}</div>
              <div style={{ fontFamily: "'Cinzel', serif" }} className="text-[22px] text-[#0D0D0D] font-semibold leading-none">
                <span className="text-[14px] font-normal">₹</span>{totalDiscounted}
              </div>
            </div>
          </div>

          <button
            onClick={handleAddBundle}
            disabled={adding || isLoading || fetchingVariants || !allVariantsLoaded}
            className="w-full bg-[#C65D3B] text-white py-[14px] text-[11px] font-semibold tracking-[.18em] uppercase rounded-sm hover:bg-[#A84828] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            data-testid="add-bundle-to-cart"
          >
            {adding || fetchingVariants ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                {fetchingVariants ? "Loading..." : "Adding to Cart..."}
              </>
            ) : (
              <>
                <ShoppingBag size={14} />
                Add All {bundle.products.length} Products to Cart
              </>
            )}
          </button>
          <p className="text-center text-[10px] text-[#969696] mt-3">
            Bundle discount applied at checkout · 30-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  );
}
