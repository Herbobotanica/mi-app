const PROXY_URL = "/api/proxy";

async function get(action, params = {}) {
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

async function post(action, params = {}) {
  const formData = new URLSearchParams();
  formData.append("action", action);
  Object.entries(params).forEach(([k, v]) => {
    formData.append(k, typeof v === "object" ? JSON.stringify(v) : v);
  });
  const res = await fetch(PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  });
  if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
  return res.json();
}

function normalizarFecha(fecha) {
  if (!fecha) return "";
  if (typeof fecha === "string" && fecha.includes("T")) return fecha.slice(0, 10);
  return fecha;
}

export const api = {
  // Materiales
  getMateriales: async () => {
    const res = await get("getMateriales");
    if (res.ok) {
      res.data = res.data.map(m => ({
        ...m,
        fechaCosto: normalizarFecha(m.fechaCosto),
      }));
    }
    return res;
  },
  saveMaterial:     (m)   => get("saveMaterial",     { data: JSON.stringify(m) }),
  deleteMateriales: (ids) => get("deleteMateriales", { ids:  JSON.stringify(ids) }),

  // Catálogo
  getRecetas: () => get("getRecetas"),
  saveReceta:   (receta) => post("saveReceta", { data: JSON.stringify(receta) }),
};