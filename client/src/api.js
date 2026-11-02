const BASE = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

const qs = (params) => {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v));
  const s = new URLSearchParams(clean).toString();
  return s ? `?${s}` : "";
};

export const api = {
  getDoctors: () => request("/doctors"),
  getAppointments: (filters = {}) => request(`/appointments${qs(filters)}`),
  getAvailability: (params) => request(`/appointments/availability${qs(params)}`),
  createAppointment: (body) => request("/appointments", { method: "POST", body: JSON.stringify(body) }),
  updateAppointment: (id, body) =>
    request(`/appointments/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  updateStatus: (id, status) =>
    request(`/appointments/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  deleteAppointment: (id) => request(`/appointments/${id}`, { method: "DELETE" }),
};
