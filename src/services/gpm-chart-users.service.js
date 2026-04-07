import http from "k6/http";

/**
 * Consulta el endpoint de chart de usuarios.
 * @param {string} baseUrl - GPM_BASE_URL (ej: https://host/dom/tenant)
 * @param {string} [time=""] - Rango de tiempo (ej: "06/04/2026 - 06/04/2026")
 */
export function getChartUsers(baseUrl, time = "") {
  const url = `${baseUrl}/stats/chartUsers?time=${encodeURIComponent(time)}`;

  return http.get(url, {
    headers: {
      Accept: "*/*",
      "Accept-Language": "es-MX,es;q=0.9,en-US;q=0.8,en;q=0.7",
      "X-Requested-With": "XMLHttpRequest",
      Referer: `${baseUrl}/stats`,
    },
  });
}
