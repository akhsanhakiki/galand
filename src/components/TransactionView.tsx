"use client";

import { Button, Card, Modal } from "@heroui/react";
import { useEffect, useState } from "react";
import type { Transaction } from "../utils/api";
import { getTransaction } from "../utils/api";

interface TransactionViewProps {
  transactionId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionView({
  transactionId,
  isOpen,
  onClose,
}: TransactionViewProps) {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && transactionId) {
      fetchTransaction();
    }
  }, [isOpen, transactionId]);

  const fetchTransaction = async () => {
    if (!transactionId) return;

    try {
      setLoading(true);
      const data = await getTransaction(transactionId);
      setTransaction(data);
    } catch (error) {
      alert("Failed to load transaction details");
    } finally {
      setLoading(false);
    }
  };

  if (!transaction) {
    return null;
  }

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={onClose}
      variant="transparent"
    >
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-2xl">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>Transaction #{transaction.id}</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <p className="text-muted">Loading...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transaction.items?.map((item) => {
                  const itemTotal = item.price * item.quantity;
                  return (
                    <Card key={item.id} className="p-4">
                      <Card.Content>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-muted">
                              {item.quantity} x Rp{" "}
                              {item.price.toLocaleString("id-ID")}
                            </p>
                          </div>
                          <p className="text-lg font-semibold">
                            Rp {itemTotal.toLocaleString("id-ID")}
                          </p>
                        </div>
                      </Card.Content>
                    </Card>
                  );
                })}

                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-xl font-bold">
                      Rp {transaction.total_amount.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {transaction.created_at && (
                  <p className="text-sm text-muted">
                    Created:{" "}
                    {new Date(transaction.created_at).toLocaleString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </p>
                )}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button slot="close" variant="secondary">
              Close
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
