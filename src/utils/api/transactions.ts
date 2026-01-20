import type { Transaction, TransactionCreate } from "./types";
import { getBearerAuthHeaders } from "./session";

const API_BASE = "/api/transactions";

export async function getTransactions(
  offset = 0,
  limit = 100,
  startDate?: string,
  endDate?: string
): Promise<Transaction[]> {
  const queryParams = new URLSearchParams();
  queryParams.set("offset", offset.toString());
  queryParams.set("limit", limit.toString());
  if (startDate) {
    queryParams.set("start_date", startDate);
  }
  if (endDate) {
    queryParams.set("end_date", endDate);
  }

  const headers = await getBearerAuthHeaders();

  const response = await fetch(`${API_BASE}?${queryParams.toString()}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch transactions");
  }

  return response.json();
}

export async function getTransaction(id: number): Promise<Transaction> {
  const headers = await getBearerAuthHeaders({
    Accept: "application/json",
  });
  const response = await fetch(`${API_BASE}/${id}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch transaction");
  }

  return response.json();
}

export async function createTransaction(
  transaction: TransactionCreate
): Promise<Transaction> {
  const headers = await getBearerAuthHeaders({
    "Content-Type": "application/json",
    Accept: "application/json",
  });
  const response = await fetch(API_BASE, {
    method: "POST",
    headers,
    body: JSON.stringify(transaction),
  });

  if (!response.ok) {
    throw new Error("Failed to create transaction");
  }

  return response.json();
}
