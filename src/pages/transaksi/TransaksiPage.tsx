"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  Card,
  Button,
  Surface,
  Spinner,
  Select,
  ListBox,
  SearchField,
  Dropdown,
  Label,
  Tabs,
  Popover,
} from "@heroui/react";
import {
  LuChevronLeft,
  LuChevronRight,
  LuPrinter,
  LuDownload,
  LuCalendar,
  LuDollarSign,
  LuShoppingCart,
  LuCoins,
  LuTrendingUp,
} from "react-icons/lu";

type TimePeriod =
  | "semua"
  | "hari-ini"
  | "kemarin"
  | "mingguan"
  | "bulanan"
  | "tahunan"
  | "3tahun"
  | "kustom";
import type { Transaction } from "../../utils/api";
import { getTransactions, getTransaction } from "../../utils/api";
import TransactionForm from "../../components/TransactionForm";
import TransactionView from "../../components/TransactionView";
import { printTransaction } from "../../utils/print";
import { exportToCSV, exportToXLSX, exportToPDF } from "../../utils/export";
import { ResizableCell } from "../../components/ResizableCell";
import { useOrganization } from "../../contexts/OrganizationContext";

const TransaksiPage = () => {
  const { organizationChangeKey } = useOrganization();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("semua");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [transactionFormOpen, setTransactionFormOpen] = useState(false);
  const [viewingTransactionId, setViewingTransactionId] = useState<
    number | null
  >(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(30);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  interface ColumnConfig {
    id: string;
    minWidth: number;
    maxWidth: number;
    defaultWidth: number;
  }

  const columnConfigs: ColumnConfig[] = [
    { id: "id-transaksi", minWidth: 120, maxWidth: 300, defaultWidth: 150 },
    { id: "total-barang", minWidth: 100, maxWidth: 250, defaultWidth: 130 },
    { id: "jumlah", minWidth: 120, maxWidth: 300, defaultWidth: 150 },
    { id: "profit", minWidth: 120, maxWidth: 300, defaultWidth: 150 },
    { id: "diskon", minWidth: 120, maxWidth: 250, defaultWidth: 150 },
    {
      id: "metode-pembayaran",
      minWidth: 130,
      maxWidth: 250,
      defaultWidth: 160,
    },
    { id: "tanggal", minWidth: 150, maxWidth: 350, defaultWidth: 200 },
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

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDateRange();
      const data = await getTransactions(0, 100, startDate, endDate);
      setTransactions(data || []);
    } catch (error) {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [getDateRange]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions, refreshKey, organizationChangeKey]);

  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return transactions;
    const query = searchQuery.toLowerCase();
    return transactions.filter((t) =>
      t.id.toString().toLowerCase().includes(query)
    );
  }, [transactions, searchQuery]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTransactions.slice(startIndex, endIndex);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (currentPage < 1 && filteredTransactions.length > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage, filteredTransactions.length]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedPeriod, customStartDate, customEndDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const getDateRangeDisplay = useMemo(() => {
    try {
      const now = new Date();
      let start: Date;
      let end: Date = new Date(now);

      switch (selectedPeriod) {
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
        case "semua":
          return "";
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
            return "";
          }
          break;
        default:
          return "";
      }

      const formatDisplayDate = (date: Date) => {
        return date.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      };

      return `${formatDisplayDate(start)} - ${formatDisplayDate(end)}`;
    } catch (error) {
      return "";
    }
  }, [selectedPeriod, customStartDate, customEndDate]);

  const handleTransactionSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    setTransactionFormOpen(false);
  };

  const handleViewTransaction = (transaction: Transaction) => {
    setViewingTransactionId(transaction.id);
  };

  const handlePrintTransaction = async (transactionId: number) => {
    try {
      const transaction = await getTransaction(transactionId);
      printTransaction(transaction);
    } catch (error) {
      // Error handling - could show toast notification
    }
  };

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
    if (filteredTransactions.length === 0) return;

    switch (format) {
      case "csv":
        exportToCSV(filteredTransactions);
        break;
      case "xlsx":
        exportToXLSX(filteredTransactions);
        break;
      case "pdf":
        exportToPDF(filteredTransactions);
        break;
    }
  };

  const stats = useMemo(() => {
    const periodTransactions = transactions; // Already filtered by date range in fetchTransactions
    const periodTotalAmount = periodTransactions.reduce(
      (sum, transaction) => sum + transaction.total_amount,
      0
    );
    const periodTotalProfit = periodTransactions.reduce(
      (sum, transaction) => sum + (transaction.profit || 0),
      0
    );

    return {
      total: periodTransactions.length,
      totalAmount: periodTotalAmount,
      totalProfit: periodTotalProfit,
      average:
        periodTransactions.length > 0
          ? Math.round(periodTotalAmount / periodTransactions.length)
          : 0,
    };
  }, [transactions]);

  return (
    <>
      <style>{`
        .table-header-separator {
          box-shadow: 0 1px 0 0 var(--separator) !important;
        }
      `}</style>
      <div className="flex flex-col w-full gap-5 h-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-foreground">Transaksi</h1>
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
              Kelola semua transaksi penjualan Anda
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
            >
              <Tabs.ListContainer
                className="rounded-2xl md:rounded-3xl p-1 md:p-1 w-full overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden"
                style={{
                  scrollSnapType: "x mandatory",
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                <Tabs.List
                  aria-label="Periode Waktu"
                  className="bg-background-secondary flex *:h-6 *:md:h-6 *:flex-1 *:min-w-0 *:md:min-w-[60px] *:px-2 *:md:px-2 *:text-[11px] *:md:text-[11px] *:font-normal *:whitespace-nowrap *:rounded-none *:bg-transparent *:data-[selected=true]:bg-transparent *:data-[selected=true]:text-foreground *:data-[hover=true]:bg-transparent"
                  style={{ minWidth: "100%", width: "max-content" }}
                >
                  <Tabs.Tab id="semua" style={{ scrollSnapAlign: "start" }}>
                    Semua
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="hari-ini" style={{ scrollSnapAlign: "start" }}>
                    Hari ini
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="kemarin" style={{ scrollSnapAlign: "start" }}>
                    Kemarin
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="mingguan" style={{ scrollSnapAlign: "start" }}>
                    Minggu ini
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="bulanan" style={{ scrollSnapAlign: "start" }}>
                    Bulan ini
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="tahunan" style={{ scrollSnapAlign: "start" }}>
                    Tahun ini
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="3tahun" style={{ scrollSnapAlign: "start" }}>
                    3 Tahun ini
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="kustom" style={{ scrollSnapAlign: "end" }}>
                    Kustom
                    <Tabs.Indicator />
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>
            </Tabs>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="p-4 md:p-5 bg-surface rounded-2xl md:rounded-3xl">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-2.5 mb-2 md:mb-3">
              <p className="order-2 text-xs text-muted leading-tight md:order-1">
                Total Transaksi
              </p>
              <Surface className="order-1 w-fit p-2 md:order-2 md:p-1.5 rounded-lg bg-accent/10">
                <LuShoppingCart className="w-4 h-4 md:w-3.5 md:h-3.5 text-accent" />
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
                Total Jumlah
              </p>
              <Surface className="order-1 w-fit p-2 md:order-2 md:p-1.5 rounded-lg bg-success/10">
                <LuDollarSign className="w-4 h-4 md:w-3.5 md:h-3.5 text-success" />
              </Surface>
            </div>
            <div className="flex flex-col gap-1 md:gap-1.5">
              <p className="text-lg md:text-xl font-bold text-foreground leading-tight">
                Rp {stats.totalAmount.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          <div className="p-4 md:p-5 bg-surface rounded-2xl md:rounded-3xl">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-2.5 mb-2 md:mb-3">
              <p className="order-2 text-xs text-muted leading-tight md:order-1">
                Total Profit
              </p>
              <Surface className="order-1 w-fit p-2 md:order-2 md:p-1.5 rounded-lg bg-warning/10">
                <LuCoins className="w-4 h-4 md:w-3.5 md:h-3.5 text-warning" />
              </Surface>
            </div>
            <div className="flex flex-col gap-1 md:gap-1.5">
              <p className="text-lg md:text-xl font-bold text-foreground leading-tight">
                Rp {stats.totalProfit.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          <div className="p-4 md:p-5 bg-surface rounded-2xl md:rounded-3xl">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-2.5 mb-2 md:mb-3">
              <p className="order-2 text-xs text-muted leading-tight md:order-1">
                Rata-rata
              </p>
              <Surface className="order-1 w-fit p-2 md:order-2 md:p-1.5 rounded-lg bg-warning/10">
                <LuTrendingUp className="w-4 h-4 md:w-3.5 md:h-3.5 text-warning" />
              </Surface>
            </div>
            <div className="flex flex-col gap-1 md:gap-1.5">
              <p className="text-lg md:text-xl font-bold text-foreground leading-tight">
                Rp {stats.average.toLocaleString("id-ID")}
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
              <SearchField.Group className="shadow-none border ">
                <SearchField.SearchIcon />
                <SearchField.Input placeholder="Cari transaksi..." />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>

            <div className="flex shrink-0 items-center">
              <Dropdown>
                <Button
                  variant="ghost"
                  isDisabled={filteredTransactions.length === 0}
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
            </div>
          </div>
          <div className="flex flex-col h-full overflow-hidden gap-1">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Spinner size="lg" />
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted">
                {searchQuery
                  ? "Tidak ada transaksi yang ditemukan"
                  : "Belum ada transaksi"}
              </div>
            ) : (
              <>
                {/* Mobile: list of items */}
                <div className="md:hidden flex-1 overflow-y-auto flex flex-col gap-2 min-h-0">
                  {paginatedTransactions.map((transaction) => {
                    const totalBarang =
                      transaction.items?.reduce(
                        (sum, item) => sum + item.quantity,
                        0
                      ) || 0;
                    const profitClass =
                      transaction.profit !== null
                        ? transaction.profit > 0
                          ? "text-success"
                          : transaction.profit < 0
                            ? "text-danger"
                            : ""
                        : "";
                    return (
                      <div
                        key={transaction.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleViewTransaction(transaction)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleViewTransaction(transaction);
                          }
                        }}
                        className="p-3 rounded-xl border border-separator flex flex-col gap-1 cursor-pointer touch-manipulation active:opacity-90"
                        aria-label={`View transaction ${transaction.id}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-foreground shrink-0">
                            #{transaction.id}
                          </span>
                          <span className="text-[11px] text-muted truncate">
                            {formatDate(transaction.created_at)}
                          </span>
                        </div>
                        <p className="text-[11px] text-foreground/90 leading-tight">
                          {totalBarang} brg · Rp{" "}
                          {transaction.total_amount.toLocaleString("id-ID")}
                          {transaction.profit !== null && (
                            <>
                              {" · "}
                              <span className={profitClass}>
                                Rp{" "}
                                {transaction.profit.toLocaleString("id-ID")}
                              </span>
                            </>
                          )}
                          {" · "}
                          {formatPaymentMethod(transaction.payment_method)}
                          {transaction.discount
                            ? ` · ${transaction.discount}`
                            : ""}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop: table */}
                <div className="hidden md:flex flex-1 overflow-hidden flex-col min-h-0">
                  <div
                    ref={scrollContainerRef}
                    className="overflow-y-auto overflow-x-auto flex-1"
                  >
                    <table className="w-full" style={{ tableLayout: "fixed" }}>
                      <thead className="sticky top-0 bg-surface z-10 table-header-separator">
                        <tr>
                          <ResizableCell
                            columnId="id-transaksi"
                            width={columnWidths["id-transaksi"] || 150}
                            minWidth={120}
                            maxWidth={300}
                            onResize={handleResize}
                            isHeader
                            className="text-left py-3 px-4 text-sm font-semibold text-muted border-r border-separator"
                          >
                            ID Transaksi
                          </ResizableCell>
                          <ResizableCell
                            columnId="total-barang"
                            width={columnWidths["total-barang"] || 130}
                            minWidth={100}
                            maxWidth={250}
                            onResize={handleResize}
                            isHeader
                            className="text-left py-3 px-4 text-sm font-semibold text-muted border-r border-separator"
                          >
                            Total Barang
                          </ResizableCell>
                          <ResizableCell
                            columnId="jumlah"
                            width={columnWidths["jumlah"] || 150}
                            minWidth={120}
                            maxWidth={300}
                            onResize={handleResize}
                            isHeader
                            className="text-left py-3 px-4 text-sm font-semibold text-muted border-r border-separator"
                          >
                            Total Harga
                          </ResizableCell>
                          <ResizableCell
                            columnId="profit"
                            width={columnWidths["profit"] || 150}
                            minWidth={120}
                            maxWidth={300}
                            onResize={handleResize}
                            isHeader
                            className="text-left py-3 px-4 text-sm font-semibold text-muted border-r border-separator"
                          >
                            Profit
                          </ResizableCell>
                          <ResizableCell
                            columnId="diskon"
                            width={columnWidths["diskon"] || 150}
                            minWidth={120}
                            maxWidth={250}
                            onResize={handleResize}
                            isHeader
                            className="text-left py-3 px-4 text-sm font-semibold text-muted border-r border-separator"
                          >
                            Diskon
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
                        {paginatedTransactions.map((transaction) => (
                          <tr
                            key={transaction.id}
                            className="border-b border-separator hover:bg-surface-secondary/20 transition-colors"
                          >
                            <td
                              className="py-2 px-4 text-xs font-medium text-foreground border-r border-separator"
                              style={{
                                width: `${
                                  columnWidths["id-transaksi"] || 150
                                }px`,
                                minWidth: `${
                                  columnWidths["id-transaksi"] || 150
                                }px`,
                                maxWidth: `${
                                  columnWidths["id-transaksi"] || 150
                                }px`,
                              }}
                            >
                              {transaction.id}
                            </td>
                            <td
                              className="py-2 px-4 text-xs text-foreground border-r border-separator"
                              style={{
                                width: `${
                                  columnWidths["total-barang"] || 130
                                }px`,
                                minWidth: `${
                                  columnWidths["total-barang"] || 130
                                }px`,
                                maxWidth: `${
                                  columnWidths["total-barang"] || 130
                                }px`,
                              }}
                            >
                              {transaction.items?.reduce(
                                (sum, item) => sum + item.quantity,
                                0
                              ) || 0}
                            </td>
                            <td
                              className="py-2 px-4 text-xs font-medium text-foreground border-r border-separator"
                              style={{
                                width: `${columnWidths["jumlah"] || 150}px`,
                                minWidth: `${columnWidths["jumlah"] || 150}px`,
                                maxWidth: `${columnWidths["jumlah"] || 150}px`,
                              }}
                            >
                              Rp{" "}
                              {transaction.total_amount.toLocaleString("id-ID")}
                            </td>
                            <td
                              className={`py-2 px-4 text-xs font-medium border-r border-separator ${
                                transaction.profit !== null
                                  ? transaction.profit > 0
                                    ? "text-success"
                                    : transaction.profit < 0
                                    ? "text-danger"
                                    : "text-foreground"
                                  : "text-foreground"
                              }`}
                              style={{
                                width: `${columnWidths["profit"] || 150}px`,
                                minWidth: `${columnWidths["profit"] || 150}px`,
                                maxWidth: `${columnWidths["profit"] || 150}px`,
                              }}
                            >
                              {transaction.profit !== null ? (
                                <>
                                  Rp{" "}
                                  {transaction.profit.toLocaleString("id-ID")}
                                </>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td
                              className="py-2 px-4 text-xs text-foreground border-r border-separator"
                              style={{
                                width: `${columnWidths["diskon"] || 150}px`,
                                minWidth: `${columnWidths["diskon"] || 150}px`,
                                maxWidth: `${columnWidths["diskon"] || 150}px`,
                              }}
                            >
                              {transaction.discount || "-"}
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
                              {formatPaymentMethod(transaction.payment_method)}
                            </td>
                            <td
                              className="py-2 px-4 text-xs text-muted border-r border-separator"
                              style={{
                                width: `${columnWidths["tanggal"] || 200}px`,
                                minWidth: `${columnWidths["tanggal"] || 200}px`,
                                maxWidth: `${columnWidths["tanggal"] || 200}px`,
                              }}
                            >
                              {formatDate(transaction.created_at)}
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
                                <p
                                  onClick={() =>
                                    handleViewTransaction(transaction)
                                  }
                                  className="text-xs text-primary font-medium cursor-pointer hover:text-primary-700 transition-colors"
                                >
                                  Detail
                                </p>
                                <button
                                  onClick={() =>
                                    handlePrintTransaction(transaction.id)
                                  }
                                  className="text-xs text-primary hover:text-primary-700 transition-colors cursor-pointer"
                                  title="Print"
                                >
                                  <LuPrinter className="w-3.5 h-3.5" />
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
                    <div className="flex items-center justify-center gap-2 ">
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
                        filteredTransactions.length
                      )}{" "}
                      data dari {filteredTransactions.length} transaksi
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <TransactionForm
          isOpen={transactionFormOpen}
          onClose={() => setTransactionFormOpen(false)}
          onSuccess={handleTransactionSuccess}
        />

        <TransactionView
          isOpen={viewingTransactionId !== null}
          transactionId={viewingTransactionId}
          onClose={() => setViewingTransactionId(null)}
        />
      </div>
    </>
  );
};

export default TransaksiPage;
