import { getNeonAuthUrl } from "../env";

export async function getSessionToken(): Promise<string> {
  const neonAuthUrl = getNeonAuthUrl();
  const sessionResponse = await fetch(`${neonAuthUrl}/get-session`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  if (!sessionResponse.ok) {
    throw new Error("Failed to get session. Please log in again.");
  }

  const sessionData = await sessionResponse.json();
  const token = sessionData?.session?.token;

  if (!token) {
    throw new Error("No session token available. Please log in again.");
  }

  return token;
}

export async function getBearerAuthHeaders(
  additionalHeaders: HeadersInit = {}
): Promise<HeadersInit> {
  const token = await getSessionToken();
  return {
    Accept: "*/*",
    Authorization: `Bearer ${token}`,
    ...additionalHeaders,
  };
}

