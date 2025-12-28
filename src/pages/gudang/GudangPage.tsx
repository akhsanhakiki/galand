"use client";

import React, { useEffect, useState, useMemo } from "react";
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
  LuBox,
  LuTriangleAlert,
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

const GudangPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  useEffect(() => {
    loadProducts();
  }, []);

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

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return (
        <Chip color="danger" variant="soft">
          Habis
        </Chip>
      );
    } else if (stock < 10) {
      return (
        <Chip color="warning" variant="soft">
          <LuTriangleAlert className="w-3 h-3 mr-1" />
          Stok Menipis
        </Chip>
      );
    } else {
      return (
        <Chip color="success" variant="soft">
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

  const stats = {
    total: products.length,
    inStock: products.filter((p) => p.stock >= 10).length,
    lowStock: products.filter((p) => p.stock > 0 && p.stock < 10).length,
    outOfStock: products.filter((p) => p.stock === 0).length,
  };

  return (
    <div className="flex flex-col w-full gap-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-foreground">Gudang</h1>
          <p className="text-muted text-sm">Kelola inventori dan stok produk</p>
        </div>
        <Button
          variant="primary"
          className="bg-accent text-accent-foreground"
          onPress={handleCreate}
        >
          <LuPlus className="w-4 h-4 mr-2" />
          Tambah Produk
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card variant="default" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted mb-1">Total Produk</p>
              <p className="text-xl font-bold text-foreground">{stats.total}</p>
            </div>
            <Surface className="p-2 rounded-lg bg-accent/10">
              <LuBox className="w-4 h-4 text-accent" />
            </Surface>
          </div>
        </Card>

        <Card variant="default" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted mb-1">Stok Tersedia</p>
              <p className="text-xl font-bold text-foreground">
                {stats.inStock}
              </p>
            </div>
            <Surface className="p-2 rounded-lg bg-success/10">
              <LuBox className="w-4 h-4 text-success" />
            </Surface>
          </div>
        </Card>

        <Card variant="default" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted mb-1">Stok Menipis</p>
              <p className="text-xl font-bold text-foreground">
                {stats.lowStock}
              </p>
            </div>
            <Surface className="p-2 rounded-lg bg-warning/10">
              <LuTriangleAlert className="w-4 h-4 text-warning" />
            </Surface>
          </div>
        </Card>

        <Card variant="default" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted mb-1">Habis</p>
              <p className="text-xl font-bold text-foreground">
                {stats.outOfStock}
              </p>
            </div>
            <Surface className="p-2 rounded-lg bg-danger/10">
              <LuTriangleAlert className="w-4 h-4 text-danger" />
            </Surface>
          </div>
        </Card>
      </div>

      <div className="p-6 bg-surface rounded-3xl flex flex-col h-full min-h-[500px]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4">
          <SearchField
            value={searchQuery}
            onChange={setSearchQuery}
            className="w-1/4"
          >
            <SearchField.Group className="shadow-none border">
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Cari produk..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <div className="flex items-center gap-2">
            <Dropdown>
              <Button
                variant="ghost"
                isDisabled={filteredProducts.length === 0}
              >
                <LuDownload className="w-4 h-4" />
                Export
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
              <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                <div className="overflow-y-auto overflow-x-auto flex-1">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-surface z-10">
                      <tr className="border-b border-separator">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted">
                          Nama Produk
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted">
                          Deskripsi
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted">
                          Stok
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted">
                          Harga
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedProducts.map((product) => (
                        <tr
                          key={product.id}
                          className="border-b border-separator hover:bg-surface-secondary/20 transition-colors"
                        >
                          <td className="py-2 px-4 text-xs font-medium text-foreground">
                            {product.name}
                          </td>
                          <td className="py-2 px-4 text-xs text-foreground">
                            {product.description || "-"}
                          </td>
                          <td className="py-2 px-4 text-xs font-semibold text-foreground">
                            {product.stock}
                          </td>
                          <td className="py-2 px-4 text-xs font-semibold text-foreground">
                            Rp {product.price.toLocaleString("id-ID")}
                          </td>
                          <td className="py-2 px-4">
                            {getStockStatus(product.stock)}
                          </td>
                          <td className="py-2 px-4">
                            <div className="flex items-center gap-3">
                              <p
                                onClick={() => handleEdit(product)}
                                className="text-xs text-primary font-medium cursor-pointer hover:text-primary-700 transition-colors"
                              >
                                Edit
                              </p>
                              <button
                                onClick={() => handleDelete(product.id)}
                                disabled={deletingId === product.id}
                                className="text-xs text-primary hover:text-primary-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <ListBox.Item id="10" textValue="10">
                          10
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                        <ListBox.Item id="20" textValue="20">
                          20
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                        <ListBox.Item id="30" textValue="30">
                          30
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                        <ListBox.Item id="40" textValue="40">
                          40
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
  );
};

export default GudangPage;
