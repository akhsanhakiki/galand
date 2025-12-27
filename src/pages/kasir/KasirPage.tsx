"use client";

import React, { useState, useEffect } from "react";
import { Card, Button, Surface, Separator, Spinner } from "@heroui/react";
import {
  FaCashRegister,
  FaCartShopping,
  FaTrash,
  FaPlus,
  FaMinus,
} from "react-icons/fa6";
import type { Product } from "../../utils/api";
import { getProducts, createTransaction } from "../../utils/api";

interface CartItem {
  product_id: number;
  product: Product;
  quantity: number;
}

const KasirPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      return;
    }

    const existingItem = cart.find((item) => item.product_id === product.id);
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        return;
      }
      setCart(
        cart.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { product_id: product.id, product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(
      cart
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
        .filter((item): item is CartItem => item !== null)
    );
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.product_id !== productId));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      setIsSubmitting(true);
      await createTransaction({
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      });
      setCart([]);
    } catch (error) {
      // Error handling
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Kasir</h1>
        <p className="text-muted">
          Sistem point of sale untuk transaksi penjualan
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card variant="default" className="p-6">
            <Card.Header className="pb-4">
              <Card.Title className="text-xl font-bold">
                Daftar Produk
              </Card.Title>
            </Card.Header>
            <Card.Content>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Spinner size="lg" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8 text-muted">
                  Belum ada produk
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <Button
                      key={product.id}
                      variant="ghost"
                      className="p-4 rounded-xl hover:shadow-md transition-all h-auto flex-col items-start justify-start"
                      onPress={() => addToCart(product)}
                      isDisabled={product.stock <= 0}
                    >
                      <div className="flex flex-col gap-2 w-full">
                        <div className="w-full h-24 bg-surface-tertiary rounded-lg flex items-center justify-center">
                          <FaCartShopping className="w-8 h-8 text-muted" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">
                            {product.name}
                          </p>
                          <p className="text-accent font-bold">
                            Rp {product.price.toLocaleString("id-ID")}
                          </p>
                          <p className="text-xs text-muted mt-1">
                            Stok: {product.stock}
                          </p>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </Card.Content>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card variant="default" className="p-6 sticky top-4">
            <Card.Header className="pb-4 flex items-center gap-2">
              <FaCashRegister className="w-5 h-5 text-accent" />
              <Card.Title className="text-xl font-bold">Keranjang</Card.Title>
            </Card.Header>
            <Card.Content className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-center text-muted py-8">Keranjang kosong</p>
              ) : (
                cart.map((item) => (
                  <Surface
                    key={item.product_id}
                    className="p-3 rounded-lg"
                    variant="secondary"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">
                          {item.product.name}
                        </p>
                        <p className="text-accent font-semibold text-sm">
                          Rp{" "}
                          {(item.product.price * item.quantity).toLocaleString(
                            "id-ID"
                          )}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        isIconOnly
                        onPress={() => removeFromCart(item.product_id)}
                      >
                        <FaTrash className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="tertiary"
                        size="sm"
                        isIconOnly
                        onPress={() => updateQuantity(item.product_id, -1)}
                      >
                        <FaMinus className="w-3 h-3" />
                      </Button>
                      <span className="flex-1 text-center font-semibold text-foreground">
                        {item.quantity}
                      </span>
                      <Button
                        variant="tertiary"
                        size="sm"
                        isIconOnly
                        onPress={() => updateQuantity(item.product_id, 1)}
                        isDisabled={item.quantity >= item.product.stock}
                      >
                        <FaPlus className="w-3 h-3" />
                      </Button>
                    </div>
                  </Surface>
                ))
              )}
            </Card.Content>
            <Separator />
            <Card.Footer className="flex flex-col gap-4 pt-4">
              <div className="flex items-center justify-between w-full">
                <span className="text-lg font-semibold text-foreground">
                  Total:
                </span>
                <span className="text-2xl font-bold text-accent">
                  Rp {total.toLocaleString("id-ID")}
                </span>
              </div>
              <Button
                variant="primary"
                className="w-full bg-accent text-accent-foreground"
                size="lg"
                isDisabled={cart.length === 0 || isSubmitting}
                onPress={handleCheckout}
                isPending={isSubmitting}
              >
                {isSubmitting ? "Memproses..." : "Proses Pembayaran"}
              </Button>
            </Card.Footer>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default KasirPage;
