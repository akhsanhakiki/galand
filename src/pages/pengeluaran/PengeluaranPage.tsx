"use client";

import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  Button,
  Surface,
  Spinner,
  SearchField,
  Select,
  ListBox,
  Tabs,
  Popover,
  Dropdown,
  Label,
} from "@heroui/react";
import {
  LuPlus,
  LuPencil,
  LuTrash2,
  LuDollarSign,
  LuCalendar,
  LuChevronLeft,
  LuChevronRight,
  LuDownload,
} from "react-icons/lu";
import type { Expense } from "../../utils/api";
import { getExpenses, deleteExpense } from "../../utils/api";
import ExpenseForm from "../../components/ExpenseForm";
import { ResizableCell } from "../../components/ResizableCell";
import {
  exportExpensesToCSV,
  exportExpensesToXLSX,
  exportExpensesToPDF,
} from "../../utils/export";

type TimePeriod =
  | "semua"
  | "hari-ini"
  | "kemarin"
  | "mingguan"
  | "bulanan"
  | "tahunan"
  | "3tahun"
  | "kustom";

const PengeluaranPage = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("hari-ini");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  interface ColumnConfig {
    id: string;
    minWidth: number;
    maxWidth: number;
    defaultWidth: number;
  }

  const columnConfigs: ColumnConfig[] = [
    { id: "jumlah", minWidth: 120, maxWidth: 300, defaultWidth: 150 },
    { id: "deskripsi", minWidth: 150, maxWidth: 400, defaultWidth: 250 },
    { id: "kategori", minWidth: 120, maxWidth: 250, defaultWidth: 150 },
    {
      id: "metode-pembayaran",
      minWidth: 130,
      maxWidth: 250,
      defaultWidth: 160,
    },
    { id: "tanggal", minWidth: 150, maxWidth: 350, defaultWidth: 200 },
    { id: "aksi", minWidth: 100, maxWidth: 250, defaultWidth: 120 },
  ];

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
    loadExpenses();
  }, []);

  const getDateRange = useCallback((): {
    startDate: string | undefined;
    endDate: string | undefined;
  } => {
    const now = new Date();
    let start: Date;
    let end: Date = new Date(now);

    switch (selectedPeriod) {
      case "semua":
        return { startDate: undefined, endDate: undefined };
      case "hari-ini":
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "kemarin":
        start = new Date(now);
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setHours(23, 59, 59, 999);
        break;
      case "mingguan":
        // Start of current week (Monday)
        start = new Date(now);
        const dayOfWeek = start.getDay();
        const diff = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "bulanan":
        // Start of current month
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "tahunan":
        // Start of current year
        start = new Date(now.getFullYear(), 0, 1);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "3tahun":
        // Start of 3 years ago
        start = new Date(now.getFullYear() - 3, 0, 1);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "kustom":
        if (customStartDate && customEndDate) {
          start = new Date(customStartDate);
          end = new Date(customEndDate);
        } else {
          return { startDate: undefined, endDate: undefined };
        }
        break;
      default:
        return { startDate: undefined, endDate: undefined };
    }

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  }, [selectedPeriod, customStartDate, customEndDate]);

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDateRange();
      const data = await getExpenses(
        0,
        100,
        searchQuery || undefined,
        startDate,
        endDate
      );
      setExpenses(data);
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false);
    }
  }, [getDateRange, searchQuery]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const handleCreate = () => {
    setEditingExpense(null);
    setIsFormOpen(true);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pengeluaran ini?")) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteExpense(id);
      await loadExpenses();
    } catch (error) {
      alert("Gagal menghapus pengeluaran");
    } finally {
      setDeletingId(null);
    }
  };

  const handleFormSuccess = () => {
    loadExpenses();
  };

  const filteredExpenses = useMemo(() => {
    if (!searchQuery) return expenses;
    const query = searchQuery.toLowerCase();
    return expenses.filter(
      (expense) =>
        expense.description.toLowerCase().includes(query) ||
        expense.category.toLowerCase().includes(query) ||
        expense.payment_method.toLowerCase().includes(query)
    );
  }, [expenses, searchQuery]);

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const paginatedExpenses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredExpenses.slice(startIndex, endIndex);
  }, [filteredExpenses, currentPage, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (currentPage < 1 && filteredExpenses.length > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage, filteredExpenses.length]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedPeriod, customStartDate, customEndDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatPaymentMethod = (paymentMethod: string | null | undefined) => {
    if (!paymentMethod) return "-";
    const methodMap: Record<string, string> = {
      cash: "Cash",
      qris: "Qris",
      transfer_bank: "Transfer Bank",
      kredit: "Kredit",
    };
    return methodMap[paymentMethod] || paymentMethod;
  };

  const handleExport = (format: "csv" | "xlsx" | "pdf") => {
    if (filteredExpenses.length === 0) return;

    switch (format) {
      case "csv":
        exportExpensesToCSV(filteredExpenses);
        break;
      case "xlsx":
        exportExpensesToXLSX(filteredExpenses);
        break;
      case "pdf":
        exportExpensesToPDF(filteredExpenses);
        break;
    }
  };

  const getDateRangeDisplay = useMemo(() => {
    const { startDate, endDate } = getDateRange();
    if (!startDate || !endDate) return "";

    const formatDisplayDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    };

    return `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`;
  }, [selectedPeriod, customStartDate, customEndDate]);

  const stats = useMemo(() => {
    const periodExpenses = expenses; // Already filtered by date range in loadExpenses
    const periodTotalAmount = periodExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    return {
      total: periodExpenses.length,
      totalAmount: periodTotalAmount,
      average:
        periodExpenses.length > 0
          ? Math.round(periodTotalAmount / periodExpenses.length)
          : 0,
    };
  }, [expenses]);

  return (
    <>
      <div className="flex flex-col w-full gap-5 h-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-foreground">Pengeluaran</h1>
              {selectedPeriod === "kustom" ? (
                <Popover isOpen={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                  <Popover.Trigger>
                    <span className="text-sm text-muted cursor-pointer hover:text-foreground transition-colors">
                      ({getDateRangeDisplay || "Pilih periode"})
                    </span>
                  </Popover.Trigger>
                  <Popover.Content className="w-auto">
                    <Popover.Dialog>
                      <Popover.Heading className="text-sm font-semibold mb-3">
                        Pilih Periode Kustom
                      </Popover.Heading>
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                          <label
                            htmlFor="start-datetime"
                            className="text-xs text-muted"
                          >
                            Dari Tanggal & Waktu
                          </label>
                          <input
                            id="start-datetime"
                            type="datetime-local"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            max={customEndDate || undefined}
                            className="h-8 px-3 text-xs rounded-lg border border-separator bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label
                            htmlFor="end-datetime"
                            className="text-xs text-muted"
                          >
                            Sampai Tanggal & Waktu
                          </label>
                          <input
                            id="end-datetime"
                            type="datetime-local"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            min={customStartDate || undefined}
                            className="h-8 px-3 text-xs rounded-lg border border-separator bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                          />
                        </div>
                      </div>
                    </Popover.Dialog>
                  </Popover.Content>
                </Popover>
              ) : selectedPeriod === "semua" ? (
                <span className="text-sm text-muted">(Semua data)</span>
              ) : (
                <span className="text-sm text-muted">
                  ({getDateRangeDisplay || "Pilih periode"})
                </span>
              )}
            </div>
            <p className="text-muted text-sm">
              Kelola catatan pengeluaran bisnis
            </p>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <Tabs
              selectedKey={selectedPeriod}
              onSelectionChange={(key) => {
                setSelectedPeriod(key as TimePeriod);
                if (key === "kustom") {
                  setIsPopoverOpen(true);
                } else if (key !== "semua") {
                  setCustomStartDate("");
                  setCustomEndDate("");
                  setIsPopoverOpen(false);
                } else {
                  setIsPopoverOpen(false);
                }
              }}
              className="w-fit"
            >
              <Tabs.ListContainer className="bg-surface rounded-3xl p-1">
                <Tabs.List
                  aria-label="Periode Waktu"
                  className="w-fit *:h-6 *:w-fit *:px-2 *:text-[11px] *:font-normal *:rounded-none *:bg-transparent *:data-[selected=true]:bg-transparent *:data-[selected=true]:text-foreground *:data-[hover=true]:bg-transparent"
                >
                  <Tabs.Tab id="semua">
                    Semua
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="hari-ini">
                    Hari ini
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="kemarin">
                    Kemarin
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="mingguan">
                    Minggu ini
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="bulanan">
                    Bulan ini
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="tahunan">
                    Tahun ini
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="3tahun">
                    3 Tahun ini
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="kustom">
                    Kustom
                    <Tabs.Indicator />
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>
            </Tabs>
            <Button
              variant="primary"
              className="bg-accent text-accent-foreground"
              onPress={handleCreate}
            >
              <LuPlus className="w-4 h-4 mr-2" />
              Tambah Pengeluaran
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 bg-surface rounded-3xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted mb-1">Total Pengeluaran</p>
                <p className="text-xl font-bold text-foreground">
                  {stats.total}
                </p>
              </div>
              <Surface className="p-2 rounded-lg bg-accent/10">
                <LuDollarSign className="w-4 h-4 text-accent" />
              </Surface>
            </div>
          </div>

          <div className="p-4 bg-surface rounded-3xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted mb-1">Total Jumlah</p>
                <p className="text-xl font-bold text-foreground">
                  Rp {stats.totalAmount.toLocaleString("id-ID")}
                </p>
              </div>
              <Surface className="p-2 rounded-lg bg-success/10">
                <LuDollarSign className="w-4 h-4 text-success" />
              </Surface>
            </div>
          </div>

          <div className="p-4 bg-surface rounded-3xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted mb-1">Total Transaksi</p>
                <p className="text-xl font-bold text-foreground">
                  {stats.total}
                </p>
              </div>
              <Surface className="p-2 rounded-lg bg-warning/10">
                <LuCalendar className="w-4 h-4 text-warning" />
              </Surface>
            </div>
          </div>

          <div className="p-4 bg-surface rounded-3xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted mb-1">Rata-rata</p>
                <p className="text-xl font-bold text-foreground">
                  Rp {stats.average.toLocaleString("id-ID")}
                </p>
              </div>
              <Surface className="p-2 rounded-lg bg-info/10">
                <LuDollarSign className="w-4 h-4 text-info" />
              </Surface>
            </div>
          </div>
        </div>

        <div className="p-6 bg-surface rounded-3xl flex flex-col h-full min-h-[500px]">
          <style>{`
            .table-header-separator {
              box-shadow: 0 1px 0 0 var(--separator) !important;
            }
          `}</style>
          <div className="flex flex-col md:flex-row md:items-center w-full justify-between gap-4 pb-4">
            <SearchField
              value={searchQuery}
              onChange={setSearchQuery}
              className="w-full md:w-1/4"
            >
              <SearchField.Group className="shadow-none border">
                <SearchField.SearchIcon />
                <SearchField.Input placeholder="Cari pengeluaran..." />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>

            <div className="flex flex-row items-center gap-2">
              <Dropdown>
                <Button
                  variant="ghost"
                  isDisabled={filteredExpenses.length === 0}
                  className="h-6 px-2 text-[11px]"
                >
                  <LuDownload className="w-3 h-3" />
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
            ) : filteredExpenses.length === 0 ? (
              <div className="text-center py-8 text-muted">
                {searchQuery
                  ? "Tidak ada pengeluaran yang ditemukan"
                  : "Belum ada pengeluaran"}
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                  <div
                    ref={scrollContainerRef}
                    className="overflow-y-auto overflow-x-auto flex-1"
                  >
                    <table className="w-full" style={{ tableLayout: "fixed" }}>
                      <thead className="sticky top-0 bg-surface z-10 table-header-separator">
                        <tr>
                          <ResizableCell
                            columnId="jumlah"
                            width={columnWidths["jumlah"] || 150}
                            minWidth={120}
                            maxWidth={300}
                            onResize={handleResize}
                            isHeader
                            className="text-left py-3 px-4 text-sm font-semibold text-muted border-r border-separator"
                          >
                            Jumlah
                          </ResizableCell>
                          <ResizableCell
                            columnId="deskripsi"
                            width={columnWidths["deskripsi"] || 250}
                            minWidth={150}
                            maxWidth={400}
                            onResize={handleResize}
                            isHeader
                            className="text-left py-3 px-4 text-sm font-semibold text-muted border-r border-separator"
                          >
                            Deskripsi
                          </ResizableCell>
                          <ResizableCell
                            columnId="kategori"
                            width={columnWidths["kategori"] || 150}
                            minWidth={120}
                            maxWidth={250}
                            onResize={handleResize}
                            isHeader
                            className="text-left py-3 px-4 text-sm font-semibold text-muted border-r border-separator"
                          >
                            Kategori
                          </ResizableCell>
                          <ResizableCell
                            columnId="metode-pembayaran"
                            width={columnWidths["metode-pembayaran"] || 160}
                            minWidth={130}
                            maxWidth={250}
                            onResize={handleResize}
                            isHeader
                            className="text-left py-3 px-4 text-sm font-semibold text-muted border-r border-separator"
                          >
                            Metode Pembayaran
                          </ResizableCell>
                          <ResizableCell
                            columnId="tanggal"
                            width={columnWidths["tanggal"] || 200}
                            minWidth={150}
                            maxWidth={350}
                            onResize={handleResize}
                            isHeader
                            className="text-left py-3 px-4 text-sm font-semibold text-muted border-r border-separator"
                          >
                            Tanggal
                          </ResizableCell>
                          <ResizableCell
                            columnId="aksi"
                            width={columnWidths["aksi"] || 120}
                            minWidth={100}
                            maxWidth={250}
                            onResize={handleResize}
                            isHeader
                            className="text-left py-3 px-4 text-sm font-semibold text-muted"
                          >
                            Aksi
                          </ResizableCell>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedExpenses.map((expense) => (
                          <tr
                            key={expense.id}
                            className="border-b border-separator hover:bg-surface-secondary/20 transition-colors"
                          >
                            <td
                              className="py-2 px-4 text-xs font-medium text-foreground border-r border-separator"
                              style={{
                                width: `${columnWidths["jumlah"] || 150}px`,
                                minWidth: `${columnWidths["jumlah"] || 150}px`,
                                maxWidth: `${columnWidths["jumlah"] || 150}px`,
                              }}
                            >
                              Rp {expense.amount.toLocaleString("id-ID")}
                            </td>
                            <td
                              className="py-2 px-4 text-xs text-foreground border-r border-separator"
                              style={{
                                width: `${columnWidths["deskripsi"] || 250}px`,
                                minWidth: `${
                                  columnWidths["deskripsi"] || 250
                                }px`,
                                maxWidth: `${
                                  columnWidths["deskripsi"] || 250
                                }px`,
                              }}
                            >
                              {expense.description}
                            </td>
                            <td
                              className="py-2 px-4 text-xs text-foreground border-r border-separator"
                              style={{
                                width: `${columnWidths["kategori"] || 150}px`,
                                minWidth: `${
                                  columnWidths["kategori"] || 150
                                }px`,
                                maxWidth: `${
                                  columnWidths["kategori"] || 150
                                }px`,
                              }}
                            >
                              {expense.category}
                            </td>
                            <td
                              className="py-2 px-4 text-xs text-foreground border-r border-separator"
                              style={{
                                width: `${
                                  columnWidths["metode-pembayaran"] || 160
                                }px`,
                                minWidth: `${
                                  columnWidths["metode-pembayaran"] || 160
                                }px`,
                                maxWidth: `${
                                  columnWidths["metode-pembayaran"] || 160
                                }px`,
                              }}
                            >
                              {formatPaymentMethod(expense.payment_method)}
                            </td>
                            <td
                              className="py-2 px-4 text-xs text-muted border-r border-separator"
                              style={{
                                width: `${columnWidths["tanggal"] || 200}px`,
                                minWidth: `${columnWidths["tanggal"] || 200}px`,
                                maxWidth: `${columnWidths["tanggal"] || 200}px`,
                              }}
                            >
                              {formatDate(expense.date)}
                            </td>
                            <td
                              className="py-2 px-4"
                              style={{
                                width: `${columnWidths["aksi"] || 120}px`,
                                minWidth: `${columnWidths["aksi"] || 120}px`,
                                maxWidth: `${columnWidths["aksi"] || 120}px`,
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleEdit(expense)}
                                  className="text-xs text-primary font-medium cursor-pointer hover:text-primary-700 transition-colors"
                                  title="Edit"
                                >
                                  <LuPencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(expense.id)}
                                  disabled={deletingId === expense.id}
                                  className="text-xs text-danger hover:text-danger-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Hapus"
                                >
                                  {deletingId === expense.id ? (
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
                          <ListBox.Item id="20" textValue="20">
                            20
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                          <ListBox.Item id="40" textValue="40">
                            40
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                          <ListBox.Item id="60" textValue="60">
                            60
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                          <ListBox.Item id="80" textValue="80">
                            80
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                          <ListBox.Item id="100" textValue="100">
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
                    <div className="text-center text-sm text-muted pt-2">
                      {(currentPage - 1) * itemsPerPage + 1} -{" "}
                      {Math.min(
                        currentPage * itemsPerPage,
                        filteredExpenses.length
                      )}{" "}
                      data dari {filteredExpenses.length} pengeluaran
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <ExpenseForm
        expense={editingExpense}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingExpense(null);
        }}
        onSuccess={handleFormSuccess}
      />
    </>
  );
};

export default PengeluaranPage;
