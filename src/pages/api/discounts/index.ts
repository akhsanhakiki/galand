import type { APIRoute } from "astro";
import { getApiBaseUrl } from "../../../utils/env";

export const prerender = false;

export const GET: APIRoute = async ({ url, request }) => {
  try {
    const API_BASE_URL = getApiBaseUrl();
    const limit = url.searchParams.get("limit") || "20";
    const search = url.searchParams.get("search");

    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.set("limit", limit);
    if (search) {
      queryParams.set("search", search);
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
      `${API_BASE_URL}/discounts/?${queryParams.toString()}`,
      {
        headers,
      },
    );

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch discounts" }),
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
          },
        },
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

export const POST: APIRoute = async ({ request }) => {
  try {
    const API_BASE_URL = getApiBaseUrl();
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

    const response = await fetch(`${API_BASE_URL}/discounts/`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to create discount" }),
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
          },
        },
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
