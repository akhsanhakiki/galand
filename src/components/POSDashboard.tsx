"use client";

import { Button, Tabs } from "@heroui/react";
import { useState } from "react";
import type { Product, Transaction } from "../utils/api";
import ProductForm from "./ProductForm";
import ProductList from "./ProductList";
import ThemeSwitcher from "./ThemeSwitcher";
import TransactionForm from "./TransactionForm";
import TransactionList from "./TransactionList";
import TransactionView from "./TransactionView";

export default function POSDashboard() {
  const [activeTab, setActiveTab] = useState("products");
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [transactionFormOpen, setTransactionFormOpen] = useState(false);
  const [viewingTransactionId, setViewingTransactionId] = useState<
    number | null
  >(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setProductFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductFormOpen(true);
  };

  const handleProductSuccess = () => {
    setRefreshKey((prev: number) => prev + 1);
  };

  const handleCreateTransaction = () => {
    setTransactionFormOpen(true);
  };

  const handleTransactionSuccess = () => {
    setRefreshKey((prev: number) => prev + 1);
    if (activeTab !== "transactions") {
      setActiveTab("transactions");
    }
  };

  const handleViewTransaction = (transaction: Transaction) => {
    setViewingTransactionId(transaction.id);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface p-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-2xl font-bold">POS System</h1>
          <ThemeSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4">
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
        >
          <Tabs.ListContainer>
            <Tabs.List aria-label="POS Navigation">
              <Tabs.Tab id="products">
                <Tabs.Indicator />
                Products
              </Tabs.Tab>
              <Tabs.Tab id="transactions">
                <Tabs.Indicator />
                Transactions
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>

          <Tabs.Panel id="products">
            <div className="mt-4">
              <ProductList
                key={refreshKey}
                onCreate={handleCreateProduct}
                onEdit={handleEditProduct}
                onRefresh={handleProductSuccess}
              />
            </div>
          </Tabs.Panel>

          <Tabs.Panel id="transactions">
            <div className="mt-4">
              <div className="mb-4 flex items-center justify-between">
                <div />
                <Button onPress={handleCreateTransaction} variant="primary">
                  New Transaction
                </Button>
              </div>
              <TransactionList
                key={refreshKey}
                onView={handleViewTransaction}
              />
            </div>
          </Tabs.Panel>
        </Tabs>
      </main>

      <ProductForm
        isOpen={productFormOpen}
        product={editingProduct}
        onClose={() => {
          setProductFormOpen(false);
          setEditingProduct(null);
        }}
        onSuccess={handleProductSuccess}
      />

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
}
