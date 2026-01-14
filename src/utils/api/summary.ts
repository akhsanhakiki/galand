import type { SummaryResponse } from "./types";

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

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch summary");
  }

  return response.json();
}
