import { useState, useEffect } from "react";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { totalQuantity, setIsCartOpen } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const navLinks = [
    { label: "Products", href: "#products" },
    { label: "Concerns", href: "#concerns" },
    { label: "Our Story", href: "#story" },
    { label: "Reviews", href: "#reviews" },
    { label: "FAQ", href: "#faq" },
  ];

  const scrollTo = (href: string) => {
    setDrawerOpen(false);
    setTimeout(() => {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  return (
    <>
      <header
        className="sticky top-0 z-[200] bg-white/97 border-b border-[#EBEBEB] h-[70px] flex items-center justify-between px-16 transition-shadow duration-300"
        style={{ boxShadow: scrolled ? "0 1px 16px rgba(0,0,0,.06)" : "none" }}
        data-testid="header"
      >
        <div className="flex flex-col items-center gap-[3px]">
          <span
            className="text-[14px] tracking-[.22em] text-[#0D0D0D] leading-none uppercase"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Jade and Bloom
          </span>
          <span className="text-[7.5px] tracking-[.3em] uppercase text-[#C65D3B] font-medium">
            Beauty, Bold and Beyond
          </span>
        </div>

        <nav className="hidden md:block">
          <ul className="flex gap-9 list-none">
            {navLinks.map((link) => (
              <li key={link.href}>
                <button
                  onClick={() => scrollTo(link.href)}
                  className="text-[11px] tracking-[.14em] uppercase text-[#484848] font-medium hover:text-[#0D0D0D] transition-colors duration-200 cursor-pointer bg-transparent border-none"
                  data-testid={`nav-${link.label.toLowerCase().replace(" ", "-")}`}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center justify-center w-9 h-9 rounded-sm hover:bg-[#F2EDE8] transition-colors"
            data-testid="cart-button"
          >
            <ShoppingBag size={18} strokeWidth={1.5} className="text-[#0D0D0D]" />
            {totalQuantity > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C65D3B] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none" data-testid="cart-count">
                {totalQuantity}
              </span>
            )}
          </button>

          <button
            onClick={() => setDrawerOpen(true)}
            className="flex md:hidden flex-col gap-[5px] w-9 h-9 items-center justify-center rounded-sm hover:bg-[#F2EDE8] transition-colors"
            data-testid="hamburger-button"
          >
            <span className="block w-5 h-[1.5px] bg-[#0D0D0D] rounded" />
            <span className="block w-5 h-[1.5px] bg-[#0D0D0D] rounded" />
            <span className="block w-5 h-[1.5px] bg-[#0D0D0D] rounded" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-[300] pointer-events-none transition-all ${drawerOpen ? "pointer-events-auto" : ""}`}
      >
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-350 ${drawerOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setDrawerOpen(false)}
        />
        <div
          className={`absolute top-0 right-0 bottom-0 w-[80%] max-w-[320px] bg-white flex flex-col transition-transform duration-350 ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}
          style={{ transitionTimingFunction: "cubic-bezier(.16,1,.3,1)" }}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#EBEBEB]">
            <span className="text-sm font-medium text-[#0D0D0D]">Menu</span>
            <button
              onClick={() => setDrawerOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F2EDE8] transition-colors"
              data-testid="drawer-close"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 py-6">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="block w-full text-left px-6 py-[14px] text-[13px] tracking-[.12em] uppercase text-[#0D0D0D] font-medium border-b border-[#EBEBEB] hover:bg-[#F2EDE8] transition-colors"
                data-testid={`mobile-nav-${link.label.toLowerCase().replace(" ", "-")}`}
              >
                {link.label}
              </button>
            ))}
            <a
              href="https://www.amazon.in/s?k=jade+and+bloom"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-left px-6 py-[14px] text-[13px] tracking-[.12em] uppercase text-[#0D0D0D] font-medium border-b border-[#EBEBEB] hover:bg-[#F2EDE8] transition-colors"
            >
              Shop on Amazon →
            </a>
          </div>
          <div className="p-6 border-t border-[#EBEBEB]">
            <button
              onClick={() => scrollTo("#products")}
              className="w-full bg-[#0D0D0D] text-white py-[10px] text-[11px] font-semibold tracking-[.12em] uppercase rounded-sm"
            >
              Shop Now
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
