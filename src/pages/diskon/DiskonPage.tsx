"use client";

import React, { useEffect, useState } from "react";
import { Button, Chip, Surface, Spinner, SearchField } from "@heroui/react";
import {
  LuTag,
  LuPlus,
  LuPencil,
  LuTrash2,
  LuCopy,
  LuCheck,
} from "react-icons/lu";
import type { Discount } from "../../utils/api";
import { getDiscounts, deleteDiscount } from "../../utils/api";
import DiscountForm from "../../components/DiscountForm";
import { useOrganization } from "../../contexts/OrganizationContext";

const DiskonPage = () => {
  const { organizationChangeKey } = useOrganization();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    loadDiscounts();
  }, [searchQuery, organizationChangeKey]);

  const loadDiscounts = async () => {
    try {
      setLoading(true);
      const data = await getDiscounts(20, searchQuery || undefined);
      setDiscounts(data);
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingDiscount(null);
    setIsFormOpen(true);
  };

  const handleEdit = (discount: Discount) => {
    setEditingDiscount(discount);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus diskon ini?")) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteDiscount(id);
      await loadDiscounts();
    } catch (error) {
      alert("Gagal menghapus diskon");
    } finally {
      setDeletingId(null);
    }
  };

  const handleFormSuccess = () => {
    loadDiscounts();
  };

  const getTypeLabel = (type: string) => {
    return type === "individual_item" ? "Per Item" : "Semua Item";
  };

  const handleCopyCode = async (code: string, id: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (error) {
      // Error handling
    }
  };

  const stats = {
    total: discounts.length,
  };

  return (
    <>
      <div className="flex flex-col w-full gap-5 h-full">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-foreground">Diskon</h1>
          <p className="text-muted text-sm">
            Kelola kode diskon dan promo penjualan
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 bg-surface rounded-3xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted mb-1">Total Diskon</p>
                <p className="text-xl font-bold text-foreground">
                  {stats.total}
                </p>
              </div>
              <Surface className="p-2 rounded-lg bg-accent/10">
                <LuTag className="w-4 h-4 text-accent" />
              </Surface>
            </div>
          </div>

          <div className="p-4 bg-surface rounded-3xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted mb-1">Digunakan Hari Ini</p>
                <p className="text-xl font-bold text-foreground">-</p>
              </div>
              <Surface className="p-2 rounded-lg bg-success/10">
                <LuTag className="w-4 h-4 text-success" />
              </Surface>
            </div>
          </div>

          <div className="p-4 bg-surface rounded-3xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted mb-1">Total Penghematan</p>
                <p className="text-xl font-bold text-foreground">-</p>
              </div>
              <Surface className="p-2 rounded-lg bg-warning/10">
                <LuTag className="w-4 h-4 text-warning" />
              </Surface>
            </div>
          </div>

          <div className="p-4 bg-surface rounded-3xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted mb-1">Aktif</p>
                <p className="text-xl font-bold text-foreground">
                  {stats.total}
                </p>
              </div>
              <Surface className="p-2 rounded-lg bg-success/10">
                <LuTag className="w-4 h-4 text-success" />
              </Surface>
            </div>
          </div>
        </div>

        <div className="flex flex-row gap-4 flex-1 min-h-0 items-stretch">
          <div className="w-full h-full">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Spinner size="lg" />
              </div>
            ) : discounts.length === 0 ? (
              <div className="text-center py-8 text-muted">
                {searchQuery
                  ? "Tidak ada diskon yang ditemukan"
                  : "Belum ada diskon"}
              </div>
            ) : (
              <div className="flex flex-col gap-4 bg-surface rounded-2xl p-4 h-full">
                <div className="flex flex-row justify-between items-center">
                  <SearchField
                    value={searchQuery}
                    onChange={setSearchQuery}
                    className="w-1/3"
                  >
                    <SearchField.Group className="shadow-none border">
                      <SearchField.SearchIcon />
                      <SearchField.Input placeholder="Cari diskon..." />
                      <SearchField.ClearButton />
                    </SearchField.Group>
                  </SearchField>
                  <Button
                    variant="primary"
                    className="bg-accent text-accent-foreground"
                    onPress={handleCreate}
                    size="sm"
                  >
                    <LuPlus className="w-3.5 h-3.5" />
                    <span className="text-xs">Tambah Diskon</span>
                  </Button>
                </div>
                <div className="flex flex-col h-full overflow-hidden gap-1">
                  <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                    <div className="overflow-y-auto overflow-x-auto flex-1">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {discounts.map((discount) => (
                          <div
                            key={discount.id}
                            className="p-4 rounded-xl hover:shadow-sm transition-all h-auto flex flex-col items-start justify-start gap-1 border"
                          >
                            <div className="flex items-center gap-2 w-full">
                              <LuTag className="w-4 h-4 text-accent" />
                              <p className="font-semibold text-foreground text-sm flex-1 truncate">
                                {discount.name}
                              </p>
                            </div>
                            <div className="flex flex-row gap-2 w-full items-center justify-between">
                              <div className="flex flex-col py-2 flex-1 min-w-0">
                                <p className="text-xs text-muted">Kode:</p>
                                <div className="flex items-center gap-1">
                                  <p className="text-md font-medium text-muted truncate">
                                    {discount.code}
                                  </p>
                                  <Button
                                    isIconOnly
                                    size="sm"
                                    variant="ghost"
                                    className="h-5 w-5 min-w-5 p-0"
                                    onPress={() =>
                                      handleCopyCode(discount.code, discount.id)
                                    }
                                  >
                                    {copiedId === discount.id ? (
                                      <LuCheck className="w-3 h-3 text-success" />
                                    ) : (
                                      <LuCopy className="w-3 h-3 text-muted" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                              <p className="text-accent font-medium text-xl">
                                {discount.percentage}%
                              </p>
                            </div>
                            <div className="flex gap-2 w-full pt-3 border-t border-separator mt-2 justify-between">
                              <div className="flex items-center text-xs px-3 text-success bg-success/10 rounded-xl">
                                {getTypeLabel(discount.type)}
                              </div>
                              <span className="flex flex-row gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onPress={() => handleEdit(discount)}
                                  className="text-xs"
                                  isIconOnly
                                >
                                  <LuPencil className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onPress={() => handleDelete(discount.id)}
                                  isDisabled={deletingId === discount.id}
                                  className="text-xs hover:text-danger hover:bg-danger/10"
                                  isIconOnly
                                >
                                  {deletingId === discount.id ? (
                                    <Spinner size="sm" />
                                  ) : (
                                    <LuTrash2 className="w-3.5 h-3.5 " />
                                  )}
                                </Button>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <DiscountForm
        discount={editingDiscount}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingDiscount(null);
        }}
        onSuccess={handleFormSuccess}
      />
    </>
  );
};

export default DiskonPage;
