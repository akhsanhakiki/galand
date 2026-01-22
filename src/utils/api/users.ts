import type { User, UserCreate, UserUpdate } from "./types";
import { getBearerAuthHeaders } from "./session";

const API_BASE = "/api/users";

export async function getUsers(offset = 0, limit = 10): Promise<User[]> {
  const queryParams = new URLSearchParams();
  queryParams.set("offset", offset.toString());
  queryParams.set("limit", limit.toString());

  const headers = await getBearerAuthHeaders({
    Accept: "application/json",
  });

  const response = await fetch(`${API_BASE}?${queryParams.toString()}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return response.json();
}

export async function createUser(user: UserCreate): Promise<User> {
  const headers = await getBearerAuthHeaders({
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  const response = await fetch(API_BASE, {
    method: "POST",
    headers,
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    throw new Error("Failed to create user");
  }

  return response.json();
}

export async function updateUser(id: string, user: UserUpdate): Promise<User> {
  const headers = await getBearerAuthHeaders({
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  const response = await fetch(`${API_BASE}/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    throw new Error("Failed to update user");
  }

  return response.json();
}

export async function deleteUser(id: string): Promise<void> {
  const headers = await getBearerAuthHeaders({
    Accept: "application/json",
  });

  const response = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to delete user");
  }
}
