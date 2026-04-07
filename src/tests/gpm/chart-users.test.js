import http from "k6/http";
import { check } from "k6";
import { getCSRF } from "../../services/gpm-get-csrf.js";
import { login } from "../../services/gpm-login.js";
import { getChartUsers } from "../../services/gpm-chart-users.service.js";

const BASE_URL = __ENV.GPM_BASE_URL;
const TIME = __ENV.GPM_TIME || "";

export const options = {
  vus: 1,
  iterations: 100,
};

export function setup() {
  const token = getCSRF();
  const res = login(__ENV.GPM_USERNAME, __ENV.GPM_PASSWORD, token, BASE_URL);

  if (res.status !== 200) {
    throw new Error(`Login fallido: ${res.status}`);
  }
  if (res.url.includes("/login")) {
    throw new Error("Login redirigió de vuelta a /login — credenciales incorrectas");
  }

  const jar = http.cookieJar();
  const cookies = jar.cookiesForURL(BASE_URL);
  return { cookies };
}

export default function ({ cookies }) {
  const jar = http.cookieJar();
  for (const [name, values] of Object.entries(cookies)) {
    jar.set(BASE_URL, name, values[0]);
  }

  const res = getChartUsers(BASE_URL, TIME);

  check(res, {
    "status es 200": (r) => r.status === 200,
    "body no está vacío": (r) => r.body && r.body.length > 0,
  });
}

export function teardown() {}
