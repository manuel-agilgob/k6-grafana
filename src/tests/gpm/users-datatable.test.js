import http from "k6/http";
import { check } from "k6";
import { getCSRF } from "../../services/gpm-get-csrf.js";
import { login } from "../../services/gpm-login.js";
import { getUsersDatatable } from "../../services/gpm-users-datatable.service.js";
import { strategy as strategyConfig } from "./options.js";

const BASE_URL = __ENV.GPM_BASE_URL;
const DT_START = parseInt(__ENV.GPM_DT_START || "0");
const DT_LENGTH = parseInt(__ENV.GPM_DT_LENGTH || "10");
const DT_SEARCH = __ENV.GPM_DT_SEARCH || "";

export const options = { ...strategyConfig };

export function setup() {
  const token = getCSRF();
  const res = login(__ENV.GPM_USERNAME, __ENV.GPM_PASSWORD, token, BASE_URL);

  if (res.status !== 200) {
    throw new Error(`Login fallido: ${res.status}`);
  }
  if (res.url.includes("/login")) {
    throw new Error("Login redirigió de vuelta a /login — credenciales incorrectas");
  }

  const page = http.get(`${BASE_URL}/users`);
  const match = page.body.match(/<meta[^>]+name="csrf-token"[^>]+content="([^"]+)"|<input[^>]+name="_token"[^>]+value="([^"]+)"/);
  if (!match) {
    throw new Error("No se encontró el _token CSRF en la página de users");
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

  const res = getUsersDatatable(BASE_URL, csrfToken, DT_START, DT_LENGTH, DT_SEARCH);

  check(res, {
    "status es 200": (r) => r.status === 200,
    "body no está vacío": (r) => r.body && r.body.length > 0,
  });
}

export function teardown() {}
