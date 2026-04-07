import http from "k6/http";

/**
 * Consulta el datatable de usuarios (server-side).
 * @param {string} baseUrl   - GPM_BASE_URL (ej: https://host/dom/tenant)
 * @param {string} csrfToken - Token CSRF de la sesión activa
 * @param {number} [start=0]     - Offset de paginación
 * @param {number} [length=10]   - Registros por página
 * @param {string} [search=""]   - Término de búsqueda
 */
export function getUsersDatatable(baseUrl, csrfToken, start = 0, length = 10, search = "") {
  const payload = `draw=1&start=${start}&length=${length}&search%5Bvalue%5D=${encodeURIComponent(search)}&_token=${encodeURIComponent(csrfToken)}`;

  return http.post(`${baseUrl}/users/datatable`, payload, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      Accept: "application/json, text/javascript, */*; q=0.01",
      "X-Requested-With": "XMLHttpRequest",
      Referer: `${baseUrl}/users`,
    },
  });
}
