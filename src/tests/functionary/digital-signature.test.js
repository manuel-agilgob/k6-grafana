
/**
 * Digital Signature — Performance Test
 *
 * Flujo de dos pasos:
 *   1. PRE-PASO (Node.js, fuera de k6):
 *      node src/scripts/generate-pkcs7.js → genera .tmp/pkcs7.json
 *      (Usa node-forge + jsrsasign que k6 no soporta directamente)
 *
 *   2. K6:
 *      setup()   → lee .tmp/pkcs7.json con open() y lo retorna a los VUs
 *      default() → envía el mismo PKCS7 al endpoint N veces
 *
 * Variables de entorno requeridas:
 *   CREATE_EVIDENCE_URL – URL completa del endpoint CREAR_EVIDENCIA
 *   USER_NAME           – nombre completo del firmante
 *   PKCS7_OUTPUT        – (opcional) ruta del JSON pre-generado, default: .tmp/pkcs7.json
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

const EVIDENCE_URL   = __ENV.CREATE_EVIDENCE_URL;
const USER_NAME      = __ENV.USER_NAME;
const PKCS7_JSON     = __ENV.PKCS7_OUTPUT || '.tmp/pkcs7.json';

// ── Init context: carga el JSON pre-generado por generate-pkcs7.js ───────────
const signedData = JSON.parse(open(PKCS7_JSON));
// ─────────────────────────────────────────────────────────────────────────────

export const options = {
//   stages: [
//     { duration: '20m', target: 75 },
//   ],
  thresholds: {
    'http_req_duration{endpoint:digital_signature}': ['p(95)<5000'],
    'http_req_failed{endpoint:digital_signature}':   ['rate<0.01'],
  },
};

// ── Setup: valida y distribuye el PKCS7 a los VUs ────────────────────────────

export function setup() {
  if (!signedData.pkcs7 || !signedData.fileName) {
    throw new Error(`JSON inválido en ${PKCS7_JSON}. Ejecuta primero: node src/scripts/generate-pkcs7.js`);
  }

  console.log(`PKCS7 cargado correctamente (fileName: ${signedData.fileName})`);
  console.log(`Primeros 80 chars: ${signedData.pkcs7.slice(0, 80)}…`);

  return { pkcs7: signedData.pkcs7, fileName: signedData.fileName };
}

// ── Default: envía el mismo PKCS7 al endpoint N veces ────────────────────────

export default function ({ pkcs7, fileName }) {
  const payload = JSON.stringify({
    CertificateType: 3,       // 3 = Firel  (CERTIFICATE_TYPE de evidenceClient.js)
    Pkcs7Original:  pkcs7,
    FileName:       fileName,
    UserName:       USER_NAME,
  });

  const res = http.post(
    EVIDENCE_URL,
    payload,
    {
      headers: { 'Content-Type': 'application/json' },
      tags:    { endpoint: 'digital_signature' },
    }
  );

  console.log(res.body);

  check(res, {
    'firma digital: status 200':            (r) => r.status === 200,
    'firma digital: IsSuccess true':        (r) => {
      try { return r.json('IsSuccess') === true; }
      catch { return false; }
    },
    'firma digital: PdfBase64 no vacío':    (r) => {
      try {
        const pdf = r.json('PdfBase64');
        return typeof pdf === 'string' && pdf.length > 0;
      } catch { return false; }
    },
    'firma digital: tiempo respuesta < 5s': (r) => r.timings.duration < 5000,
  });

  sleep(1);
}

