"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  Surface,
  Separator,
  Spinner,
  SearchField,
  Select,
  ListBox,
} from "@heroui/react";
import {
  LuReceipt,
  LuShoppingCart,
  LuTrash2,
  LuPlus,
  LuMinus,
  LuChevronLeft,
  LuChevronRight,
} from "react-icons/lu";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);

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

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.id.toString().toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (currentPage < 1 && filteredProducts.length > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage, filteredProducts.length]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

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
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-foreground">Kasir</h1>
        <p className="text-muted text-sm">
          Sistem point of sale untuk transaksi penjualan
        </p>
      </div>

      <div className="flex flex-row gap-4">
        <div className="w-8/12">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Spinner size="lg" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-muted">
              {searchQuery
                ? "Tidak ada produk yang ditemukan"
                : "Belum ada produk"}
            </div>
          ) : (
            <div className="flex flex-col gap-4 bg-surface rounded-2xl p-4">
              <div className="flex flex-row justify-between items-center">
                <div className="flex flex-col gap-1">
                  <h2 className="text-md font-bold text-foreground">
                    Daftar Produk
                  </h2>
                  <p className="text-xs text-muted">
                    Click untuk menambahkan produk ke keranjang
                  </p>
                </div>
                <SearchField
                  value={searchQuery}
                  onChange={setSearchQuery}
                  className="w-1/3"
                >
                  <SearchField.Group className="shadow-none border">
                    <SearchField.SearchIcon />
                    <SearchField.Input placeholder="Cari produk..." />
                    <SearchField.ClearButton />
                  </SearchField.Group>
                </SearchField>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {paginatedProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`p-4 rounded-xl hover:shadow-sm transition-all h-auto flex flex-col items-start justify-start gap-1 border ${
                      product.stock <= 0
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                    onClick={() => addToCart(product)}
                  >
                    <p className="font-semibold text-foreground text-sm">
                      {product.name}
                    </p>
                    <div className="flex flex-row gap-2 w-full items-center justify-between">
                      <p className="text-accent font-medium text-sm">
                        Rp {product.price.toLocaleString("id-ID")}
                      </p>
                      <p className="text-xs text-muted mt-1">
                        Stok:{" "}
                        <span className="text-foreground font-medium text-xs">
                          {product.stock}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex flex-row gap-2 justify-between items-center pt-4 border-t border-separator">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted">Data per halaman:</p>
                    <Select
                      className="w-16"
                      value={itemsPerPage.toString()}
                      onChange={(value) => {
                        if (value) {
                          setItemsPerPage(Number(value));
                        }
                      }}
                    >
                      <Select.Trigger className="bg-foreground/5 shadow-none">
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          <ListBox.Item id="6" textValue="6">
                            6
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                          <ListBox.Item id="12" textValue="12">
                            12
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                          <ListBox.Item id="18" textValue="18">
                            18
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                          <ListBox.Item id="24" textValue="24">
                            24
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onPress={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      isDisabled={currentPage === 1}
                      isIconOnly
                    >
                      <LuChevronLeft className="w-3 h-3" />
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <Button
                            key={page}
                            size="sm"
                            variant={
                              currentPage === page ? "primary" : "tertiary"
                            }
                            onPress={() => setCurrentPage(page)}
                            className="min-w-8 text-xs"
                          >
                            {page}
                          </Button>
                        )
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onPress={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      isDisabled={currentPage === totalPages}
                      isIconOnly
                    >
                      <LuChevronRight className="w-3 h-3" />
                    </Button>
                  </div>
                  {totalPages > 0 && (
                    <div className="text-sm text-muted">
                      {(currentPage - 1) * itemsPerPage + 1} -{" "}
                      {Math.min(
                        currentPage * itemsPerPage,
                        filteredProducts.length
                      )}{" "}
                      dari {filteredProducts.length} produk
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="w-4/12">
          <div className="p-4 sticky top-4 bg-surface rounded-2xl">
            <div className="pb-3 flex flex-col gap-1">
              <h2 className="text-md font-bold text-foreground">Keranjang</h2>
              <p className="text-xs text-muted">
                {cart.length > 0
                  ? `${cart.length} item dalam keranjang`
                  : "Keranjang kosong"}
              </p>
            </div>
            <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-center text-muted py-8 text-xs">
                  Keranjang kosong
                </p>
              ) : (
                cart.map((item) => (
                  <div key={item.product_id} className="p-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-xs truncate">
                          {item.product.name}
                        </p>
                        <p className="text-accent font-medium text-xs">
                          Rp{" "}
                          {(item.product.price * item.quantity).toLocaleString(
                            "id-ID"
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          isIconOnly
                          className="min-w-6 h-6 border"
                          onPress={() => updateQuantity(item.product_id, -1)}
                        >
                          <LuMinus className="w-3 h-3" />
                        </Button>
                        <span className="text-xs font-semibold text-foreground min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          isIconOnly
                          className="min-w-6 h-6 border"
                          onPress={() => updateQuantity(item.product_id, 1)}
                          isDisabled={item.quantity >= item.product.stock}
                        >
                          <LuPlus className="w-3 h-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        isIconOnly
                        className="min-w-6 h-6"
                        onPress={() => removeFromCart(item.product_id)}
                      >
                        <LuTrash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Separator className="my-3" />
            <div className="flex flex-col gap-3 pt-3">
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-semibold text-foreground">
                  Total:
                </span>
                <span className="text-md font-bold text-accent">
                  Rp {total.toLocaleString("id-ID")}
                </span>
              </div>
              <Button
                variant="primary"
                className="w-full bg-accent text-accent-foreground"
                size="md"
                isDisabled={cart.length === 0 || isSubmitting}
                onPress={handleCheckout}
                isPending={isSubmitting}
              >
                {isSubmitting ? "Memproses..." : "Proses Pembayaran"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KasirPage;
