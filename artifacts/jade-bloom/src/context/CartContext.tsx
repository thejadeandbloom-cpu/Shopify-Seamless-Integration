import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { cartCreate, cartLinesAdd, cartLinesAddBulk, cartDiscountCodesUpdate, cartLinesRemove, getCart } from '../lib/shopify';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  quantity: number;
  merchandiseId: string;
  title: string;
  productTitle: string;
  price: string;
  image?: string;
}

interface CartContextType {
  cartId: string | null;
  items: CartItem[];
  totalQuantity: number;
  totalAmount: string;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
  addRoutineToCart: (variantIds: string[], discountCode?: string) => Promise<void>;
  removeFromCart: (lineId: string) => Promise<void>;
  goToCheckout: () => void;
  isLoading: boolean;
  isAnyOverlayOpen: boolean;
  openOverlay: () => void;
  closeOverlay: () => void;
  stickyBarVisible: boolean;
  setStickyBarVisible: (v: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function getLoggedInDiscount(): string | null {
  try {
    const stored = localStorage.getItem('jb_customer');
    if (stored) return 'FIRST10';
  } catch { /* ignore */ }
  return null;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartId, setCartId] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState('0');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [overlayCount, setOverlayCount] = useState(0);
  const [stickyBarVisible, setStickyBarVisible] = useState(false);
  const { toast } = useToast();

  const openOverlay = useCallback(() => setOverlayCount((c) => c + 1), []);
  const closeOverlay = useCallback(() => setOverlayCount((c) => Math.max(0, c - 1)), []);
  const isAnyOverlayOpen = isCartOpen || overlayCount > 0;

  useEffect(() => {
    const initCart = async () => {
      const stored = localStorage.getItem('jb_cartId');
      if (stored) {
        setCartId(stored);
        await refreshCart(stored);
      }
    };
    initCart();
  }, []);

  const refreshCart = async (id: string) => {
    setIsLoading(true);
    try {
      const cart = await getCart(id);
      if (cart) {
        updateCartState(cart);
      } else {
        localStorage.removeItem('jb_cartId');
        setCartId(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCartState = (cart: any) => {
    setCheckoutUrl(cart.checkoutUrl);
    setTotalAmount(cart.cost.totalAmount.amount);
    const parsedItems = cart.lines.edges.map((e: any) => ({
      id: e.node.id,
      quantity: e.node.quantity,
      merchandiseId: e.node.merchandise.id,
      title: e.node.merchandise.title,
      productTitle: e.node.merchandise.product.title,
      price: e.node.merchandise.priceV2.amount,
      image: e.node.merchandise.product.featuredImage?.url ?? undefined,
    }));
    setItems(parsedItems);
  };

  // Creates a new cart and automatically applies FIRST10 if customer is logged in
  const createFreshCart = async (): Promise<string> => {
    const cart = await cartCreate();
    const id = cart.id;
    setCartId(id);
    localStorage.setItem('jb_cartId', id);
    updateCartState(cart);

    const discount = getLoggedInDiscount();
    if (discount) {
      try {
        const discountedCart = await cartDiscountCodesUpdate(id, [discount]);
        updateCartState(discountedCart);
      } catch { /* silently skip */ }
    }
    return id;
  };

  const addToCart = async (variantId: string, quantity = 1) => {
    setIsLoading(true);
    try {
      let currentCartId = cartId;
      if (!currentCartId) {
        currentCartId = await createFreshCart();
      }
      const updatedCart = await cartLinesAdd(currentCartId!, variantId, quantity);
      updateCartState(updatedCart);
      setIsCartOpen(true);
      toast({
        title: "Added to bag",
        description: getLoggedInDiscount()
          ? "FIRST10 discount applied at checkout."
          : "Your item has been added.",
      });
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to add item to bag. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addRoutineToCart = async (variantIds: string[], discountCode?: string) => {
    setIsLoading(true);
    try {
      let currentCartId = cartId;
      if (!currentCartId) {
        currentCartId = await createFreshCart();
      }
      const updatedCart = await cartLinesAddBulk(currentCartId!, variantIds);
      updateCartState(updatedCart);

      // Use the passed code, or fall back to logged-in discount
      const codeToApply = discountCode ?? getLoggedInDiscount();
      let discountApplied = false;
      if (codeToApply) {
        try {
          const discountedCart = await cartDiscountCodesUpdate(currentCartId!, [codeToApply]);
          updateCartState(discountedCart);
          discountApplied = true;
        } catch { /* silently skip */ }
      }

      setIsCartOpen(true);
      toast({
        title: "Full routine added!",
        description: codeToApply
          ? discountApplied
            ? `All 4 products added. Code ${codeToApply} applied at checkout.`
            : "All 4 products added. Apply your discount code at checkout."
          : "All 4 products added to your bag.",
      });
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to add routine. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (lineId: string) => {
    if (!cartId) return;
    setIsLoading(true);
    try {
      const updatedCart = await cartLinesRemove(cartId, [lineId]);
      updateCartState(updatedCart);
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to remove item.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const goToCheckout = () => {
    if (checkoutUrl) {
      window.open(checkoutUrl, '_self');
    }
  };

  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartId,
      items,
      totalQuantity,
      totalAmount,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      addRoutineToCart,
      removeFromCart,
      goToCheckout,
      isLoading,
      isAnyOverlayOpen,
      openOverlay,
      closeOverlay,
      stickyBarVisible,
      setStickyBarVisible,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
