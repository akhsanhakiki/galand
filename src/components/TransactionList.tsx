"use client";

import { Button, Card, Spinner } from "@heroui/react";
import { useEffect, useState, useMemo } from "react";
import type { Transaction } from "../utils/api";
import { getTransactions } from "../utils/api";

interface TransactionListProps {
  onView: (transaction: Transaction) => void;
}

const ITEMS_PER_PAGE = 10;

export default function TransactionList({ onView }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await getTransactions();
      setTransactions(data);
    } catch (error) {
      alert("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return transactions.slice(startIndex, endIndex);
  }, [transactions, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Transactions</h2>

      {transactions.length === 0 ? (
        <Card className="p-8 text-center">
          <Card.Content>
            <p className="text-muted">No transactions found.</p>
          </Card.Content>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {paginatedTransactions.map((transaction) => (
              <Card key={transaction.id} className="p-4">
                <Card.Header>
                  <Card.Title className="text-lg">
                    Transaction #{transaction.id}
                  </Card.Title>
                </Card.Header>
                <Card.Content>
                  <p className="text-sm text-muted">
                    {transaction.items?.length || 0} item(s)
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    Total: Rp {transaction.total_amount.toLocaleString("id-ID")}
                  </p>
                  {transaction.created_at && (
                    <p className="mt-1 text-xs text-muted">
                      {new Date(transaction.created_at).toLocaleString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        }
                      )}
                    </p>
                  )}
                </Card.Content>
                <Card.Footer>
                  <Button
                    size="sm"
                    variant="tertiary"
                    onPress={() => onView(transaction)}
                  >
                    View Details
                  </Button>
                </Card.Footer>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                size="sm"
                variant="tertiary"
                onPress={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                isDisabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      size="sm"
                      variant={currentPage === page ? "primary" : "tertiary"}
                      onPress={() => setCurrentPage(page)}
                      className="min-w-10"
                    >
                      {page}
                    </Button>
                  )
                )}
              </div>
              <Button
                size="sm"
                variant="tertiary"
                onPress={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                isDisabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}

          {totalPages > 0 && (
            <div className="text-center text-sm text-muted pt-2">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, transactions.length)} of{" "}
              {transactions.length} transactions
            </div>
          )}
        </>
      )}
    </div>
  );
}
