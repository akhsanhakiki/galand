import type {
  Product,
  ProductCreate,
  ProductPhotoUploadResponse,
  ProductUpdate,
} from "./types";
import { getBearerAuthHeaders } from "./session";

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

export async function createProduct(
  product: ProductCreate
): Promise<Product> {
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
  product: ProductUpdate
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
    const message = await parseApiErrorMessage(response, "Failed to update product");
    throw new Error(message);
  }

  return response.json();
}

async function parseApiErrorMessage(
  response: Response,
  fallback: string
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

export async function getProductPhotoUploadUrl(
  productId: number,
  contentType: string
): Promise<ProductPhotoUploadResponse> {
  const headers = await getBearerAuthHeaders({
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  const response = await fetch(`${API_BASE}/${productId}/photo/upload-url`, {
    method: "POST",
    headers,
    body: JSON.stringify({ content_type: contentType }),
  });

  if (!response.ok) {
    throw new Error("Failed to get photo upload URL");
  }

  return response.json();
}

export async function putProductPhotoToStorage(
  uploadUrl: string,
  file: Blob,
  contentType: string
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": contentType,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to upload photo");
  }
}

/**
 * Presign + PUT file to object storage. Does not PATCH the product — merge
 * `{ photo_url, photo_key }` into your save payload so the server receives
 * photo fields together with other updates (avoids empty PATCH errors).
 */
export async function putProductPhotoFile(
  productId: number,
  file: File
): Promise<{ photo_url: string; photo_key: string }> {
  const contentType = file.type || "image/jpeg";
  if (!contentType.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  const { upload_url, photo_url, photo_key } = await getProductPhotoUploadUrl(
    productId,
    contentType
  );
  await putProductPhotoToStorage(upload_url, file, contentType);
  return { photo_url, photo_key };
}
