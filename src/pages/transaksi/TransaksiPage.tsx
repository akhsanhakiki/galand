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
} from "@heroui/react";
import {
  LuFilter,
  LuChevronLeft,
  LuChevronRight,
  LuPrinter,
  LuDownload,
} from "react-icons/lu";
import type { Transaction } from "../../utils/api";
import { getTransactions, getTransaction } from "../../utils/api";
import TransactionForm from "../../components/TransactionForm";
import TransactionView from "../../components/TransactionView";
import { printTransaction } from "../../utils/print";
import { exportToCSV, exportToXLSX, exportToPDF } from "../../utils/export";
import { ResizableCell } from "../../components/ResizableCell";

const TransaksiPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
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
    { id: "tanggal", minWidth: 150, maxWidth: 350, defaultWidth: 200 },
    { id: "aksi", minWidth: 100, maxWidth: 250, defaultWidth: 120 },
  ];

  // Initialize with default widths (SSR-safe)
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
    () => {
      const initial: Record<string, number> = {};
      columnConfigs.forEach((col) => {
        initial[col.id] = col.defaultWidth;
      });
      return initial;
    }
  );

  // Load from localStorage on client side only
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loaded: Record<string, number> = {};
      columnConfigs.forEach((col) => {
        const saved = localStorage.getItem(`transaksi-column-width-${col.id}`);
        if (saved) {
          const width = parseInt(saved, 10);
          if (width >= col.minWidth && width <= col.maxWidth) {
            loaded[col.id] = width;
          } else {
            loaded[col.id] = col.defaultWidth;
          }
        } else {
          loaded[col.id] = col.defaultWidth;
        }
      });
      setColumnWidths(loaded);
    }
  }, []);

  const handleResize = useCallback(
    (columnId: string, width: number) => {
      const column = columnConfigs.find((col) => col.id === columnId);
      if (column) {
        const clampedWidth = Math.max(
          column.minWidth,
          Math.min(column.maxWidth, width)
        );
        setColumnWidths((prev) => {
          const updated = { ...prev, [columnId]: clampedWidth };
          if (typeof window !== "undefined") {
            localStorage.setItem(
              `transaksi-column-width-${columnId}`,
              clampedWidth.toString()
            );
          }
          return updated;
        });
      }
    },
    [columnConfigs]
  );

  useEffect(() => {
    fetchTransactions();
  }, [refreshKey]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await getTransactions();
      setTransactions(data);
    } catch (error) {
      // Error handling - could show toast notification
    } finally {
      setLoading(false);
    }
  };

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
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

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

  return (
    <>
      <style>{`
        .table-header-separator {
          box-shadow: 0 1px 0 0 var(--separator) !important;
        }
      `}</style>
      <div className="flex flex-col w-full gap-5 h-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-foreground">Transaksi</h1>
            <p className="text-muted text-sm">
              Kelola semua transaksi penjualan Anda
            </p>
          </div>
        </div>

        <div className="p-6 bg-surface rounded-3xl flex flex-col h-full min-h-[500px]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4">
            <SearchField
              value={searchQuery}
              onChange={setSearchQuery}
              className="w-1/4"
            >
              <SearchField.Group className="shadow-none border ">
                <SearchField.SearchIcon />
                <SearchField.Input placeholder="Cari transaksi..." />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>
            <div className="flex items-center gap-2">
              <Dropdown>
                <Button
                  variant="ghost"
                  isDisabled={filteredTransactions.length === 0}
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
              <Button variant="ghost" isIconOnly>
                <LuFilter className="w-4 h-4" />
              </Button>
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
                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
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
                            Jumlah
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
                              {transaction.items?.length || 0}
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
