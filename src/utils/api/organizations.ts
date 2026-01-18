import type {
  Organization,
  OrganizationCreate,
  OrganizationUpdate,
  OrganizationMember,
  OrganizationMemberCreate,
  OrganizationMemberUpdate,
} from "./types";

const API_BASE = "/api/organizations";

export async function getOrganizations(
  offset = 0,
  limit = 10,
  search?: string
): Promise<Organization[]> {
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
    throw new Error("Failed to fetch organizations");
  }

  return response.json();
}

export async function getOrganization(id: string): Promise<Organization> {
  const response = await fetch(`${API_BASE}/${id}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch organization");
  }

  return response.json();
}

export async function createOrganization(
  organization: OrganizationCreate
): Promise<Organization> {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(organization),
  });

  if (!response.ok) {
    throw new Error("Failed to create organization");
  }

  return response.json();
}

export async function updateOrganization(
  id: string,
  organization: OrganizationUpdate
): Promise<Organization> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(organization),
  });

  if (!response.ok) {
    throw new Error("Failed to update organization");
  }

  return response.json();
}

export async function deleteOrganization(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete organization");
  }
}

// Member operations
export async function getOrganizationMembers(
  organizationId: string
): Promise<OrganizationMember[]> {
  const response = await fetch(`${API_BASE}/${organizationId}/members`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch organization members");
  }

  return response.json();
}

export async function addOrganizationMember(
  organizationId: string,
  member: OrganizationMemberCreate
): Promise<OrganizationMember> {
  const response = await fetch(`${API_BASE}/${organizationId}/members`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
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
  member: OrganizationMemberUpdate
): Promise<OrganizationMember> {
  const response = await fetch(
    `${API_BASE}/${organizationId}/members/${memberId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(member),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update organization member");
  }

  return response.json();
}

export async function removeOrganizationMember(
  organizationId: string,
  memberId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/${organizationId}/members/${memberId}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to remove organization member");
  }
}
