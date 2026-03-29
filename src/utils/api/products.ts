import type { Product, ProductCreate, ProductUpdate } from "./types";
import { getBearerAuthHeaders } from "./session";

const API_BASE = "/api/products";

export async function getProducts(
  offset = 0,
  limit = 100,
  search?: string,
): Promise<Product[]> {
  const queryParams = new URLSearchParams();
  queryParams.set("offset", offset.toString());
  queryParams.set("limit", limit.toString());
  if (search) {
    queryParams.set("search", search);
  }

  const headers = await getBearerAuthHeaders({
    Accept: "application/json",
  });

  const response = await fetch(`${API_BASE}?${queryParams.toString()}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
}

export async function getProduct(id: number): Promise<Product> {
  const headers = await getBearerAuthHeaders({
    Accept: "application/json",
  });

  const response = await fetch(`${API_BASE}/${id}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }

  return response.json();
}

export async function createProduct(product: ProductCreate): Promise<Product> {
  const headers = await getBearerAuthHeaders({
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  const response = await fetch(API_BASE, {
    method: "POST",
    headers,
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    throw new Error("Failed to create product");
  }

  return response.json();
}

export async function updateProduct(
  id: number,
  product: ProductUpdate,
): Promise<Product> {
  const headers = await getBearerAuthHeaders({
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  const response = await fetch(`${API_BASE}/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    const message = await parseApiErrorMessage(
      response,
      "Failed to update product",
    );
    throw new Error(message);
  }

  return response.json();
}

async function parseApiErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const text = await response.text();
    if (!text) return fallback;
    const data = JSON.parse(text) as Record<string, unknown>;
    if (typeof data.detail === "string") return data.detail;
    if (typeof data.message === "string") return data.message;
    if (typeof data.error === "string") return data.error;
  } catch {
    // ignore
  }
  return fallback;
}

export async function deleteProduct(id: number): Promise<void> {
  const headers = await getBearerAuthHeaders({
    Accept: "application/json",
  });

  const response = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to delete product");
  }
}

/**
 * Upload image (multipart `file`). Backend resizes → WebP → R2 → updates
 * photo and returns the full product.
 */
export async function uploadProductPhoto(
  productId: number,
  file: File,
): Promise<Product> {
  const contentType = file.type || "";
  if (!contentType.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  const authHeaders = await getBearerAuthHeaders({
    Accept: "application/json",
  });

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/${productId}/photo/upload-url`, {
    method: "POST",
    headers: authHeaders,
    body: formData,
  });

  if (!response.ok) {
    const message = await parseApiErrorMessage(
      response,
      "Failed to upload photo",
    );
    throw new Error(message);
  }

  return response.json();
}
