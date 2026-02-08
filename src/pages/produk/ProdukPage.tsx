"use client";

import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  Card,
  Button,
  Chip,
  Surface,
  Spinner,
  SearchField,
  Select,
  ListBox,
  Dropdown,
  Label,
} from "@heroui/react";
import {
  LuPlus,
  LuPackage,
  LuCheck,
  LuTriangleAlert,
  LuCircleX,
  LuPencil,
  LuTrash2,
  LuChevronLeft,
  LuChevronRight,
  LuDownload,
} from "react-icons/lu";
import type { Product } from "../../utils/api";
import { getProducts, deleteProduct } from "../../utils/api";
import ProductForm from "../../components/ProductForm";
import {
  exportProductsToCSV,
  exportProductsToXLSX,
  exportProductsToPDF,
} from "../../utils/export";
import { ResizableCell } from "../../components/ResizableCell";
import { useOrganization } from "../../contexts/OrganizationContext";

const ProdukPage = () => {
  const { organizationChangeKey } = useOrganization();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const stickyColumnRef = useRef<HTMLDivElement>(null);

  interface ColumnConfig {
    id: string;
    minWidth: number;
    maxWidth: number;
    defaultWidth: number;
  }

  const columnConfigs: ColumnConfig[] = [
    { id: "nama-produk", minWidth: 150, maxWidth: 400, defaultWidth: 180 },
    { id: "deskripsi", minWidth: 150, maxWidth: 500, defaultWidth: 250 },
    { id: "stok", minWidth: 80, maxWidth: 200, defaultWidth: 100 },
    { id: "harga", minWidth: 100, maxWidth: 250, defaultWidth: 120 },
    { id: "hpp", minWidth: 100, maxWidth: 250, defaultWidth: 120 },
    { id: "jumlah-bundle", minWidth: 100, maxWidth: 250, defaultWidth: 120 },
    { id: "harga-bundle", minWidth: 100, maxWidth: 250, defaultWidth: 120 },
    { id: "status", minWidth: 100, maxWidth: 250, defaultWidth: 120 },
    { id: "aksi", minWidth: 100, maxWidth: 250, defaultWidth: 120 },
  ];

  // Initialize with default widths (in-memory only)
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
    () => {
      const initial: Record<string, number> = {};
      columnConfigs.forEach((col) => {
        initial[col.id] = col.defaultWidth;
      });
      return initial;
    }
  );

  const handleResize = useCallback(
    (columnId: string, width: number) => {
      const column = columnConfigs.find((col) => col.id === columnId);
      if (column) {
        const clampedWidth = Math.max(
          column.minWidth,
          Math.min(column.maxWidth, width)
        );
        setColumnWidths((prev) => ({
          ...prev,
          [columnId]: clampedWidth,
        }));
      }
    },
    [columnConfigs]
  );

  useEffect(() => {
    loadProducts();
  }, [organizationChangeKey]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      // Error handling - could show toast notification
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteProduct(id);
      await loadProducts();
    } catch (error) {
      alert("Gagal menghapus produk");
    } finally {
      setDeletingId(null);
    }
  };

  const handleFormSuccess = () => {
    loadProducts();
  };

  const handleExport = (format: "csv" | "xlsx" | "pdf") => {
    if (filteredProducts.length === 0) return;

    switch (format) {
      case "csv":
        exportProductsToCSV(filteredProducts);
        break;
      case "xlsx":
        exportProductsToXLSX(filteredProducts);
        break;
      case "pdf":
        exportProductsToPDF(filteredProducts);
        break;
    }
  };

  const getStockStatusLabel = (stock: number) => {
    if (stock === 0) return "Habis";
    if (stock < 10) return "Stok Menipis";
    return "Tersedia";
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return (
        <Chip color="danger" variant="soft" className="text-xs">
          Habis
        </Chip>
      );
    } else if (stock < 10) {
      return (
        <Chip color="warning" variant="soft" className="text-xs">
          <LuTriangleAlert className="w-3 h-3 mr-1" />
          Stok Menipis
        </Chip>
      );
    } else {
      return (
        <Chip color="success" variant="soft" className="text-xs">
          Tersedia
        </Chip>
      );
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
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

  // Handle shadow on horizontal scroll for sticky column
  useEffect(() => {
    const stickyColumn = stickyColumnRef.current;
    const scrollContainer = scrollContainerRef.current;

    if (stickyColumn && scrollContainer) {
      const updateShadow = () => {
        const scrollLeft = scrollContainer.scrollLeft;
        if (scrollLeft > 1) {
          stickyColumn.classList.add("shadow-visible");
        } else {
          stickyColumn.classList.remove("shadow-visible");
        }
      };

      scrollContainer.addEventListener("scroll", updateShadow, {
        passive: true,
      });
      updateShadow(); // Check initial state

      return () => {
        scrollContainer.removeEventListener("scroll", updateShadow);
      };
    }
  }, [paginatedProducts]);

  const stats = {
    total: products.length,
    inStock: products.filter((p) => p.stock >= 10).length,
    lowStock: products.filter((p) => p.stock > 0 && p.stock < 10).length,
    outOfStock: products.filter((p) => p.stock === 0).length,
  };

  return (
    <>
      <style>{`
        #sticky-column.shadow-visible {
          box-shadow: 4px 0 6px -2px rgba(0, 0, 0, 0.15);
        }
        .sticky-column-header::after,
        .sticky-column-cell::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 1px;
          background-color: var(--separator);
          pointer-events: none;
          z-index: 1;
        }
        #sticky-column table {
          table-layout: fixed !important;
        }
      `}</style>
      <div className="flex flex-col w-full gap-5 h-full">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-foreground">Produk</h1>
          <p className="text-muted text-sm">Kelola inventori dan stok produk</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="p-4 md:p-5 bg-surface rounded-2xl md:rounded-3xl">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-2.5 mb-2 md:mb-3">
              <p className="order-2 text-xs text-muted leading-tight md:order-1">
                Total Produk
              </p>
              <Surface className="order-1 w-fit p-2 md:order-2 md:p-1.5 rounded-lg bg-accent/10">
                <LuPackage className="w-4 h-4 md:w-3.5 md:h-3.5 text-accent" />
              </Surface>
            </div>
            <div className="flex flex-col gap-1 md:gap-1.5">
              <p className="text-lg md:text-xl font-bold text-foreground leading-tight">
                {stats.total}
              </p>
            </div>
          </div>

          <div className="p-4 md:p-5 bg-surface rounded-2xl md:rounded-3xl">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-2.5 mb-2 md:mb-3">
              <p className="order-2 text-xs text-muted leading-tight md:order-1">
                Stok Tersedia
              </p>
              <Surface className="order-1 w-fit p-2 md:order-2 md:p-1.5 rounded-lg bg-success/10">
                <LuCheck className="w-4 h-4 md:w-3.5 md:h-3.5 text-success" />
              </Surface>
            </div>
            <div className="flex flex-col gap-1 md:gap-1.5">
              <p className="text-lg md:text-xl font-bold text-foreground leading-tight">
                {stats.inStock}
              </p>
            </div>
          </div>

          <div className="p-4 md:p-5 bg-surface rounded-2xl md:rounded-3xl">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-2.5 mb-2 md:mb-3">
              <p className="order-2 text-xs text-muted leading-tight md:order-1">
                Stok Menipis
              </p>
              <Surface className="order-1 w-fit p-2 md:order-2 md:p-1.5 rounded-lg bg-warning/10">
                <LuTriangleAlert className="w-4 h-4 md:w-3.5 md:h-3.5 text-warning" />
              </Surface>
            </div>
            <div className="flex flex-col gap-1 md:gap-1.5">
              <p className="text-lg md:text-xl font-bold text-foreground leading-tight">
                {stats.lowStock}
              </p>
            </div>
          </div>

          <div className="p-4 md:p-5 bg-surface rounded-2xl md:rounded-3xl">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-2.5 mb-2 md:mb-3">
              <p className="order-2 text-xs text-muted leading-tight md:order-1">
                Habis
              </p>
              <Surface className="order-1 w-fit p-2 md:order-2 md:p-1.5 rounded-lg bg-danger/10">
                <LuCircleX className="w-4 h-4 md:w-3.5 md:h-3.5 text-danger" />
              </Surface>
            </div>
            <div className="flex flex-col gap-1 md:gap-1.5">
              <p className="text-lg md:text-xl font-bold text-foreground leading-tight">
                {stats.outOfStock}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-surface rounded-3xl flex flex-col h-full min-h-[500px]">
          <div className="flex flex-row items-center justify-between w-full gap-2 md:gap-4 pb-4">
            <SearchField
              value={searchQuery}
              onChange={setSearchQuery}
              className="flex-1 min-w-0 md:w-1/4 md:max-w-sm"
            >
              <SearchField.Group className="shadow-none border">
                <SearchField.SearchIcon />
                <SearchField.Input placeholder="Cari produk..." />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>
            <div className="flex shrink-0 items-center gap-2">
              <Dropdown>
                <Button
                  variant="ghost"
                  isDisabled={filteredProducts.length === 0}
                  size="sm"
                  className="md:min-w-0"
                  aria-label="Export"
                >
                  <LuDownload className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden md:inline">Export</span>
                </Button>
                <Dropdown.Popover>
                  <Dropdown.Menu
                    onAction={(key) =>
                      handleExport(key as "csv" | "xlsx" | "pdf")
                    }
                  >
                    <Dropdown.Item id="csv" textValue="Export to CSV">
                      <Label className="text-xs">Export to CSV</Label>
                    </Dropdown.Item>
                    <Dropdown.Item id="xlsx" textValue="Export to XLSX">
                      <Label className="text-xs">Export to XLSX</Label>
                    </Dropdown.Item>
                    <Dropdown.Item id="pdf" textValue="Export to PDF">
                      <Label className="text-xs">Export to PDF</Label>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
              <Button
                variant="primary"
                className="bg-accent text-accent-foreground"
                onPress={handleCreate}
                size="sm"
              >
                <LuPlus className="w-3.5 h-3.5" />
                <span className="text-xs hidden md:inline">Tambah Produk</span>
              </Button>
            </div>
          </div>
          <div className="flex flex-col h-full overflow-hidden gap-1">
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
              <>
                {/* Mobile: list of items */}
                <div className="md:hidden flex-1 overflow-y-auto flex flex-col gap-2 min-h-0">
                  {paginatedProducts.map((product) => (
                    <div
                      key={product.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleEdit(product)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleEdit(product);
                        }
                      }}
                      className="p-3 rounded-xl border border-separator flex flex-col gap-1 cursor-pointer touch-manipulation active:opacity-90"
                      aria-label={`Edit ${product.name}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-foreground truncate min-w-0">
                          {product.name}
                        </span>
                        <span className="text-[11px] text-muted shrink-0">
                          {getStockStatusLabel(product.stock)}
                        </span>
                      </div>
                      <p className="text-[11px] text-foreground/90 leading-tight">
                        {product.stock} stok · Rp{" "}
                        {product.price.toLocaleString("id-ID")}
                        {product.cogs != null && (
                          <> · Rp {(product.cogs ?? 0).toLocaleString("id-ID")} HPP</>
                        )}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Desktop: table */}
                <div className="hidden md:flex flex-1 overflow-hidden flex-col min-h-0">
                  {/* Scrollable Container - wraps both tables */}
                  <div
                    ref={scrollContainerRef}
                    className="flex-1 overflow-x-auto overflow-y-auto min-w-0 h-full relative w-full"
                    data-scroll-container
                  >
                    {/* Combined Table Container */}
                    <div className="flex relative">
                      {/* Sticky Column */}
                      <div
                        id="sticky-column"
                        ref={stickyColumnRef}
                        className="shrink-0 border-r border-separator bg-surface shadow-none transition-shadow duration-300 ease-in-out"
                        style={{
                          width: `${columnWidths["nama-produk"] || 180}px`,
                          position: "sticky",
                          left: 0,
                          zIndex: 50,
                        }}
                      >
                        <table
                          className="border-separate border-spacing-0"
                          style={{
                            tableLayout: "fixed",
                            width: `${columnWidths["nama-produk"] || 180}px`,
                          }}
                        >
                          <colgroup>
                            <col
                              style={{
                                width: `${
                                  columnWidths["nama-produk"] || 180
                                }px`,
                              }}
                            />
                          </colgroup>
                          <thead className="sticky top-0 bg-surface z-60">
                            <tr className="h-12 max-h-12">
                              <ResizableCell
                                columnId="nama-produk"
                                width={columnWidths["nama-produk"] || 180}
                                minWidth={150}
                                maxWidth={400}
                                onResize={handleResize}
                                isHeader
                                className="sticky-column-header text-left py-3 px-4 text-sm font-semibold text-muted bg-surface truncate overflow-hidden text-ellipsis h-12 max-h-12 z-70 border-b border-separator"
                              >
                                <div className="truncate flex items-center h-full  overflow-hidden text-ellipsis">
                                  Nama Produk
                                </div>
                              </ResizableCell>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedProducts.map((product, index) => (
                              <tr
                                key={product.id}
                                className="hover:bg-foreground/5 transition-colors group h-10 max-h-10"
                              >
                                <td
                                  className={`sticky-column-cell py-1.5 px-4 text-xs font-medium text-foreground transition-colors bg-surface group-hover:bg-foreground/5 z-10 border-b h-10 max-h-10 overflow-hidden ${
                                    index === paginatedProducts.length - 1
                                      ? "border-b-0"
                                      : ""
                                  }`}
                                  style={{
                                    width: `${
                                      columnWidths["nama-produk"] || 180
                                    }px`,
                                    minWidth: `${
                                      columnWidths["nama-produk"] || 180
                                    }px`,
                                    maxWidth: `${
                                      columnWidths["nama-produk"] || 180
                                    }px`,
                                  }}
                                >
                                  <div className="flex items-center h-full overflow-hidden">
                                    <span className="truncate">
                                      {product.name}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Scrollable Table */}
                      <div
                        className="flex-1 min-w-0 w-full"
                        data-scroll-container
                      >
                        <table
                          className="w-full border-separate border-spacing-0 min-w-max"
                          style={{
                            tableLayout: "fixed",
                          }}
                        >
                          <thead className="sticky top-0 bg-surface z-40">
                            <tr className="h-12 max-h-12">
                              <ResizableCell
                                columnId="deskripsi"
                                width={columnWidths["deskripsi"] || 250}
                                minWidth={150}
                                maxWidth={500}
                                onResize={handleResize}
                                isHeader
                                className="text-left py-3 px-4 text-sm font-semibold text-muted border-r border-b border-separator truncate whitespace-nowrap overflow-hidden text-ellipsis h-12 max-h-12 box-border align-middle"
                              >
                                <div className="truncate flex items-center h-full whitespace-nowrap overflow-hidden text-ellipsis">
                                  Deskripsi
                                </div>
                              </ResizableCell>
                              <ResizableCell
                                columnId="stok"
                                width={columnWidths["stok"] || 100}
                                minWidth={80}
                                maxWidth={200}
                                onResize={handleResize}
                                isHeader
                                className="text-left py-3 px-4 text-sm font-semibold text-muted border-r border-b border-separator truncate whitespace-nowrap overflow-hidden text-ellipsis h-12 max-h-12 box-border align-middle"
                              >
                                <div className="truncate flex items-center h-full whitespace-nowrap overflow-hidden text-ellipsis">
                                  Stok
                                </div>
                              </ResizableCell>
                              <ResizableCell
                                columnId="harga"
                                width={columnWidths["harga"] || 120}
                                minWidth={100}
                                maxWidth={250}
                                onResize={handleResize}
                                isHeader
                                className="text-left py-3 px-4 text-sm font-semibold text-muted border-r border-b border-separator truncate whitespace-nowrap overflow-hidden text-ellipsis h-12 max-h-12 box-border align-middle"
                              >
                                <div className="truncate flex items-center h-full whitespace-nowrap overflow-hidden text-ellipsis">
                                  Harga
                                </div>
                              </ResizableCell>
                              <ResizableCell
                                columnId="hpp"
                                width={columnWidths["hpp"] || 120}
                                minWidth={100}
                                maxWidth={250}
                                onResize={handleResize}
                                isHeader
                                className="text-left py-3 px-4 text-sm font-semibold text-muted border-r border-b border-separator truncate whitespace-nowrap overflow-hidden text-ellipsis h-12 max-h-12 box-border align-middle"
                              >
                                <div className="truncate flex items-center h-full whitespace-nowrap overflow-hidden text-ellipsis">
                                  HPP
                                </div>
                              </ResizableCell>
                              <ResizableCell
                                columnId="jumlah-bundle"
                                width={columnWidths["jumlah-bundle"] || 120}
                                minWidth={100}
                                maxWidth={250}
                                onResize={handleResize}
                                isHeader
                                className="text-left py-3 px-4 text-sm font-semibold text-muted border-r border-b border-separator truncate whitespace-nowrap overflow-hidden text-ellipsis h-12 max-h-12 box-border align-middle"
                              >
                                <div className="truncate flex items-center h-full whitespace-nowrap overflow-hidden text-ellipsis">
                                  Jumlah Bundle
                                </div>
                              </ResizableCell>
                              <ResizableCell
                                columnId="harga-bundle"
                                width={columnWidths["harga-bundle"] || 120}
                                minWidth={100}
                                maxWidth={250}
                                onResize={handleResize}
                                isHeader
                                className="text-left py-3 px-4 text-sm font-semibold text-muted border-r border-b border-separator truncate whitespace-nowrap overflow-hidden text-ellipsis h-12 max-h-12 box-border align-middle"
                              >
                                <div className="truncate flex items-center h-full whitespace-nowrap overflow-hidden text-ellipsis">
                                  Harga Bundle
                                </div>
                              </ResizableCell>
                              <ResizableCell
                                columnId="status"
                                width={columnWidths["status"] || 120}
                                minWidth={100}
                                maxWidth={250}
                                onResize={handleResize}
                                isHeader
                                className="text-left py-3 px-4 text-sm font-semibold text-muted border-r border-b border-separator truncate whitespace-nowrap overflow-hidden text-ellipsis h-12 max-h-12 box-border align-middle"
                              >
                                <div className="truncate flex items-center h-full whitespace-nowrap overflow-hidden text-ellipsis">
                                  Status
                                </div>
                              </ResizableCell>
                              <ResizableCell
                                columnId="aksi"
                                width={columnWidths["aksi"] || 120}
                                minWidth={100}
                                maxWidth={250}
                                onResize={handleResize}
                                isHeader
                                className="text-left py-3 px-4 text-sm font-semibold text-muted border-b border-separator truncate whitespace-nowrap overflow-hidden text-ellipsis h-12 max-h-12 box-border align-middle"
                              >
                                <div className="truncate flex items-center h-full whitespace-nowrap overflow-hidden text-ellipsis">
                                  Aksi
                                </div>
                              </ResizableCell>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedProducts.map((product, index) => (
                              <tr
                                key={product.id}
                                className={`hover:bg-foreground/5 transition-colors group h-10 max-h-10 ${
                                  index === paginatedProducts.length - 1
                                    ? "[&>td]:border-b-0"
                                    : ""
                                }`}
                              >
                                <td
                                  className="py-1.5 px-4 text-xs text-foreground border-r border-b border-separator h-10 max-h-10 box-border align-middle overflow-hidden"
                                  style={{
                                    width: `${
                                      columnWidths["deskripsi"] || 250
                                    }px`,
                                    minWidth: `${
                                      columnWidths["deskripsi"] || 250
                                    }px`,
                                    maxWidth: `${
                                      columnWidths["deskripsi"] || 250
                                    }px`,
                                  }}
                                >
                                  <div className="flex items-center h-full overflow-hidden">
                                    <span className="truncate">
                                      {product.description || "-"}
                                    </span>
                                  </div>
                                </td>
                                <td
                                  className="py-1.5 px-4 text-xs font-semibold text-foreground border-r border-b border-separator h-10 max-h-10 box-border align-middle overflow-hidden"
                                  style={{
                                    width: `${columnWidths["stok"] || 100}px`,
                                    minWidth: `${
                                      columnWidths["stok"] || 100
                                    }px`,
                                    maxWidth: `${
                                      columnWidths["stok"] || 100
                                    }px`,
                                  }}
                                >
                                  <div className="flex items-center h-full overflow-hidden">
                                    {product.stock}
                                  </div>
                                </td>
                                <td
                                  className="py-1.5 px-4 text-xs font-semibold text-foreground border-r border-b border-separator h-10 max-h-10 box-border align-middle overflow-hidden"
                                  style={{
                                    width: `${columnWidths["harga"] || 120}px`,
                                    minWidth: `${
                                      columnWidths["harga"] || 120
                                    }px`,
                                    maxWidth: `${
                                      columnWidths["harga"] || 120
                                    }px`,
                                  }}
                                >
                                  <div className="flex items-center h-full overflow-hidden">
                                    Rp {product.price.toLocaleString("id-ID")}
                                  </div>
                                </td>
                                <td
                                  className="py-1.5 px-4 text-xs font-semibold text-foreground border-r border-b border-separator h-10 max-h-10 box-border align-middle overflow-hidden"
                                  style={{
                                    width: `${columnWidths["hpp"] || 120}px`,
                                    minWidth: `${columnWidths["hpp"] || 120}px`,
                                    maxWidth: `${columnWidths["hpp"] || 120}px`,
                                  }}
                                >
                                  <div className="flex items-center h-full overflow-hidden">
                                    Rp{" "}
                                    {(product.cogs ?? 0).toLocaleString(
                                      "id-ID"
                                    )}
                                  </div>
                                </td>
                                <td
                                  className="py-1.5 px-4 text-xs font-semibold text-foreground border-r border-b border-separator h-10 max-h-10 box-border align-middle overflow-hidden"
                                  style={{
                                    width: `${
                                      columnWidths["jumlah-bundle"] || 120
                                    }px`,
                                    minWidth: `${
                                      columnWidths["jumlah-bundle"] || 120
                                    }px`,
                                    maxWidth: `${
                                      columnWidths["jumlah-bundle"] || 120
                                    }px`,
                                  }}
                                >
                                  <div className="flex items-center h-full overflow-hidden">
                                    {product.bundle_quantity ?? 0}
                                  </div>
                                </td>
                                <td
                                  className="py-1.5 px-4 text-xs font-semibold text-foreground border-r border-b border-separator h-10 max-h-10 box-border align-middle overflow-hidden"
                                  style={{
                                    width: `${
                                      columnWidths["harga-bundle"] || 120
                                    }px`,
                                    minWidth: `${
                                      columnWidths["harga-bundle"] || 120
                                    }px`,
                                    maxWidth: `${
                                      columnWidths["harga-bundle"] || 120
                                    }px`,
                                  }}
                                >
                                  <div className="flex items-center h-full overflow-hidden">
                                    Rp{" "}
                                    {(product.bundle_price ?? 0).toLocaleString(
                                      "id-ID"
                                    )}
                                  </div>
                                </td>
                                <td
                                  className="py-1.5 px-4 border-r border-b border-separator h-10 max-h-10 box-border align-middle overflow-hidden"
                                  style={{
                                    width: `${columnWidths["status"] || 120}px`,
                                    minWidth: `${
                                      columnWidths["status"] || 120
                                    }px`,
                                    maxWidth: `${
                                      columnWidths["status"] || 120
                                    }px`,
                                  }}
                                >
                                  <div className="flex items-center h-full overflow-hidden">
                                    {getStockStatus(product.stock)}
                                  </div>
                                </td>
                                <td
                                  className="py-1.5 px-4 border-b border-separator h-10 max-h-10 box-border align-middle overflow-hidden"
                                  style={{
                                    width: `${columnWidths["aksi"] || 120}px`,
                                    minWidth: `${
                                      columnWidths["aksi"] || 120
                                    }px`,
                                    maxWidth: `${
                                      columnWidths["aksi"] || 120
                                    }px`,
                                  }}
                                >
                                  <div className="flex items-center gap-3 h-full overflow-hidden">
                                    <p
                                      onClick={() => handleEdit(product)}
                                      className="text-xs text-primary font-medium cursor-pointer hover:text-primary-700 transition-colors"
                                    >
                                      Edit
                                    </p>
                                    <button
                                      onClick={() => handleDelete(product.id)}
                                      disabled={deletingId === product.id}
                                      className="text-xs text-danger hover:text-danger-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                      title="Hapus"
                                    >
                                      {deletingId === product.id ? (
                                        <Spinner size="sm" />
                                      ) : (
                                        <LuTrash2 className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-row gap-2 justify-between items-center">
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
                          <ListBox.Item id="20" textValue="20">
                            20
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                          <ListBox.Item id="20" textValue="20">
                            40
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                          <ListBox.Item id="30" textValue="30">
                            60
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                          <ListBox.Item id="40" textValue="40">
                            80
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                          <ListBox.Item id="50" textValue="50">
                            100
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </div>

                  {totalPages > 1 && (
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
                  )}
                  {totalPages > 0 && (
                    <div className="text-center text-sm text-muted">
                      {(currentPage - 1) * itemsPerPage + 1} -{" "}
                      {Math.min(
                        currentPage * itemsPerPage,
                        filteredProducts.length
                      )}{" "}
                      data dari {filteredProducts.length} produk
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <ProductForm
          product={editingProduct}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingProduct(null);
          }}
          onSuccess={handleFormSuccess}
        />
      </div>
    </>
  );
};

export default ProdukPage;
