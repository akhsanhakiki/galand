import type { Expense, ExpenseCreate, ExpenseUpdate } from "./types";
import { getBearerAuthHeaders } from "./session";

const API_BASE = "/api/expenses";

export async function getExpenses(
  offset = 0,
  limit = 100,
  search?: string,
  startDate?: string,
  endDate?: string
): Promise<Expense[]> {
  const queryParams = new URLSearchParams();
  queryParams.set("offset", offset.toString());
  queryParams.set("limit", limit.toString());
  if (search) {
    queryParams.set("search", search);
  }
  if (startDate) {
    queryParams.set("start_date", startDate);
  }
  if (endDate) {
    queryParams.set("end_date", endDate);
  }

  const headers = await getBearerAuthHeaders({
    Accept: "application/json",
  });

  const response = await fetch(`${API_BASE}?${queryParams.toString()}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch expenses");
  }

  return response.json();
}

export async function getExpense(id: number): Promise<Expense> {
  const headers = await getBearerAuthHeaders({
    Accept: "application/json",
  });

  const response = await fetch(`${API_BASE}/${id}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch expense");
  }

  return response.json();
}

export async function createExpense(
  expense: ExpenseCreate
): Promise<Expense> {
  const headers = await getBearerAuthHeaders({
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  const response = await fetch(API_BASE, {
    method: "POST",
    headers,
    body: JSON.stringify(expense),
  });

  if (!response.ok) {
    throw new Error("Failed to create expense");
  }

  return response.json();
}

export async function updateExpense(
  id: number,
  expense: ExpenseUpdate
): Promise<Expense> {
  const headers = await getBearerAuthHeaders({
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  const response = await fetch(`${API_BASE}/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(expense),
  });

  if (!response.ok) {
    throw new Error("Failed to update expense");
  }

  return response.json();
}

export async function deleteExpense(id: number): Promise<void> {
  const headers = await getBearerAuthHeaders({
    Accept: "application/json",
  });

  const response = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to delete expense");
  }
}
