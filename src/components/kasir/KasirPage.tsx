import React, { useState } from "react";
import { Card, Button, Surface, Separator } from "@heroui/react";
import {
  FaCashRegister,
  FaCartShopping,
  FaTrash,
  FaPlus,
  FaMinus,
} from "react-icons/fa6";

const KasirPage = () => {
  const [cart, setCart] = useState([
    { id: 1, name: "Produk A", price: 50000, quantity: 2 },
    { id: 2, name: "Produk B", price: 75000, quantity: 1 },
  ]);

  const products = [
    { id: 1, name: "Produk A", price: 50000 },
    { id: 2, name: "Produk B", price: 75000 },
    { id: 3, name: "Produk C", price: 120000 },
    { id: 4, name: "Produk D", price: 30000 },
    { id: 5, name: "Produk E", price: 25000 },
  ];

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addToCart = (product: (typeof products)[0]) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.id === id) {
            const newQuantity = item.quantity + delta;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  return (
    <div className="flex flex-col w-full gap-6 p-4 md:p-6">
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((product) => (
                  <Button
                    key={product.id}
                    variant="ghost"
                    className="p-4 rounded-xl hover:shadow-md transition-all h-auto flex-col items-start justify-start"
                    onPress={() => addToCart(product)}
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
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
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
                    key={item.id}
                    className="p-3 rounded-lg"
                    variant="secondary"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">
                          {item.name}
                        </p>
                        <p className="text-accent font-semibold text-sm">
                          Rp{" "}
                          {(item.price * item.quantity).toLocaleString("id-ID")}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        isIconOnly
                        onPress={() => removeFromCart(item.id)}
                      >
                        <FaTrash className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="tertiary"
                        size="sm"
                        isIconOnly
                        onPress={() => updateQuantity(item.id, -1)}
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
                        onPress={() => updateQuantity(item.id, 1)}
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
                isDisabled={cart.length === 0}
              >
                Proses Pembayaran
              </Button>
            </Card.Footer>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default KasirPage;
