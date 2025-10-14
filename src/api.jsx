// src/api.js
const BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000/api";

export async function listRequests(q = "") {
  const res = await fetch(`${BASE}/requests${q ? `?q=${encodeURIComponent(q)}` : ""}`);
  return res.json();
}

export async function createRequest(data) {
  const res = await fetch(`${BASE}/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateRequest(id, data) {
  const res = await fetch(`${BASE}/requests/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteRequest(id) {
  await fetch(`${BASE}/requests/${id}`, { method: "DELETE" });
}

