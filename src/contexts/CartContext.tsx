"use client";

import React, { createContext, useContext, useState } from "react";
import type { Product } from "../utils/api/types";

export interface CartItem {
  product_id: number;
  product: Product;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  updateQuantity: (productId: number, delta: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      return;
    }

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.product_id === product.id
      );

      if (existingItem) {
        // Check if we can increment (not exceeding stock)
        if (existingItem.quantity >= product.stock) {
          return currentCart;
        }
        // Increment quantity
        return currentCart.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new item to cart
        return [
          ...currentCart,
          { product_id: product.id, product, quantity: 1 },
        ];
      }
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((currentCart) => {
      return currentCart
        .map((item) => {
          if (item.product_id === productId) {
            const newQuantity = item.quantity + delta;
            const product = item.product;
            if (newQuantity <= 0) return null;
            if (newQuantity > product.stock) return item;
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const setQuantity = (productId: number, quantity: number) => {
    setCart((currentCart) => {
      return currentCart
        .map((item) => {
          if (item.product_id === productId) {
            const product = item.product;
            if (quantity <= 0) return null;
            if (quantity > product.stock) return item;
            return { ...item, quantity };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.product_id !== productId)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        setQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
