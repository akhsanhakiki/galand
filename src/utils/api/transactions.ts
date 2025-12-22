import type { Transaction, TransactionCreate } from "./types";

const API_BASE = "/api/transactions";

export async function getTransactions(
  offset = 0,
  limit = 100
): Promise<Transaction[]> {
  const response = await fetch(
    `${API_BASE}?offset=${offset}&limit=${limit}`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );

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
