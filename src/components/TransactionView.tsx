"use client";

import { Button, Card, Modal } from "@heroui/react";
import { useEffect, useState } from "react";
import { LuPrinter } from "react-icons/lu";
import type { Transaction } from "../utils/api";
import { getTransaction } from "../utils/api";
import { printTransaction } from "../utils/print";

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

  const handlePrint = () => {
    if (!transaction) return;
    printTransaction(transaction);
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
            <Modal.Heading>Transaction {transaction.id}</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <p className="text-muted">Loading...</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 text-xs font-semibold text-muted">
                          Nama Barang
                        </th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-muted">
                          Pembelian
                        </th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-muted">
                          Total Harga
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transaction.items?.map((item) => {
                        const itemTotal = item.price * item.quantity;
                        return (
                          <tr key={item.id}>
                            <td className="py-2 px-3">
                              <p className="text-xs font-medium text-foreground">
                                {item.product_name}
                              </p>
                            </td>
                            <td className="py-2 px-3">
                              <p className="text-xs text-muted">
                                {item.quantity} x Rp{" "}
                                {item.price.toLocaleString("id-ID")}
                              </p>
                            </td>
                            <td className="py-2 px-3 text-right">
                              <p className="text-xs font-medium text-foreground">
                                Rp {itemTotal.toLocaleString("id-ID")}
                              </p>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-border pt-4 px-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                      Total:
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      Rp {transaction.total_amount.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {transaction.created_at && (
                  <p className="text-xs text-muted px-2">
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
            <Button variant="primary" onPress={handlePrint}>
              <LuPrinter className="w-4 h-4" />
              Print
            </Button>
            <Button slot="close" variant="secondary">
              Close
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
