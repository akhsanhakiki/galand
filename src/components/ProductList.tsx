"use client";

import { Button, Card, Spinner } from "@heroui/react";
import { useEffect, useState } from "react";
import type { Product } from "../utils/api";
import { deleteProduct, getProducts } from "../utils/api";

interface ProductListProps {
  onEdit: (product: Product) => void;
  onCreate: () => void;
  onRefresh: () => void;
}

export default function ProductList({
  onEdit,
  onCreate,
  onRefresh,
}: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      alert("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteProduct(id);
      await fetchProducts();
      onRefresh();
    } catch (error) {
      alert("Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Products</h2>
        <Button onPress={onCreate} variant="primary">
          Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <Card className="p-8 text-center">
          <Card.Content>
            <p className="text-muted">
              No products found. Create your first product!
            </p>
          </Card.Content>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="p-4">
              <Card.Header>
                <Card.Title className="text-lg">{product.name}</Card.Title>
              </Card.Header>
              <Card.Content className="space-y-2">
                <p className="text-sm text-muted">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">
                    Rp {product.price.toLocaleString("id-ID")}
                  </span>
                  <span className="text-sm text-muted">
                    Stock: {product.stock}
                  </span>
                </div>
              </Card.Content>
              <Card.Footer className="flex gap-2">
                <Button
                  size="sm"
                  variant="tertiary"
                  onPress={() => onEdit(product)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onPress={() => handleDelete(product.id)}
                  isPending={deletingId === product.id}
                >
                  {deletingId === product.id ? (
                    <>
                      <Spinner color="current" size="sm" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </Button>
              </Card.Footer>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
