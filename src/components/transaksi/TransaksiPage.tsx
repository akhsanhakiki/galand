"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, Button, Chip, Surface, Spinner } from "@heroui/react";
import {
  FaMagnifyingGlass,
  FaFilter,
  FaCircleCheck,
} from "react-icons/fa6";
import type { Transaction } from "../../utils/api";
import { getTransactions } from "../../utils/api";
import TransactionForm from "../TransactionForm";
import TransactionView from "../TransactionView";

const TransaksiPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [transactionFormOpen, setTransactionFormOpen] = useState(false);
  const [viewingTransactionId, setViewingTransactionId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

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

  const handleTransactionSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    setTransactionFormOpen(false);
  };

  const handleViewTransaction = (transaction: Transaction) => {
    setViewingTransactionId(transaction.id);
  };

  const getStatusChip = (transaction: Transaction) => {
    // Since API doesn't have status, we'll show "Selesai" for all completed transactions
    return (
      <Chip color="success" variant="soft">
        <FaCircleCheck className="w-3 h-3 mr-1" />
        Selesai
      </Chip>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-col w-full gap-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2 ">
          <h1 className="text-3xl font-bold text-foreground">Transaksi</h1>
          <p className="text-muted">Kelola semua transaksi penjualan Anda</p>
        </div>
        <Button 
          variant="primary" 
          className="bg-accent text-accent-foreground"
          onPress={() => setTransactionFormOpen(true)}
        >
          Transaksi Baru
        </Button>
      </div>

      <Card variant="default" className="p-6">
        <Card.Header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4">
          <div className="flex flex-1 gap-2">
            <Surface
              className="flex-1 flex items-center gap-2 px-4 py-2 rounded-lg"
              variant="secondary"
            >
              <FaMagnifyingGlass className="w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted"
              />
            </Surface>
            <Button variant="tertiary" isIconOnly>
              <FaFilter className="w-4 h-4" />
            </Button>
          </div>
        </Card.Header>
        <Card.Content>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Spinner size="lg" />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted">
              {searchQuery ? "Tidak ada transaksi yang ditemukan" : "Belum ada transaksi"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-separator">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted">
                      ID Transaksi
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted">
                      Item
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted">
                      Jumlah
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted">
                      Tanggal
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-separator hover:bg-surface-secondary transition-colors"
                    >
                      <td className="py-3 px-4 text-sm font-medium text-foreground">
                        #{transaction.id}
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground">
                        {transaction.items?.length || 0} item(s)
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-foreground">
                        Rp {transaction.total_amount.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusChip(transaction)}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted">
                        {formatDate(transaction.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onPress={() => handleViewTransaction(transaction)}
                        >
                          Detail
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card.Content>
      </Card>

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
  );
};

export default TransaksiPage;
