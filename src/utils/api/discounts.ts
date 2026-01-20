import type { Discount, DiscountCreate, DiscountUpdate } from "./types";
import { getBearerAuthHeaders } from "./session";

const API_BASE = "/api/discounts";

export async function getDiscounts(
  limit = 20,
  search?: string
): Promise<Discount[]> {
  const queryParams = new URLSearchParams();
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
    throw new Error("Failed to fetch discounts");
  }

  return response.json();
}

export async function getDiscount(id: number): Promise<Discount> {
  const headers = await getBearerAuthHeaders({
    Accept: "application/json",
  });

  const response = await fetch(`${API_BASE}/${id}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch discount");
  }

  return response.json();
}

export async function getDiscountByCode(code: string): Promise<Discount> {
  const encodedCode = encodeURIComponent(code);
  const headers = await getBearerAuthHeaders({
    Accept: "application/json",
  });

  const response = await fetch(`${API_BASE}/code/${encodedCode}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch discount by code");
  }

  return response.json();
}

export async function createDiscount(
  discount: DiscountCreate
): Promise<Discount> {
  const headers = await getBearerAuthHeaders({
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  const response = await fetch(API_BASE, {
    method: "POST",
    headers,
    body: JSON.stringify(discount),
  });

  if (!response.ok) {
    throw new Error("Failed to create discount");
  }

  return response.json();
}

export async function updateDiscount(
  id: number,
  discount: DiscountUpdate
): Promise<Discount> {
  const headers = await getBearerAuthHeaders({
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  const response = await fetch(`${API_BASE}/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(discount),
  });

  if (!response.ok) {
    throw new Error("Failed to update discount");
  }

  return response.json();
}

export async function deleteDiscount(id: number): Promise<void> {
  const headers = await getBearerAuthHeaders({
    Accept: "application/json",
  });

  const response = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to delete discount");
  }
}
