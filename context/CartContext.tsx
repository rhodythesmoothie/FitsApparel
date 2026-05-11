'use client';

import { createContext, useContext, useState, useEffect } from 'react';

export type CartItem = {
  slug: string;
  name: string;
  price: string;
  image: string;
  size: string;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (slug: string, size: string) => void;
  updateQuantity: (slug: string, size: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('fitsApparelCart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (err) {
        console.error('Failed to load cart', err);
      }
    }
    setHydrated(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('fitsApparelCart', JSON.stringify(items));
    }
  }, [items, hydrated]);

  const addItem = (newItem: CartItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.slug === newItem.slug && item.size === newItem.size
      );

      if (existingItem) {
        return prevItems.map((item) =>
          item.slug === newItem.slug && item.size === newItem.size
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }

      return [...prevItems, newItem];
    });
  };

  const removeItem = (slug: string, size: string) => {
    setItems((prevItems) =>
      prevItems.filter((item) => !(item.slug === slug && item.size === size))
    );
  };

  const updateQuantity = (slug: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(slug, size);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.slug === slug && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
      return total + price * item.quantity;
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
