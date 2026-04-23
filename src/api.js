const PROXY_URL = "/api/proxy";

async function request(action, params = {}) {
  const allParams = { action, ...params };
  const qs = Object.entries(allParams)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(
      typeof v === "object" ? JSON.stringify(v) : v
    )}`)
    .join("&");

  const res = await fetch(`${PROXY_URL}?${qs}`);
  if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
  return res.json();
}

export const api = {
  getMateriales:    ()    => request("getMateriales"),
  saveMaterial:     (m)   => request("saveMaterial", { data: JSON.stringify(m) }),
  deleteMateriales: (ids) => request("deleteMateriales", { ids: JSON.stringify(ids) }),
};