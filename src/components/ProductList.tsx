"use client";

import { Button, Card, Spinner } from "@heroui/react";
import { useEffect, useState, useMemo } from "react";
import type { Product } from "../utils/api";
import { deleteProduct, getProducts } from "../utils/api";

interface ProductListProps {
  onEdit: (product: Product) => void;
  onCreate: () => void;
  onRefresh: () => void;
}

const ITEMS_PER_PAGE = 9;

export default function ProductList({
  onEdit,
  onCreate,
  onRefresh,
}: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

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

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return products.slice(startIndex, endIndex);
  }, [products, currentPage]);

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
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paginatedProducts.map((product) => (
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
              {Math.min(currentPage * ITEMS_PER_PAGE, products.length)} of{" "}
              {products.length} products
            </div>
          )}
        </>
      )}
    </div>
  );
}
