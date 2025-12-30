"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Button,
  Surface,
  Separator,
  Spinner,
  SearchField,
  Select,
  ListBox,
  TextField,
  Label,
  Input,
  InputGroup,
  Accordion,
  NumberField,
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
import type { Product, Discount } from "../../utils/api";
import { getProducts, createTransaction } from "../../utils/api";
import { getDiscountByCode } from "../../utils/api/discounts";
import { useCart } from "../../contexts/CartContext";

// Helper function to calculate item total with bundle pricing
const calculateItemTotal = (product: Product, quantity: number): number => {
  // Check if bundle pricing is applicable
  if (
    product.bundle_quantity > 0 &&
    product.bundle_price > 0 &&
    quantity >= product.bundle_quantity
  ) {
    const bundles = Math.floor(quantity / product.bundle_quantity);
    const itemsInBundles = bundles * product.bundle_quantity;
    const remaining = quantity % product.bundle_quantity;
    // bundle_price is per item, so multiply by number of items in bundles
    return itemsInBundles * product.bundle_price + remaining * product.price;
  }
  // Regular pricing
  return product.price * quantity;
};

const KasirPage = () => {
  const {
    cart,
    addToCart,
    updateQuantity,
    setQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);
  const [discountCode, setDiscountCode] = useState("");
  const [validatedDiscount, setValidatedDiscount] = useState<Discount | null>(
    null
  );
  const [discountError, setDiscountError] = useState<string>("");
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);
  const [transactionDateTime, setTransactionDateTime] = useState("");
  const [cartPanelWidth, setCartPanelWidth] = useState(33.33); // Percentage (4/12 = 33.33%)
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const subtotal = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + calculateItemTotal(item.product, item.quantity),
      0
    );
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (!validatedDiscount) return 0;

    if (validatedDiscount.type === "for_all_item") {
      return (subtotal * validatedDiscount.percentage) / 100;
    } else if (validatedDiscount.type === "individual_item") {
      const applicableItems = cart.filter(
        (item) => item.product_id === validatedDiscount.product_id
      );
      const applicableSubtotal = applicableItems.reduce(
        (sum, item) => sum + calculateItemTotal(item.product, item.quantity),
        0
      );
      return (applicableSubtotal * validatedDiscount.percentage) / 100;
    }

    return 0;
  }, [validatedDiscount, cart, subtotal]);

  const total = subtotal - discountAmount;

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

  useEffect(() => {
    const validateDiscount = async () => {
      const code = discountCode.trim();

      if (!code) {
        setValidatedDiscount(null);
        setDiscountError("");
        return;
      }

      setIsValidatingDiscount(true);
      setDiscountError("");

      try {
        const discount = await getDiscountByCode(code);
        setValidatedDiscount(discount);
        setDiscountError("");
      } catch (error) {
        setValidatedDiscount(null);
        setDiscountError("Kode diskon tidak valid");
      } finally {
        setIsValidatingDiscount(false);
      }
    };

    const timeoutId = setTimeout(validateDiscount, 500);
    return () => clearTimeout(timeoutId);
  }, [discountCode]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const mouseX = e.clientX - containerRect.left;

      // Calculate cart panel width from right edge
      // mouseX is the position of the drag handle (left border of cart panel)
      const cartWidthPixels = containerWidth - mouseX;
      const newWidthPercent = (cartWidthPixels / containerWidth) * 100;

      // Constrain between 20% and 60%
      const constrainedWidth = Math.max(20, Math.min(60, newWidthPercent));
      setCartPanelWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      setIsSubmitting(true);
      const transactionData: {
        items: Array<{ product_id: number; quantity: number }>;
        created_at?: string;
        discount_code?: string;
      } = {
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      };

      // Only include discount_code if provided
      if (discountCode.trim()) {
        transactionData.discount_code = discountCode.trim();
      }

      // Only include created_at if a datetime is provided
      if (transactionDateTime) {
        // Convert datetime-local format (YYYY-MM-DDTHH:mm) to ISO string
        const date = new Date(transactionDateTime);
        transactionData.created_at = date.toISOString();
      }

      await createTransaction(transactionData);
      clearCart();
      setDiscountCode("");
      setValidatedDiscount(null);
      setDiscountError("");
      setTransactionDateTime("");
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

      <div
        ref={containerRef}
        className="flex flex-row gap-4 flex-1 min-h-0 items-stretch"
      >
        <div className="h-full" style={{ width: `${100 - cartPanelWidth}%` }}>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Spinner size="lg" />
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
                      {paginatedProducts.length === 0 ? (
                        <div className="col-span-full flex items-center justify-center py-12">
                          <p className="text-center text-muted text-sm">
                            {searchQuery
                              ? "Tidak ada produk yang ditemukan"
                              : "Belum ada produk"}
                          </p>
                        </div>
                      ) : (
                        paginatedProducts.map((product) => (
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
                        ))
                      )}
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

        <div
          className="h-full relative"
          style={{ width: `${cartPanelWidth}%` }}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize bg-transparent z-30 transition-colors group"
            onMouseDown={handleResizeStart}
            style={{ marginLeft: "-2px" }}
            title="Drag to resize"
          >
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-accent/0 group-hover:bg-accent/30 rounded-full transition-colors" />
          </div>
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
                            const itemTotal = calculateItemTotal(
                              item.product,
                              item.quantity
                            );
                            const hasBundle =
                              item.product.bundle_quantity > 0 &&
                              item.product.bundle_price > 0 &&
                              item.quantity >= item.product.bundle_quantity;
                            const bundles = hasBundle
                              ? Math.floor(
                                  item.quantity / item.product.bundle_quantity
                                )
                              : 0;
                            const remaining = hasBundle
                              ? item.quantity % item.product.bundle_quantity
                              : 0;
                            return (
                              <tr
                                key={item.product_id}
                                className="hover:bg-surface-secondary/20 transition-colors"
                              >
                                <td className="py-2 px-2">
                                  <p className="text-xs font-medium text-foreground">
                                    {item.product.name}
                                  </p>
                                  {hasBundle && (
                                    <p className="text-xs text-success mt-0.5">
                                      Bundle: {bundles}x (
                                      {item.product.bundle_quantity} pcs){" "}
                                      {remaining > 0 && `+ ${remaining} pcs`}
                                    </p>
                                  )}
                                </td>
                                <td className="py-2 px-2">
                                  <NumberField
                                    value={item.quantity}
                                    onChange={(value) => {
                                      if (value !== undefined) {
                                        setQuantity(item.product_id, value);
                                      }
                                    }}
                                    minValue={1}
                                    maxValue={item.product.stock}
                                  >
                                    <NumberField.Group className="shadow-none border h-6 text-xs rounded-lg">
                                      <NumberField.DecrementButton className="w-5 h-5 min-w-5 p-1" />
                                      <NumberField.Input className="w-[40px] text-xs text-center px-0.5 py-0 h-full" />
                                      <NumberField.IncrementButton className="w-5 h-5 min-w-5 p-1" />
                                    </NumberField.Group>
                                  </NumberField>
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
                <div className="flex flex-col pt-3 gap-2">
                  <Accordion className="w-full rounded-2xl overflow-hidden">
                    <Accordion.Item>
                      <Accordion.Heading>
                        <Accordion.Trigger>
                          <span className="text-xs font-medium text-foreground">
                            Diskon & Opsi Tambahan
                          </span>
                          <Accordion.Indicator />
                        </Accordion.Trigger>
                      </Accordion.Heading>
                      <Accordion.Panel>
                        <Accordion.Body>
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-col gap-1">
                              <div className="relative">
                                <TextField
                                  value={discountCode}
                                  onChange={setDiscountCode}
                                  className="w-full"
                                >
                                  <Label className="text-xs">Kode Diskon</Label>
                                  <InputGroup className="shadow-none border">
                                    <InputGroup.Input
                                      placeholder="Kode diskon"
                                      className="text-xs"
                                      disabled={isValidatingDiscount}
                                    />
                                  </InputGroup>
                                </TextField>
                                {isValidatingDiscount && (
                                  <div className="absolute right-3 top-8 flex items-center">
                                    <Spinner size="sm" />
                                  </div>
                                )}
                              </div>
                              {discountError && (
                                <div className="text-xs text-danger">
                                  {discountError}
                                </div>
                              )}
                              {validatedDiscount && !discountError && (
                                <div className="text-xs text-success">
                                  Diskon {validatedDiscount.percentage}%
                                  diterapkan
                                  {validatedDiscount.type ===
                                    "individual_item" && " untuk item tertentu"}
                                </div>
                              )}
                            </div>
                            <TextField className="w-full">
                              <Label className="text-xs">Waktu Transaksi</Label>
                              <InputGroup className="shadow-none border">
                                <input
                                  type="datetime-local"
                                  value={transactionDateTime}
                                  onChange={(e) =>
                                    setTransactionDateTime(e.target.value)
                                  }
                                  className="w-full bg-transparent border-0 outline-none px-3 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                />
                              </InputGroup>
                            </TextField>
                          </div>
                        </Accordion.Body>
                      </Accordion.Panel>
                    </Accordion.Item>
                  </Accordion>
                  <Separator className="my-3" />
                  <div className="flex flex-col gap-2 py-4">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-semibold text-foreground">
                        Subtotal:
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        Rp {subtotal.toLocaleString("id-ID")}
                      </span>
                    </div>
                    {validatedDiscount && discountAmount > 0 && (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm text-muted">
                          Diskon ({validatedDiscount.percentage}%):
                        </span>
                        <span className="text-sm font-medium text-success">
                          -Rp {discountAmount.toLocaleString("id-ID")}
                        </span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-semibold text-foreground">
                        Total:
                      </span>
                      <span className="text-md font-bold text-accent">
                        Rp {total.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-row gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={() => {
                        clearCart();
                        setDiscountCode("");
                        setValidatedDiscount(null);
                        setDiscountError("");
                        setTransactionDateTime("");
                      }}
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
