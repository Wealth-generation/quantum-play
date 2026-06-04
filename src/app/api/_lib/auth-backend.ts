import "server-only";

type BackendFetchInit = RequestInit & {
  headers?: HeadersInit;
};

function getBackendBaseUrl(): string {
  const baseUrl = process.env.BACKEND_BASE_URL?.trim();

  if (!baseUrl) {
    throw new Error("BACKEND_BASE_URL is not configured");
  }

  return baseUrl.replace(/\/+$/, "");
}

export function backendUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getBackendBaseUrl()}${normalizedPath}`;
}

export function backendFetch(path: string, init: BackendFetchInit = {}) {
  return fetch(backendUrl(path), {
    ...init,
    cache: init.cache ?? "no-store",
  });
}
