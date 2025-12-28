import type { Product, ProductCreate, ProductUpdate } from "./types";

const API_BASE = "/api/products";

export async function getProducts(
  offset = 0,
  limit = 100,
  search?: string
): Promise<Product[]> {
  const queryParams = new URLSearchParams();
  queryParams.set("offset", offset.toString());
  queryParams.set("limit", limit.toString());
  if (search) {
    queryParams.set("search", search);
  }

  const response = await fetch(`${API_BASE}?${queryParams.toString()}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
}

export async function getProduct(id: number): Promise<Product> {
  const response = await fetch(`${API_BASE}/${id}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }

  return response.json();
}

export async function createProduct(
  product: ProductCreate
): Promise<Product> {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    throw new Error("Failed to create product");
  }

  return response.json();
}

export async function updateProduct(
  id: number,
  product: ProductUpdate
): Promise<Product> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    throw new Error("Failed to update product");
  }

  return response.json();
}

export async function deleteProduct(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete product");
  }
}
