import type { APIRoute } from "astro";
import { getApiBaseUrl } from "../../../utils/env";

export const prerender = false;

export const GET: APIRoute = async ({ url, request }) => {
  try {
    const API_BASE_URL = getApiBaseUrl();
    const startDate = url.searchParams.get("start_date");
    const endDate = url.searchParams.get("end_date");

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (startDate) {
      queryParams.set("start_date", startDate);
    }
    if (endDate) {
      queryParams.set("end_date", endDate);
    }

    const queryString = queryParams.toString();
    const apiUrl = queryString
      ? `${API_BASE_URL}/summary/?${queryString}`
      : `${API_BASE_URL}/summary/`;

    // Extract Authorization header from the incoming request
    const authHeader = request.headers.get("Authorization");

    const headers: HeadersInit = {
      Accept: "application/json",
    };

    // Forward the Authorization header if present
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const response = await fetch(apiUrl, {
      headers,
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch summary" }),
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
