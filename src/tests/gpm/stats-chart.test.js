import http from "k6/http";
import { check, sleep } from "k6";
import { getCSRF } from "../../services/gpm-get-csrf.js";
import { login } from "../../services/gpm-login.js";
import { getStatsChart } from "../../services/gpm-stats.service.js";

const BASE_URL = __ENV.GPM_BASE_URL;
const CHART_ID = __ENV.GPM_CHART_ID || "1";

export const options = {
  vus: 1,
  iterations: 100,
};

/**
 * setup() corre una sola vez antes del test.
 * Hace login y extrae las cookies de sesión para pasarlas a todos los VUs.
 */
export function setup() {
  const token = getCSRF();
  const res = login(
    __ENV.GPM_USERNAME,
    __ENV.GPM_PASSWORD,
    token,
    BASE_URL
  );

  // Verificar que el login realmente autenticó (no redirigió de vuelta al login)
//   console.log(`[setup] login final URL: ${res.url}`);
//   console.log(`[setup] login status: ${res.status}`);
//   console.log(`[setup] login body (primeros 300): ${res.body ? res.body.substring(0, 300) : '(vacío)'}`);

  if (res.status !== 200) {
    throw new Error(`Login fallido: ${res.status}`);
  }

  // Si la URL final sigue siendo la página de login, las credenciales fallaron
  if (res.url.includes('/login')) {
    throw new Error(`Login redirigió de vuelta a /login — credenciales incorrectas o nombre de campo incorrecto`);
  }

  // Usar el jar del VU para capturar TODAS las cookies acumuladas (GET + POST + redirects)
  const jar = http.cookieJar();
  const cookies = jar.cookiesForURL(BASE_URL);
  console.log(`[setup] cookies en jar: ${JSON.stringify(cookies)}`);

  return { cookies };
}

export default function ({ cookies }) {
  // Inyectar las cookies de setup en el jar de este VU
  const jar = http.cookieJar();
  for (const [name, values] of Object.entries(cookies)) {
    jar.set(BASE_URL, name, values[0]);
  }

  const res = getStatsChart(BASE_URL, CHART_ID);

    check(res, {
        "status es 200": (r) => r.status === 200,
        "body no está vacío": (r) => r.body && r.body.length > 0,
    });

//   console.log(`[stats/chart/${CHART_ID}] status: ${res.status} | body size: ${res.body?.length ?? 0} bytes`);

    // sleep(1);
}

export function teardown() {}
