import http from "k6/http";

/**
 * Consulta el endpoint de estadísticas de chart.
 * @param {string} baseUrl - GPM_BASE_URL (ej: https://nilo.agilgob.com/dom/agilgob.demo)
 * @param {number|string} chartId - ID del chart a consultar
 * @param {string} [time=""] - Parámetro de tiempo (opcional)
 */
export function getStatsChart(baseUrl, chartId, time = "") {

    const url = `${baseUrl}/stats/chart/${chartId}?time=${encodeURIComponent(time)}`;

    const res = http.get(url, {
        headers: {
            "Accept": "*/*",
            "Accept-Language": "es-MX,es;q=0.9,en-US;q=0.8,en;q=0.7",
            "X-Requested-With": "XMLHttpRequest",
            "Referer": `${baseUrl}/stats`,
            // Cookies manejadas automáticamente por el jar del VU
        },
    });

//   console.log(`[stats/chart] status: ${res.status}`);
//   console.log(`[stats/chart] body: ${res.body ? res.body.substring(0, 300) : '(vacío)'}`);

  return res;
}

