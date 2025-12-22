"use client";

import { Button, Card, Label, ListBox, Modal, NumberField, Select, Spinner } from "@heroui/react";
import { useEffect, useState } from "react";
import type { Product, TransactionItem } from "../utils/api";
import { createTransaction, getProducts } from "../utils/api";

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CartItem extends TransactionItem {
  product?: Product;
}

export default function TransactionForm({
  isOpen,
  onClose,
  onSuccess,
}: TransactionFormProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | undefined>();
  const [quantity, setQuantity] = useState<number | undefined>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      alert("Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  };

  const addToCart = () => {
    if (!selectedProductId || !quantity || quantity <= 0) {
      alert("Please select a product and enter a valid quantity");
      return;
    }

    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    if (quantity > product.stock) {
      alert(`Insufficient stock. Available: ${product.stock}`);
      return;
    }

    const existingItem = cart.find((item) => item.product_id === selectedProductId);
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        alert(`Insufficient stock. Available: ${product.stock}`);
        return;
      }
      setCart(
        cart.map((item) =>
          item.product_id === selectedProductId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    } else {
      setCart([...cart, { product_id: selectedProductId, quantity, product }]);
    }

    setSelectedProductId(undefined);
    setQuantity(1);
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.product_id !== productId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Please add at least one item to the cart");
      return;
    }

    try {
      setIsSubmitting(true);
      const transactionData = {
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      };
      await createTransaction(transactionData);
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      alert("Failed to create transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCart([]);
    setSelectedProductId(undefined);
    setQuantity(1);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      resetForm();
    }
  };

  const total = cart.reduce((sum, item) => {
    const product = item.product;
    if (!product) return sum;
    return sum + product.price * item.quantity;
  }, 0);

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={handleClose}>
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-2xl">
          <Modal.CloseTrigger />
          <form onSubmit={handleSubmit}>
            <Modal.Header>
              <Modal.Heading>Create Transaction</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="flex flex-col gap-4">
                <Card className="p-4">
                  <Card.Header>
                    <Card.Title className="text-lg">Add Items</Card.Title>
                  </Card.Header>
                  <Card.Content className="space-y-4">
                    <Select
                      className="w-full"
                      isDisabled={loadingProducts}
                      placeholder="Select a product"
                      selectedKey={selectedProductId?.toString()}
                      onSelectionChange={(key) => setSelectedProductId(Number(key))}
                    >
                      <Label>Product</Label>
                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          {products.map((product) => (
                            <ListBox.Item
                              key={product.id}
                              id={product.id.toString()}
                              textValue={product.name}
                            >
                              {product.name} - Rp {product.price.toLocaleString("id-ID")} (Stock: {product.stock})
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>

                    <NumberField
                      isRequired
                      minValue={1}
                      name="quantity"
                      value={quantity}
                      onChange={setQuantity}
                    >
                      <Label>Quantity</Label>
                      <NumberField.Group>
                        <NumberField.DecrementButton />
                        <NumberField.Input className="w-full" />
                        <NumberField.IncrementButton />
                      </NumberField.Group>
                    </NumberField>

                    <Button
                      type="button"
                      variant="secondary"
                      onPress={addToCart}
                      isDisabled={!selectedProductId || !quantity || quantity <= 0}
                    >
                      Add to Cart
                    </Button>
                  </Card.Content>
                </Card>

                {cart.length > 0 && (
                  <Card className="p-4">
                    <Card.Header>
                      <Card.Title className="text-lg">Cart</Card.Title>
                    </Card.Header>
                    <Card.Content>
                      <div className="space-y-2">
                        {cart.map((item) => {
                          const product = item.product;
                          if (!product) return null;
                          return (
                            <div
                              key={item.product_id}
                              className="flex items-center justify-between rounded-lg border border-border p-3"
                            >
                              <div className="flex-1">
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-muted">
                                  {item.quantity} x Rp {product.price.toLocaleString("id-ID")} = Rp{" "}
                                  {(product.price * item.quantity).toLocaleString("id-ID")}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="danger"
                                onPress={() => removeFromCart(item.product_id)}
                              >
                                Remove
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-4 border-t border-border pt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold">Total:</span>
                          <span className="text-xl font-bold">
                            Rp {total.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                    </Card.Content>
                  </Card>
                )}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button
                isDisabled={isSubmitting}
                slot="close"
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                isDisabled={cart.length === 0}
                isPending={isSubmitting}
                type="submit"
                variant="primary"
              >
                {isSubmitting ? (
                  <>
                    <Spinner color="current" size="sm" />
                    Processing...
                  </>
                ) : (
                  "Create Transaction"
                )}
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
