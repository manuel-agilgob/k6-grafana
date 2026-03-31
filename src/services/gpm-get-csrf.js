import http from "k6/http";

export function getCSRF() {
  const baseUrl = __ENV.GPM_BASE_URL;
  if (!baseUrl) throw new Error("GPM_BASE_URL no está definida");

  const res = http.get(baseUrl);
  const match = res.body.match(/<input[^>]+name="_token"[^>]+value="([^"]+)"/);
  if (!match) throw new Error("No se encontró el _token CSRF en el DOM");

  return match[1];
}