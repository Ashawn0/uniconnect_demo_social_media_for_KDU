import { QueryClient, QueryFunction } from "@tanstack/react-query";

const baseFromEnv = import.meta.env?.VITE_API_BASE_URL?.trim();
const API_BASE_URL = baseFromEnv ? baseFromEnv.replace(/\/$/, "") : "";

export function resolveApiUrl(pathOrUrl: string): string {
  if (!API_BASE_URL || pathOrUrl.startsWith("http")) {
    return pathOrUrl;
  }
  if (!pathOrUrl.startsWith("/")) {
    return `${API_BASE_URL}/${pathOrUrl}`;
  }
  return `${API_BASE_URL}${pathOrUrl}`;
}

async function throwIfResNotOk(res: Response) {
  if (res.ok) return;

  let message = res.statusText;
  let details: unknown;
  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      const data = await res.clone().json();
      if (data && typeof data === "object") {
        if (typeof (data as any).message === "string") {
          message = (data as any).message;
        }
        if ((data as any).errors) {
          details = (data as any).errors;
        }
      }
    } catch {
      // ignore JSON parse errors
    }
  } else {
    const text = await res.clone().text();
    if (text) {
      message = text;
    }
  }

  const error = new Error(`${res.status}: ${message}`);
  (error as any).details = details;
  throw error;
}

export async function apiRequest(
  url: string,
  options?: RequestInit,
): Promise<any> {
  const res = await fetch(resolveApiUrl(url), {
    ...options,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await res.json();
  }
  
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const requestPath = queryKey.join("/") as string;
    const res = await fetch(resolveApiUrl(requestPath), {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
