const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Resolve a potentially relative API path to an absolute URL.
 * Falls back to the current origin when no explicit base URL is configured.
 */
export function resolveApiUrl(url: string) {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  const base = API_BASE_URL?.trim() || window.location.origin;
  try {
    return new URL(url, base).toString();
  } catch {
    // In case URL construction fails, return the original string
    return url;
  }
}

type ApiInit = RequestInit & { json?: unknown };

/**
 * Flexible API helper that supports both of these call shapes:
 *  - apiRequest("POST", "/api/login", payload)
 *  - apiRequest("/api/login", { method: "POST", body: ... })
 * Automatically:
 *  - prefixes with VITE_API_BASE_URL (or current origin)
 *  - sends credentials for session auth
 *  - JSON encodes plain objects when needed
 */
export async function apiRequest(
  methodOrUrl: string,
  urlOrInit?: string | ApiInit | unknown,
  maybeData?: unknown
): Promise<any> {
  let url: string;
  let init: ApiInit = {};

  if (typeof urlOrInit === "string") {
    // Signature: (method, url, data?)
    url = urlOrInit;
    init.method = methodOrUrl;
    if (maybeData !== undefined) {
      init.body = JSON.stringify(maybeData);
      init.headers = { "Content-Type": "application/json" };
    }
  } else {
    // Signature: (url, init?)
    url = methodOrUrl;
    init = { ...(urlOrInit as ApiInit) };
    init.method = init.method || "GET";
  }

  const headers = new Headers(init.headers || {});

  // Add JSON header when the body is a plain object/string and header not set
  const bodyIsFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
  if (!bodyIsFormData && init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(resolveApiUrl(url), {
    credentials: "include",
    ...init,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const parseJson = contentType.includes("application/json");
  const responseData = parseJson ? await response.json().catch(() => null) : await response.text();

  if (!response.ok) {
    const message =
      (responseData && typeof responseData === "object" && "message" in responseData
        ? (responseData as any).message
        : undefined) ||
      response.statusText ||
      "An error occurred";
    throw new Error(message);
  }

  return responseData;
}
