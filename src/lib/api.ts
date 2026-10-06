import type { Menu, MenuItem, Venue } from "../types/platform";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: "same-origin",
    ...init,
    headers: {
      ...(init?.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(init?.method && init.method !== "GET"
        ? { "X-Sera-Request": "dashboard" }
        : {}),
      ...init?.headers,
    },
  });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      message = body.error ?? body.detail ?? body.title ?? message;
    } catch {
      /* Use status message. */
    }
    throw new Error(message);
  }
  return response.status === 204 ? (undefined as T) : response.json();
}

export const api = {
  venues: () => request<Venue[]>("/api/venues"),
  adminVenues: () => request<Venue[]>("/api/admin/venues"),
  menu: (id: string) => request<Menu>(`/api/menu/${encodeURIComponent(id)}`),
  adminMenu: (id: string) =>
    request<Menu>(`/api/admin/menu/${encodeURIComponent(id)}`),
  session: () => request<{ authenticated: boolean }>("/api/admin/session"),
  login: (password: string) =>
    request("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    }),
  logout: () => request("/api/admin/logout", { method: "POST" }),
  saveVenue: (venue: Venue, isNew = false) =>
    request<Venue>(
      isNew ? "/api/admin/venues" : `/api/admin/venues/${venue.id}`,
      { method: isNew ? "POST" : "PUT", body: JSON.stringify(venue) },
    ),
  saveItem: (item: MenuItem, isNew = false) =>
    request<MenuItem>(
      isNew ? "/api/admin/items" : `/api/admin/items/${item.id}`,
      { method: isNew ? "POST" : "PUT", body: JSON.stringify(item) },
    ),
  deleteItem: (id: string) =>
    request<void>(`/api/admin/items/${id}`, { method: "DELETE" }),
  upload: (file: File) => {
    const body = new FormData();
    body.append("file", file);
    return request<{ url: string }>("/api/admin/upload", {
      method: "POST",
      body,
    });
  },
};
