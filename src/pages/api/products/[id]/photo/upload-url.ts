import type { APIRoute } from "astro";
import { getApiBaseUrl } from "../../../../../utils/env";

export const prerender = false;

const API_BASE_URL = getApiBaseUrl();

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const id = params.id;

    if (!id) {
      return new Response(JSON.stringify({ error: "Product ID is required" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const body = await request.json();
    const authHeader = request.headers.get("Authorization");

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const response = await fetch(
      `${API_BASE_URL}/products/${id}/photo/upload-url`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to get upload URL" }),
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
  } catch {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
