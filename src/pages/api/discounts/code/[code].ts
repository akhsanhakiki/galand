import type { APIRoute } from "astro";
import { getApiBaseUrl } from "../../../../utils/env";

export const prerender = false;

const API_BASE_URL = getApiBaseUrl();

export const GET: APIRoute = async ({ params }) => {
  try {
    const code = params.code;

    if (!code) {
      return new Response(
        JSON.stringify({ error: "Discount code is required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Astro already decodes the URL parameter, so we use it directly
    // but encode it again for the backend API call
    const encodedCode = encodeURIComponent(code);
    const response = await fetch(`${API_BASE_URL}/discounts/code/${encodedCode}`, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch discount by code" }),
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
