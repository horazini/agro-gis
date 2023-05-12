export function getAuthToken() {
  return localStorage.getItem("authToken");
}

export function setAuthToken(token: string) {
  localStorage.setItem("authToken", token);
}

export function removeAuthToken() {
  localStorage.removeItem("authToken");
}

export async function apiRequest<T>(
  method: string,
  path: string,
  data?: any
): Promise<T> {
  const headers: HeadersInit = {};
  const authToken = getAuthToken();
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  const response = await fetch(`${path}`, {
    method,
    headers: { "Content-type": "application/json" },
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error);
  }
  return await response.json();
}
