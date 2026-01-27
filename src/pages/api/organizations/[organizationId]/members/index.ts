import type { APIRoute } from "astro";
import { getApiBaseUrl } from "../../../../../utils/env";

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const API_BASE_URL = getApiBaseUrl();
    const organizationId = params.organizationId;

    if (!organizationId) {
      return new Response(
        JSON.stringify({ error: "Organization ID is required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Extract Authorization header from the incoming request
    const authHeader = request.headers.get("Authorization");

    const headers: HeadersInit = {
      Accept: "application/json",
    };

    // Forward the Authorization header if present
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const response = await fetch(
      `${API_BASE_URL}/organizations/${organizationId}/members`,
      {
        headers,
      }
    );

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch organization members" }),
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const API_BASE_URL = getApiBaseUrl();
    const organizationId = params.organizationId;

    if (!organizationId) {
      return new Response(
        JSON.stringify({ error: "Organization ID is required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const body = await request.json();

    // Extract Authorization header from the incoming request
    const authHeader = request.headers.get("Authorization");

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // Forward the Authorization header if present
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const response = await fetch(
      `${API_BASE_URL}/organizations/${organizationId}/members`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to add organization member" }),
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
