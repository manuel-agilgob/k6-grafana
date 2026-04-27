import { sleep } from 'k6';
import { login } from '../../services/functionary_login.js';
import { getPendingSignatures } from '../../services/functionary.service.js';
import {
  buildFunctionaryEvidencePayload,
  convertFunctionaryDocumentToHex,
  extractFunctionaryDocumentForSigning,
  splitFunctionarySignatures,
  submitFunctionaryDigitalSignature,
} from '../../services/fun-digital-signature.service.js';

const BASE_URL = __ENV.BASE_URL;
const USERS = JSON.parse(__ENV.USERS || '[]');
const FUNCTIONARY_DIGITAL_SIGNATURE_URL = __ENV.FUNCTIONARY_DIGITAL_SIGNATURE_URL || '';
const FUNCTIONARY_SIGNER_NAME = __ENV.FUNCTIONARY_SIGNER_NAME || 'Funcionario K6';
const FUNCTIONARY_PKCS7_SAMPLE = __ENV.FUNCTIONARY_PKCS7_SAMPLE || '';

export const options = {
  vus: Number(__ENV.VUS || 1),
  duration: __ENV.DURATION || '1m',
};

export function setup() {
  if (!BASE_URL) {
    throw new Error('BASE_URL es requerido para la prueba de firma digital.');
  }

  if (!Array.isArray(USERS) || USERS.length === 0) {
    throw new Error('USERS debe incluir al menos un usuario funcionario.');
  }

  const user = USERS[0];
  const authResponse = login(BASE_URL, user.email, user.password);

  if (authResponse.status !== 200) {
    throw new Error(`No fue posible autenticar al usuario ${user.email}. Status: ${authResponse.status}`);
  }

  const jwt = authResponse.json('data.jwt');

  return {
    jwt,
    userName: user.name || FUNCTIONARY_SIGNER_NAME,
  };
}

export default function (data) {
  const headers = {
    Accept: 'application/json, text/plain, */*',
    Authorization: data.jwt,
    'Content-Type': 'application/json',
  };

  const pendingSignaturesResponse = getPendingSignatures(BASE_URL, headers, 10);
  const pendingDocument = extractFunctionaryDocumentForSigning(pendingSignaturesResponse);

  let pkcs7Original = FUNCTIONARY_PKCS7_SAMPLE || pendingDocument?.pkcs7Original || '';

  if (!pkcs7Original && pendingDocument?.documentBase64) {
    const documentHex = convertFunctionaryDocumentToHex(pendingDocument.documentBase64);
    const hexParts = splitFunctionarySignatures(documentHex, 4096);
    pkcs7Original = hexParts.join('');
  }

  if (!pkcs7Original) {
    console.warn('No hay PKCS7 disponible. Define FUNCTIONARY_PKCS7_SAMPLE o valida la respuesta de pendientes.');
    sleep(1);
    return;
  }

  if (!FUNCTIONARY_DIGITAL_SIGNATURE_URL) {
    console.warn('FUNCTIONARY_DIGITAL_SIGNATURE_URL no está configurada; se omite el POST de firma digital.');
    sleep(1);
    return;
  }

  const payload = buildFunctionaryEvidencePayload({
    pkcs7Original,
    fileName: pendingDocument?.fileName,
    userName: pendingDocument?.userName || data.userName,
  });

  submitFunctionaryDigitalSignature(FUNCTIONARY_DIGITAL_SIGNATURE_URL, payload);
  sleep(1);
}
