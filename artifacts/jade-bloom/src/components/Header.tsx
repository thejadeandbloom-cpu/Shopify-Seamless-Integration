import { useState, useEffect, useRef } from "react";
import { ShoppingBag, X, User, LogOut, Star } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

interface HeaderProps {
  minimal?: boolean;
}

export default function Header({ minimal = false }: HeaderProps) {
  const [scrolled,    setScrolled]    = useState(false);
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [userDropOpen, setUserDropOpen] = useState(false);
  const { totalQuantity, setIsCartOpen } = useCart();
  const { customer, logout, isLoggedIn } = useCustomerAuth();
  const dropRef = useRef<HTMLDivElement>(null);

  const isHome = window.location.pathname === "/" ||
    window.location.pathname === (import.meta.env.BASE_PATH ?? "/");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setUserDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navLinks = [
    { label: "Products",  href: "#products"  },
    { label: "Concerns",  href: "#concerns"  },
    { label: "Our Story", href: "#story"     },
    { label: "Reviews",   href: "#reviews"   },
    { label: "FAQ",       href: "#faq"       },
  ];

  const scrollTo = (href: string) => {
    setDrawerOpen(false);
    if (isHome) {
      setTimeout(() => {
        const el = document.querySelector(href);
        el?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } else {
      window.location.href = `/${href}`;
    }
  };

  const Logo = () => (
    <img
      src="https://cdn.shopify.com/s/files/1/0971/5757/9042/files/Logo_Final_jpg.jpg?v=1775928161"
      alt="Jade and Bloom"
      className="h-[94px] w-auto object-contain"
      draggable={false}
    />
  );

  const shortEmail = customer?.email
    ? customer.email.split("@")[0].slice(0, 16) + (customer.email.split("@")[0].length > 16 ? "…" : "")
    : "";

  const UserSection = ({ mobile = false }: { mobile?: boolean }) => {
    if (isLoggedIn) {
      return (
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => setUserDropOpen((v) => !v)}
            className={`flex items-center gap-[6px] px-3 rounded-sm hover:bg-[#F2EDE8] transition-colors group ${mobile ? "h-10" : "h-9"}`}
            aria-label="My account"
          >
            <div className="w-6 h-6 rounded-full bg-[#C65D3B] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[10px] font-bold uppercase">
                {customer!.email[0]}
              </span>
            </div>
            {!mobile && (
              <span className="text-[10px] tracking-[.1em] uppercase font-semibold text-[#484848] group-hover:text-[#0D0D0D] transition-colors hidden lg:block">
                {shortEmail}
              </span>
            )}
          </button>

          {userDropOpen && (
            <div className="absolute right-0 top-full mt-1 w-[200px] bg-white border border-[#EBEBEB] rounded-[8px] shadow-lg z-[500] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#EBEBEB]">
                <div className="text-[9px] tracking-[.2em] uppercase text-[#969696] font-semibold">Signed in as</div>
                <div className="text-[12px] text-[#0D0D0D] font-medium truncate mt-[2px]">{customer!.email}</div>
              </div>
              <a
                href="/my-orders"
                className="flex items-center gap-3 px-4 py-[11px] text-[12px] font-semibold text-[#0D0D0D] hover:bg-[#F9F7F5] transition-colors"
                onClick={() => setUserDropOpen(false)}
              >
                <Star size={13} strokeWidth={1.8} className="text-[#C65D3B]" />
                My Reviews
              </a>
              <button
                onClick={() => { logout(); setUserDropOpen(false); }}
                className="flex items-center gap-3 w-full px-4 py-[11px] text-[12px] font-semibold text-[#969696] hover:bg-[#F9F7F5] hover:text-red-500 transition-colors border-t border-[#EBEBEB]"
              >
                <LogOut size={13} strokeWidth={1.8} />
                Sign out
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        onClick={() => { window.location.href = "/my-orders"; }}
        title="Login / My account"
        className={`flex-shrink-0 flex items-center gap-[6px] px-3 rounded-sm hover:bg-[#F2EDE8] transition-colors group ${mobile ? "w-10 h-10 justify-center" : "h-9"}`}
        aria-label="Login / My account"
      >
        <User size={mobile ? 19 : 17} strokeWidth={1.5} className="text-[#0D0D0D]" />
        {!mobile && (
          <span className="text-[10px] tracking-[.1em] uppercase font-semibold text-[#484848] group-hover:text-[#0D0D0D] transition-colors">
            Login
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      <header
        className="sticky top-0 z-[200] bg-white border-b border-[#EBEBEB] h-[100px] transition-shadow duration-300"
        style={{ boxShadow: scrolled ? "0 1px 16px rgba(0,0,0,.06)" : "none" }}
        data-testid="header"
      >
        {/* ── MOBILE layout ── */}
        <div className="flex md:hidden items-center h-full px-3">
          {/* Logo — left */}
          <div className="flex-1">
            <a href="/"><Logo /></a>
          </div>

          {/* Right side: user + cart + hamburger */}
          <div className="flex items-center gap-1">
            <UserSection mobile />

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-sm hover:bg-[#F2EDE8] transition-colors"
              data-testid="cart-button"
            >
              <ShoppingBag size={20} strokeWidth={1.5} className="text-[#0D0D0D]" />
              {totalQuantity > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#C65D3B] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none" data-testid="cart-count">
                  {totalQuantity}
                </span>
              )}
            </button>

            {!minimal && (
              <button
                onClick={() => setDrawerOpen(true)}
                className="flex-shrink-0 flex flex-col gap-[5px] w-10 h-10 items-center justify-center rounded-sm hover:bg-[#F2EDE8] transition-colors"
                aria-label="Open menu"
                data-testid="hamburger-button"
              >
                <span className="block w-[22px] h-[1.5px] bg-[#0D0D0D] rounded" />
                <span className="block w-[22px] h-[1.5px] bg-[#0D0D0D] rounded" />
                <span className="block w-[22px] h-[1.5px] bg-[#0D0D0D] rounded" />
              </button>
            )}
          </div>
        </div>

        {/* ── DESKTOP layout ── */}
        <div className="hidden md:flex items-center h-full px-6 lg:px-16">
          <div className="flex-shrink-0 mr-8">
            <a href="/"><Logo /></a>
          </div>

          {!minimal && (
            <nav className="flex-1 flex justify-center">
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
          )}

          {minimal && <div className="flex-1" />}

          <div className="flex items-center gap-1">
            <UserSection />
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-sm hover:bg-[#F2EDE8] transition-colors"
              data-testid="cart-button-desktop"
            >
              <ShoppingBag size={19} strokeWidth={1.5} className="text-[#0D0D0D]" />
              {totalQuantity > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#C65D3B] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none" data-testid="cart-count-desktop">
                  {totalQuantity}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      {!minimal && (
        <div className={`fixed inset-0 z-[300] ${drawerOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
          <div
            className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${drawerOpen ? "opacity-100" : "opacity-0"}`}
            onClick={() => setDrawerOpen(false)}
          />
          <div
            className={`absolute top-0 right-0 bottom-0 w-[80%] max-w-[320px] bg-white flex flex-col transition-transform duration-300 ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}
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
            <div className="flex-1 py-6 overflow-y-auto">
              {isLoggedIn ? (
                <>
                  <div className="flex items-center gap-3 px-6 py-[14px] border-b border-[#EBEBEB] bg-[#FFF5F2]">
                    <div className="w-7 h-7 rounded-full bg-[#C65D3B] flex items-center justify-center">
                      <span className="text-white text-[11px] font-bold uppercase">{customer!.email[0]}</span>
                    </div>
                    <span className="text-[12px] font-semibold text-[#0D0D0D] truncate">{customer!.email}</span>
                  </div>
                  <a
                    href="/my-orders"
                    className="flex items-center gap-3 w-full px-6 py-[14px] text-[13px] tracking-[.12em] uppercase text-[#C65D3B] font-semibold border-b border-[#EBEBEB] hover:bg-[#FFF5F2] transition-colors"
                    onClick={() => setDrawerOpen(false)}
                  >
                    <Star size={14} strokeWidth={1.8} />
                    My Reviews
                  </a>
                </>
              ) : (
                <a
                  href="/my-orders"
                  className="flex items-center gap-3 w-full px-6 py-[14px] text-[13px] tracking-[.12em] uppercase text-[#C65D3B] font-semibold border-b border-[#EBEBEB] hover:bg-[#FFF5F2] transition-colors"
                >
                  <User size={15} strokeWidth={1.5} />
                  Login / My account
                </a>
              )}
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
                href="https://www.amazon.in/stores/JADEANDBLOOM/page/DB179800-10AB-4ECF-9C42-8A930E2E1531?lp_asin=B0FNCM9LFR&ref_=ast_bln&store_ref=bl_ast_dp_brandlogo_sto"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-left px-6 py-[14px] text-[13px] tracking-[.12em] uppercase text-[#0D0D0D] font-medium border-b border-[#EBEBEB] hover:bg-[#F2EDE8] transition-colors"
              >
                Shop on Amazon →
              </a>
              {isLoggedIn && (
                <button
                  onClick={() => { logout(); setDrawerOpen(false); }}
                  className="flex items-center gap-3 w-full px-6 py-[14px] text-[13px] text-[#969696] font-medium hover:text-red-500 transition-colors"
                >
                  <LogOut size={14} strokeWidth={1.5} />
                  Sign out
                </button>
              )}
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
      )}
    </>
  );
}
