import React, { createContext, useContext, useEffect, useState } from 'react';
import { cartCreate, cartLinesAdd, cartLinesRemove, getCart } from '../lib/shopify';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  quantity: number;
  merchandiseId: string;
  title: string;
  productTitle: string;
  price: string;
}

interface CartContextType {
  cartId: string | null;
  items: CartItem[];
  totalQuantity: number;
  totalAmount: string;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
  removeFromCart: (lineId: string) => Promise<void>;
  goToCheckout: () => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartId, setCartId] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState('0');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
      price: e.node.merchandise.priceV2.amount
    }));
    setItems(parsedItems);
  };

  const addToCart = async (variantId: string, quantity = 1) => {
    setIsLoading(true);
    try {
      let currentCartId = cartId;
      if (!currentCartId) {
        const cart = await cartCreate();
        currentCartId = cart.id;
        setCartId(currentCartId);
        localStorage.setItem('jb_cartId', currentCartId!);
      }
      
      const updatedCart = await cartLinesAdd(currentCartId!, variantId, quantity);
      updateCartState(updatedCart);
      setIsCartOpen(true);
      toast({
        title: "Added to bag",
        description: "Your item has been added to the bag.",
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
      removeFromCart,
      goToCheckout,
      isLoading
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
