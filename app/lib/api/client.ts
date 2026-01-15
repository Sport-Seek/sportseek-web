const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.sportseek.fr";

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message?: string
  ) {
    super(message || `API Error: ${status} ${statusText}`);
    this.name = "ApiError";
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text().catch(() => undefined);
    throw new ApiError(response.status, response.statusText, message);
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError(response.status, "Invalid JSON response");
  }
}

function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(endpoint, API_BASE_URL);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}

export const apiClient = {
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const { params, ...fetchOptions } = options || {};
    const url = buildUrl(endpoint, params);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions?.headers,
      },
      ...fetchOptions,
    });

    return handleResponse<T>(response);
  },

  async post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const { params, ...fetchOptions } = options || {};
    const url = buildUrl(endpoint, params);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...fetchOptions,
    });

    return handleResponse<T>(response);
  },

  async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const { params, ...fetchOptions } = options || {};
    const url = buildUrl(endpoint, params);

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...fetchOptions,
    });

    return handleResponse<T>(response);
  },

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const { params, ...fetchOptions } = options || {};
    const url = buildUrl(endpoint, params);

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions?.headers,
      },
      ...fetchOptions,
    });

    return handleResponse<T>(response);
  },
};
