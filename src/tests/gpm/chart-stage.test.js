import http from "k6/http";
import { check } from "k6";
import { getCSRF } from "../../services/gpm-get-csrf.js";
import { login } from "../../services/gpm-login.js";
import { postChartStage } from "../../services/gpm-chart-stage.service.js";

const BASE_URL = __ENV.GPM_BASE_URL;
const TIME = __ENV.GPM_TIME || "";
const PROCESS_ID = __ENV.GPM_PROCESS_ID || "";

export const options = {
  vus: 1,
  iterations: 100,
};

/**
 * setup() corre una sola vez antes del test.
 * Hace login, extrae cookies de sesión y obtiene el CSRF token de la página
 * de stats para usarlo en el body del POST a chartStage.
 */
export function setup() {
  const token = getCSRF();
  const res = login(__ENV.GPM_USERNAME, __ENV.GPM_PASSWORD, token, BASE_URL);

  if (res.status !== 200) {
    throw new Error(`Login fallido: ${res.status}`);
  }
  if (res.url.includes("/login")) {
    throw new Error("Login redirigió de vuelta a /login — credenciales incorrectas");
  }

  // Obtener el CSRF de sesión desde la página de stats (necesario en el POST body)
  const statsPage = http.get(`${BASE_URL}/stats`);
  const match = statsPage.body.match(/<meta[^>]+name="csrf-token"[^>]+content="([^"]+)"|<input[^>]+name="_token"[^>]+value="([^"]+)"/);
  if (!match) {
    throw new Error("No se encontró el _token CSRF en la página de stats");
  }
  const csrfToken = match[1] || match[2];

  const jar = http.cookieJar();
  const cookies = jar.cookiesForURL(BASE_URL);
  return { cookies, csrfToken };
}

export default function ({ cookies, csrfToken }) {
  const jar = http.cookieJar();
  for (const [name, values] of Object.entries(cookies)) {
    jar.set(BASE_URL, name, values[0]);
  }

  const res = postChartStage(BASE_URL, TIME, PROCESS_ID, csrfToken);

  check(res, {
    "status es 200": (r) => r.status === 200,
    "body no está vacío": (r) => r.body && r.body.length > 0,
  });
}

export function teardown() {}
