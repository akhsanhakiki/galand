import type { APIRoute } from "astro";
import { getApiBaseUrl } from "../../../utils/env";

export const prerender = false;

const API_BASE_URL = getApiBaseUrl();

export const GET: APIRoute = async ({ url }) => {
  try {
    const offset = url.searchParams.get("offset") || "0";
    const limit = url.searchParams.get("limit") || "100";
    const search = url.searchParams.get("search");
    const startDate = url.searchParams.get("start_date");
    const endDate = url.searchParams.get("end_date");

    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.set("offset", offset);
    queryParams.set("limit", limit);
    if (search) {
      queryParams.set("search", search);
    }
    if (startDate) {
      queryParams.set("start_date", startDate);
    }
    if (endDate) {
      queryParams.set("end_date", endDate);
    }

    const response = await fetch(
      `${API_BASE_URL}/expenses/?${queryParams.toString()}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch expenses" }),
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

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/expenses/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to create expense" }),
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
