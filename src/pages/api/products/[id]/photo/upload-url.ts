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

    const contentType = request.headers.get("Content-Type");
    if (!contentType?.includes("multipart/form-data")) {
      return new Response(
        JSON.stringify({ error: "Expected multipart/form-data with file field" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const authHeader = request.headers.get("Authorization");
    const body = await request.arrayBuffer();

    const response = await fetch(
      `${API_BASE_URL}/products/${id}/photo/upload-url`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": contentType,
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body,
      }
    );

    const responseText = await response.text();

    return new Response(responseText || null, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") ?? "application/json",
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
