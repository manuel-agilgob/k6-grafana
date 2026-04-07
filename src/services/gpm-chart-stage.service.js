import http from "k6/http";

/**
 * Envía el POST al endpoint de chart por etapa.
 * @param {string} baseUrl    - GPM_BASE_URL (ej: https://host/dom/tenant)
 * @param {string} time       - Rango de tiempo (ej: "06/04/2020 - 06/04/2026")
 * @param {string} processId  - ID de proceso a filtrar (puede ser vacío)
 * @param {string} csrfToken  - Token CSRF de la sesión activa
 */
export function postChartStage(baseUrl, time, processId, csrfToken) {
  const payload = `time=${encodeURIComponent(time)}&process_id=${encodeURIComponent(processId)}&_token=${encodeURIComponent(csrfToken)}`;

  return http.post(`${baseUrl}/stats/chartStage`, payload, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      Accept: "*/*",
      "Accept-Language": "es-MX,es;q=0.9,en-US;q=0.8,en;q=0.7",
      "X-Requested-With": "XMLHttpRequest",
      Referer: `${baseUrl}/stats`,
    },
  });
}
