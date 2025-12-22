"use client";

import { Button, Card, Spinner } from "@heroui/react";
import { useEffect, useState } from "react";
import type { Transaction } from "../utils/api";
import { getTransactions } from "../utils/api";

interface TransactionListProps {
  onView: (transaction: Transaction) => void;
}

export default function TransactionList({ onView }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

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
        <div className="space-y-3">
          {transactions.map((transaction) => (
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
                {transaction.total && (
                  <p className="mt-2 text-lg font-semibold">
                    Total: Rp {transaction.total.toLocaleString("id-ID")}
                  </p>
                )}
                {transaction.created_at && (
                  <p className="mt-1 text-xs text-muted">
                    {new Date(transaction.created_at).toLocaleString()}
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
      )}
    </div>
  );
}
