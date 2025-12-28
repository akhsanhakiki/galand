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
  LuShoppingBasket,
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
    <div className="flex flex-col w-full gap-5 h-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-foreground">Kasir</h1>
        <p className="text-muted text-sm">
          Sistem point of sale untuk transaksi penjualan
        </p>
      </div>

      <div className="flex flex-row gap-4 flex-1 min-h-0 items-stretch">
        <div className="w-8/12 h-full">
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
            <div className="flex flex-col gap-4 bg-surface rounded-2xl p-4 h-full">
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
              <div className="flex flex-col h-full overflow-hidden gap-1">
                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                  <div className="overflow-y-auto overflow-x-auto flex-1">
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
                  </div>
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
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map((page) => (
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
                        ))}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onPress={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          )
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
            </div>
          )}
        </div>

        <div className="w-4/12 h-full">
          <div className="p-4 sticky top-4 bg-surface rounded-2xl h-full flex flex-col">
            <div className="pb-3 flex flex-col gap-1">
              <h2 className="text-md font-bold text-foreground">Keranjang</h2>
              <p className="text-xs text-muted">
                {cart.length > 0
                  ? `${cart.length} item dalam keranjang`
                  : "Tammbahkan produk ke keranjang"}
              </p>
            </div>
            <div className="flex flex-col h-full overflow-hidden gap-1">
              <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                <div className="overflow-y-auto overflow-x-auto flex-1">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-6 h-full">
                      <LuShoppingBasket className="w-24 h-24 text-accent rotate-45 opacity-50" />
                      <p className="text-center text-muted text-sm">
                        Keranjang kosong
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="sticky top-0 bg-surface z-10">
                          <tr className="border-b border-separator">
                            <th className="text-left py-2 px-2 text-xs font-semibold text-muted">
                              Nama Barang
                            </th>
                            <th className="text-left py-2 px-2 text-xs font-semibold text-muted">
                              Pembelian
                            </th>
                            <th className="text-right py-2 px-2 text-xs font-semibold text-muted">
                              Total Harga
                            </th>
                            <th className="text-center py-2 px-2 text-xs font-semibold text-muted w-12">
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {cart.map((item) => {
                            const itemTotal =
                              item.product.price * item.quantity;
                            return (
                              <tr
                                key={item.product_id}
                                className="hover:bg-surface-secondary/20 transition-colors"
                              >
                                <td className="py-2 px-2">
                                  <p className="text-xs font-medium text-foreground">
                                    {item.product.name}
                                  </p>
                                </td>
                                <td className="py-2 px-2">
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      isIconOnly
                                      className="w-5 h-5 border"
                                      onPress={() =>
                                        updateQuantity(item.product_id, -1)
                                      }
                                    >
                                      <LuMinus className="w-2.5 h-2.5" />
                                    </Button>
                                    <span className="text-xs font-medium text-foreground min-w-[20px] text-center">
                                      {item.quantity}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      isIconOnly
                                      className="w-5 h-5 border"
                                      onPress={() =>
                                        updateQuantity(item.product_id, 1)
                                      }
                                      isDisabled={
                                        item.quantity >= item.product.stock
                                      }
                                    >
                                      <LuPlus className="w-2.5 h-2.5" />
                                    </Button>
                                  </div>
                                </td>
                                <td className="py-2 px-2 text-right">
                                  <p className="text-xs font-medium text-foreground">
                                    Rp {itemTotal.toLocaleString("id-ID")}
                                  </p>
                                </td>
                                <td className="py-2 px-2 text-center w-12">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    isIconOnly
                                    className="w-5 h-5"
                                    onPress={() =>
                                      removeFromCart(item.product_id)
                                    }
                                  >
                                    <LuTrash2 className="w-3 h-3" />
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {cart.length > 0 && (
              <>
                <Separator className="my-3" />
                <div className="flex flex-col pt-3 items-end gap-6">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-semibold text-foreground">
                      Total:
                    </span>
                    <span className="text-md font-bold text-accent">
                      Rp {total.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex flex-row gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={() => setCart([])}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      className="bg-accent text-accent-foreground"
                      size="sm"
                      isDisabled={cart.length === 0 || isSubmitting}
                      onPress={handleCheckout}
                      isPending={isSubmitting}
                    >
                      {isSubmitting ? "Memproses..." : "Proses Pembayaran"}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KasirPage;
