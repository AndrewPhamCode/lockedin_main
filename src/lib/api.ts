// src/lib/api.ts
// Centralized API helper — used by frontend to call your backend

type JSONValue = any;

// Basic wrapper for fetch with error handling
async function request<T = JSONValue>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "content-type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// Define all backend endpoints here
export const api = {
  // Health check
  health: () => request<{ ok: boolean }>("/api/health"),

  // User-related
  listUsers: () => request<any[]>("/api/users"),
  getUserByEmail: (email: string) =>
  request<any>(`/api/users/by-email?email=${encodeURIComponent(email)}`),
  // inside export const api = { ... }
  login: (body: { name: string; email: string; password: string; emergencyPassword?: string }) =>
  request<any>("/api/users/login", { method: "POST", body: JSON.stringify(body) }),
  createUser: (body: {
    name: string;
    email: string;
    password: string;
    emergencyPassword: string;
  }) => request<any>("/api/users", { method: "POST", body: JSON.stringify(body) }),

  // Task-related
  listTasks: (userId?: string) =>
    request<any[]>(`/api/tasks${userId ? `?userId=${encodeURIComponent(userId)}` : ""}`),
  createTask: (body: { userId: string; title: string }) =>
    request<any>("/api/tasks", { method: "POST", body: JSON.stringify(body) }),
  updateTask: (id: string, body: Partial<{ title: string; completed: boolean }>) =>
    request<any>(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteTask: (id: string) =>
    request<{ ok: boolean }>(`/api/tasks/${id}`, { method: "DELETE" }),
};
