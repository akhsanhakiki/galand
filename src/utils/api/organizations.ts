import type {
  Organization,
  OrganizationCreate,
  OrganizationUpdate,
  OrganizationMember,
  OrganizationMemberCreate,
  OrganizationMemberUpdate,
} from "./types";
import { getBearerAuthHeaders } from "./session";

const API_BASE = "/api/organizations";

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

/**
 * Upload toko logo (multipart `file`). Backend stores image and updates `logo`.
 */
export async function uploadOrganizationLogo(
  organizationId: string,
  file: File,
): Promise<Organization> {
  const contentType = file.type || "";
  if (!contentType.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  const authHeaders = await getBearerAuthHeaders({
    Accept: "application/json",
  });

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${API_BASE}/${organizationId}/logo/upload-url`,
    {
      method: "POST",
      headers: authHeaders,
      body: formData,
    },
  );

  if (!response.ok) {
    const message = await parseApiErrorMessage(
      response,
      "Failed to upload logo",
    );
    throw new Error(message);
  }

  return response.json();
}

export async function getOrganizations(
  offset = 0,
  limit = 10,
  search?: string,
): Promise<Organization[]> {
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
    throw new Error("Failed to fetch organizations");
  }

  return response.json();
}

export async function getOrganization(id: string): Promise<Organization> {
  const headers = await getBearerAuthHeaders({
    Accept: "application/json",
  });

  const response = await fetch(`${API_BASE}/${id}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch organization");
  }

  return response.json();
}

export async function createOrganization(
  organization: OrganizationCreate,
): Promise<Organization> {
  const headers = await getBearerAuthHeaders({
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  const response = await fetch(API_BASE, {
    method: "POST",
    headers,
    body: JSON.stringify(organization),
  });

  if (!response.ok) {
    throw new Error("Failed to create organization");
  }

  return response.json();
}

export async function updateOrganization(
  id: string,
  organization: OrganizationUpdate,
): Promise<Organization> {
  const headers = await getBearerAuthHeaders({
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  const response = await fetch(`${API_BASE}/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(organization),
  });

  if (!response.ok) {
    throw new Error("Failed to update organization");
  }

  return response.json();
}

export async function deleteOrganization(id: string): Promise<void> {
  const headers = await getBearerAuthHeaders({
    Accept: "application/json",
  });

  const response = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to delete organization");
  }
}

// Member operations
export async function getOrganizationMembers(
  organizationId: string,
): Promise<OrganizationMember[]> {
  const headers = await getBearerAuthHeaders({
    Accept: "application/json",
  });

  const response = await fetch(`${API_BASE}/${organizationId}/members`, {
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch organization members");
  }

  return response.json();
}

export async function addOrganizationMember(
  organizationId: string,
  member: OrganizationMemberCreate,
): Promise<OrganizationMember> {
  const headers = await getBearerAuthHeaders({
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  const response = await fetch(`${API_BASE}/${organizationId}/members`, {
    method: "POST",
    headers,
    body: JSON.stringify(member),
  });

  if (!response.ok) {
    throw new Error("Failed to add organization member");
  }

  return response.json();
}

export async function updateOrganizationMember(
  organizationId: string,
  memberId: string,
  member: OrganizationMemberUpdate,
): Promise<OrganizationMember> {
  const headers = await getBearerAuthHeaders({
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  const response = await fetch(
    `${API_BASE}/${organizationId}/members/${memberId}`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify(member),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to update organization member");
  }

  return response.json();
}

export async function removeOrganizationMember(
  organizationId: string,
  memberId: string,
): Promise<void> {
  const headers = await getBearerAuthHeaders({
    Accept: "application/json",
  });

  const response = await fetch(
    `${API_BASE}/${organizationId}/members/${memberId}`,
    {
      method: "DELETE",
      headers,
    },
  );

  if (!response.ok) {
    throw new Error("Failed to remove organization member");
  }
}
