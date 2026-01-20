import type { SummaryResponse } from "./types";
import { getBearerAuthHeaders } from "./session";

const API_BASE = "/api/summary";

export async function getSummary(
  startDate?: string,
  endDate?: string
): Promise<SummaryResponse> {
  const queryParams = new URLSearchParams();
  if (startDate) {
    queryParams.set("start_date", startDate);
  }
  if (endDate) {
    queryParams.set("end_date", endDate);
  }

  const url = queryParams.toString()
    ? `${API_BASE}?${queryParams.toString()}`
    : API_BASE;

  const headers = await getBearerAuthHeaders({
    Accept: "application/json",
  });

  const response = await fetch(url, {
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch summary");
  }

  return response.json();
}
