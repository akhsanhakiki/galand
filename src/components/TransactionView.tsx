"use client";

import { Button, Card, Modal } from "@heroui/react";
import { useEffect, useState } from "react";
import type { Product, Transaction } from "../utils/api";
import { getProduct, getTransaction } from "../utils/api";

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
  const [products, setProducts] = useState<Record<number, Product>>({});
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

      const productIds = data.items?.map((item) => item.product_id) || [];
      const productPromises = productIds.map((id) => getProduct(id));
      const productData = await Promise.all(productPromises);
      const productMap: Record<number, Product> = {};
      productData.forEach((product) => {
        productMap[product.id] = product;
      });
      setProducts(productMap);
    } catch (error) {
      alert("Failed to load transaction details");
    } finally {
      setLoading(false);
    }
  };

  if (!transaction) {
    return null;
  }

  const total = transaction.items?.reduce((sum, item) => {
    const product = products[item.product_id];
    if (!product) return sum;
    return sum + product.price * item.quantity;
  }, 0) || 0;

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onClose}>
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
                  const product = products[item.product_id];
                  if (!product) return null;
                  return (
                    <Card key={item.product_id} className="p-4">
                      <Card.Content>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted">
                              {item.quantity} x Rp {product.price.toLocaleString("id-ID")}
                            </p>
                          </div>
                          <p className="text-lg font-semibold">
                            Rp {(product.price * item.quantity).toLocaleString("id-ID")}
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
                      Rp {total.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {transaction.created_at && (
                  <p className="text-sm text-muted">
                    Created: {new Date(transaction.created_at).toLocaleString()}
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
