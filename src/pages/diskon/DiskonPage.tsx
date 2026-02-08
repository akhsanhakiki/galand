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
      <div className="flex flex-col w-full gap-3 md:gap-5 h-full">
        <div className="flex flex-col gap-0.5 md:gap-1">
          <h1 className="text-lg md:text-xl font-bold text-foreground">Diskon</h1>
          <p className="text-muted text-xs md:text-sm hidden md:block">
            Kelola kode diskon dan promo penjualan
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          <div className="p-2.5 md:p-5 bg-surface rounded-xl md:rounded-3xl">
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between md:gap-2.5 mb-1 md:mb-3">
              <p className="order-2 text-[10px] md:text-xs text-muted leading-tight md:order-1">
                Total Diskon
              </p>
              <Surface className="order-1 w-fit p-1.5 md:order-2 md:p-1.5 rounded-lg bg-accent/10">
                <LuTag className="w-3 h-3 md:w-3.5 md:h-3.5 text-accent" />
              </Surface>
            </div>
            <p className="text-base md:text-xl font-bold text-foreground leading-tight">
              {stats.total}
            </p>
          </div>

          <div className="p-2.5 md:p-5 bg-surface rounded-xl md:rounded-3xl">
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between md:gap-2.5 mb-1 md:mb-3">
              <p className="order-2 text-[10px] md:text-xs text-muted leading-tight md:order-1">
                Digunakan Hari Ini
              </p>
              <Surface className="order-1 w-fit p-1.5 md:order-2 md:p-1.5 rounded-lg bg-success/10">
                <LuTag className="w-3 h-3 md:w-3.5 md:h-3.5 text-success" />
              </Surface>
            </div>
            <p className="text-base md:text-xl font-bold text-foreground leading-tight">
              -
            </p>
          </div>

          <div className="p-2.5 md:p-5 bg-surface rounded-xl md:rounded-3xl">
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between md:gap-2.5 mb-1 md:mb-3">
              <p className="order-2 text-[10px] md:text-xs text-muted leading-tight md:order-1">
                Total Penghematan
              </p>
              <Surface className="order-1 w-fit p-1.5 md:order-2 md:p-1.5 rounded-lg bg-warning/10">
                <LuTag className="w-3 h-3 md:w-3.5 md:h-3.5 text-warning" />
              </Surface>
            </div>
            <p className="text-base md:text-xl font-bold text-foreground leading-tight">
              -
            </p>
          </div>

          <div className="p-2.5 md:p-5 bg-surface rounded-xl md:rounded-3xl">
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between md:gap-2.5 mb-1 md:mb-3">
              <p className="order-2 text-[10px] md:text-xs text-muted leading-tight md:order-1">
                Aktif
              </p>
              <Surface className="order-1 w-fit p-1.5 md:order-2 md:p-1.5 rounded-lg bg-success/10">
                <LuTag className="w-3 h-3 md:w-3.5 md:h-3.5 text-success" />
              </Surface>
            </div>
            <p className="text-base md:text-xl font-bold text-foreground leading-tight">
              {stats.total}
            </p>
          </div>
        </div>

        <div className="flex flex-row gap-3 md:gap-4 flex-1 min-h-0 items-stretch">
          <div className="w-full h-full">
            <div className="flex flex-col gap-3 md:gap-4 bg-surface rounded-2xl md:rounded-3xl p-3 md:p-4 h-full min-h-0 md:min-h-[500px]">
              <div className="flex flex-row justify-between items-center gap-2">
                <SearchField
                  value={searchQuery}
                  onChange={setSearchQuery}
                  className="w-full md:w-1/3 min-w-0"
                >
                  <SearchField.Group className="shadow-none border">
                    <SearchField.SearchIcon />
                    <SearchField.Input placeholder="Cari diskon..." />
                    <SearchField.ClearButton />
                  </SearchField.Group>
                </SearchField>
                <Button
                  variant="primary"
                  className="bg-accent text-accent-foreground shrink-0 w-9 h-9 min-w-9 min-h-9 rounded-full p-0 md:w-auto md:h-auto md:min-w-0 md:min-h-0 md:rounded-lg md:px-3 md:py-2"
                  onPress={handleCreate}
                  size="sm"
                >
                  <LuPlus className="w-3.5 h-3.5" />
                  <span className="text-xs hidden md:inline">Tambah Diskon</span>
                </Button>
              </div>
              <div className="flex flex-col h-full overflow-hidden gap-1">
                {loading ? (
                  <div className="flex items-center justify-center p-6 md:p-8">
                    <Spinner size="lg" />
                  </div>
                ) : discounts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-6 md:py-8 gap-2 md:gap-3">
                    <LuTag className="w-10 h-10 md:w-12 md:h-12 text-muted opacity-50" />
                    <p className="text-muted text-xs md:text-sm">
                      {searchQuery
                        ? "Tidak ada diskon yang ditemukan"
                        : "Belum ada diskon"}
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                    <div className="overflow-y-auto overflow-x-auto flex-1">
                      <div className="flex flex-col gap-1.5 md:grid md:grid-cols-3 md:gap-2">
                        {discounts.map((discount) => (
                          <div
                            key={discount.id}
                            className="p-3 md:p-4 rounded-xl md:rounded-2xl hover:shadow-sm transition-all h-auto flex flex-col items-start justify-start gap-0 md:gap-1 border"
                          >
                            <div className="flex items-center gap-1.5 md:gap-2 w-full min-w-0">
                              <LuTag className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent shrink-0" />
                              <p className="font-semibold text-foreground text-xs md:text-sm flex-1 truncate">
                                {discount.name}
                              </p>
                              <p className="text-accent font-semibold text-sm md:text-xl shrink-0">
                                {discount.percentage}%
                              </p>
                            </div>
                            <div className="flex flex-row gap-1.5 w-full items-center min-w-0">
                              <p className="text-[10px] md:text-xs text-muted shrink-0">Kode:</p>
                              <p className="text-xs md:text-base font-medium text-muted truncate flex-1 min-w-0">
                                {discount.code}
                              </p>
                              <Button
                                isIconOnly
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 min-w-6 p-0 shrink-0 md:h-5 md:w-5 md:min-w-5"
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
                            <div className="flex gap-1.5 w-full pt-2 md:pt-3 border-t border-separator mt-1.5 md:mt-2 justify-between items-center">
                              <div className="flex items-center text-[10px] md:text-xs px-2 md:px-3 py-0.5 md:py-1 text-success bg-success/10 rounded-lg md:rounded-xl">
                                {getTypeLabel(discount.type)}
                              </div>
                              <span className="flex flex-row gap-0.5 md:gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onPress={() => handleEdit(discount)}
                                  className="text-xs min-w-0 p-1 md:p-2"
                                  isIconOnly
                                >
                                  <LuPencil className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onPress={() => handleDelete(discount.id)}
                                  isDisabled={deletingId === discount.id}
                                  className="text-xs hover:text-danger hover:bg-danger/10 min-w-0 p-1 md:p-2"
                                  isIconOnly
                                >
                                  {deletingId === discount.id ? (
                                    <Spinner size="sm" />
                                  ) : (
                                    <LuTrash2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                  )}
                                </Button>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
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
