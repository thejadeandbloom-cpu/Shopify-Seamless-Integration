import { X, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, items, totalAmount, totalQuantity, removeFromCart, goToCheckout, isLoading } = useCart();

  const fmt = (amt: string) => {
    const n = parseFloat(amt);
    return isNaN(n) ? amt : `₹${Math.round(n).toLocaleString("en-IN")}`;
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-[400] pointer-events-none transition-all ${isCartOpen ? "pointer-events-auto" : ""}`}
      >
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isCartOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setIsCartOpen(false)}
        />
        <div
          className={`absolute top-0 right-0 bottom-0 w-full max-w-[420px] bg-white flex flex-col shadow-2xl transition-transform duration-300 ${isCartOpen ? "translate-x-0" : "translate-x-full"}`}
          style={{ transitionTimingFunction: "cubic-bezier(.16,1,.3,1)" }}
          data-testid="cart-drawer"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#EBEBEB]">
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} strokeWidth={1.5} className="text-[#0D0D0D]" />
              <span style={{ fontFamily: "'Cinzel', serif" }} className="text-[13px] tracking-[.12em] uppercase font-medium text-[#0D0D0D]">
                Your Bag
              </span>
              {totalQuantity > 0 && (
                <span className="w-5 h-5 bg-[#C65D3B] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {totalQuantity}
                </span>
              )}
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F2EDE8] transition-colors"
              data-testid="cart-close"
            >
              <X size={18} className="text-[#484848]" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-6 px-6 text-center">
                <div className="w-16 h-16 rounded-full bg-[#F2EDE8] flex items-center justify-center">
                  <ShoppingBag size={28} strokeWidth={1} className="text-[#C65D3B]" />
                </div>
                <div>
                  <p style={{ fontFamily: "'Playfair Display', serif" }} className="text-lg text-[#0D0D0D] mb-2">
                    Your bag is empty
                  </p>
                  <p className="text-[13px] text-[#969696]">Add products to your bag to get started.</p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="bg-[#0D0D0D] text-white px-8 py-3 text-[11px] font-semibold tracking-[.14em] uppercase rounded-sm hover:bg-[#C65D3B] transition-colors"
                  data-testid="cart-start-shopping"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-[#EBEBEB]">
                {items.map((item) => (
                  <li key={item.id} className="flex items-start gap-4 px-6 py-5" data-testid={`cart-item-${item.id}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#0D0D0D] mb-1 leading-tight">{item.productTitle}</p>
                      {item.title && item.title !== "Default Title" && (
                        <p className="text-[11px] text-[#969696] mb-2">{item.title}</p>
                      )}
                      <p className="text-[13px] text-[#C65D3B] font-semibold">{fmt(item.price)}</p>
                      <p className="text-[11px] text-[#969696] mt-1">Qty: {item.quantity}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="mt-1 w-7 h-7 flex items-center justify-center rounded text-[#969696] hover:text-[#C65D3B] hover:bg-[#F2EDE8] transition-colors flex-shrink-0"
                      data-testid={`remove-item-${item.id}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-[#EBEBEB] px-6 py-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#484848] font-medium">Total</span>
                <span style={{ fontFamily: "'Cinzel', serif" }} className="text-[18px] text-[#0D0D0D] font-semibold">
                  {fmt(totalAmount)}
                </span>
              </div>
              <p className="text-[10px] text-[#969696] tracking-[.08em] uppercase">Shipping calculated at checkout</p>
              <button
                onClick={goToCheckout}
                disabled={isLoading}
                className="w-full bg-[#C65D3B] text-white py-[14px] text-[11px] font-semibold tracking-[.16em] uppercase rounded-sm hover:bg-[#A84828] transition-colors disabled:opacity-60"
                data-testid="checkout-button"
              >
                {isLoading ? "Loading..." : "Proceed to Checkout"}
              </button>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-full border border-[#EBEBEB] text-[#484848] py-3 text-[11px] font-medium tracking-[.12em] uppercase rounded-sm hover:border-[#0D0D0D] transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
