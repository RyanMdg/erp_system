const API_URL =
  import.meta.env.VITE_API_URL || "https://erp-system-myx2.onrender.com/api";

type ApiError = {
  message?: string;
};

const getToken = () => {
  return localStorage.getItem("erp_token");
};

const setToken = (token: string) => {
  localStorage.setItem("erp_token", token);
};

const clearToken = () => {
  localStorage.removeItem("erp_token");
};

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const payload = (await response.json()) as {
    success: boolean;
    data: T;
    message?: string;
  };

  if (!response.ok || payload?.success === false) {
    const errorMessage =
      payload?.message || `Request failed with status ${response.status}`;
    const error: ApiError = new Error(errorMessage);
    throw error;
  }

  return payload.data;
}

export { apiFetch, getToken, setToken, clearToken };
