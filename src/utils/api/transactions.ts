import type { Transaction, TransactionCreate } from "./types";
import { getNeonAuthUrl } from "../env";

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

  // Fetch get-session endpoint directly to get the raw session token
  // The response structure is: { session: { token: "..." }, user: {...} }
  const neonAuthUrl = getNeonAuthUrl();
  const sessionResponse = await fetch(`${neonAuthUrl}/get-session`, {
    method: "GET",
    credentials: "include", // Include cookies for authentication
    headers: {
      Accept: "application/json",
    },
  });

  if (!sessionResponse.ok) {
    throw new Error("Failed to get session. Please log in again.");
  }

  const sessionData = await sessionResponse.json();
  
  // Extract token from the direct API response: { session: { token: "..." } }
  const token = sessionData?.session?.token;

  if (!token) {
    throw new Error("No session token available. Please log in again.");
  }

  const headers: HeadersInit = {
    Accept: "*/*",
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(`${API_BASE}?${queryParams.toString()}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch transactions");
  }

  return response.json();
}

export async function getTransaction(id: number): Promise<Transaction> {
  const response = await fetch(`${API_BASE}/${id}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch transaction");
  }

  return response.json();
}

export async function createTransaction(
  transaction: TransactionCreate
): Promise<Transaction> {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(transaction),
  });

  if (!response.ok) {
    throw new Error("Failed to create transaction");
  }

  return response.json();
}
