import http from 'k6/http';
import { check } from 'k6';

const FUNCTIONARY_CERTIFICATE_TYPE = 3;

function normalizeBase64(input) {
  if (!input) {
    return '';
  }

  return String(input).replace(/\s+/g, '');
}

export function convertFunctionaryDocumentToHex(base64Document) {
  const normalized = normalizeBase64(base64Document);

  if (!normalized) {
    throw new Error('No se recibió contenido Base64 para convertir a hexadecimal.');
  }

  const binary = atob(normalized);
  let hex = '';

  for (let i = 0; i < binary.length; i += 1) {
    hex += binary.charCodeAt(i).toString(16).padStart(2, '0');
  }

  return hex;
}

export function splitFunctionarySignatures(pkcs7, chunkSize = 3500) {
  const normalized = normalizeBase64(pkcs7);

  if (!normalized) {
    return [];
  }

  const chunks = [];
  for (let i = 0; i < normalized.length; i += chunkSize) {
    chunks.push(normalized.slice(i, i + chunkSize));
  }

  return chunks;
}

export function buildFunctionaryEvidencePayload({
  pkcs7Original,
  fileName,
  userName,
  certificateType = FUNCTIONARY_CERTIFICATE_TYPE,
}) {
  return {
    CertificateType: certificateType,
    Pkcs7Original: normalizeBase64(pkcs7Original),
    FileName: fileName || `pkcs7_${Date.now()}.pdf`,
    UserName: userName || 'Funcionario K6',
  };
}

export function extractFunctionaryDocumentForSigning(pendingSignaturesResponse) {
  if (!pendingSignaturesResponse || pendingSignaturesResponse.status !== 200) {
    return null;
  }

  try {
    const signatureDocuments = pendingSignaturesResponse.json('data.signatureDocuments') || [];

    if (!Array.isArray(signatureDocuments) || signatureDocuments.length === 0) {
      return null;
    }

    const firstDocument = signatureDocuments[0];

    return {
      id: firstDocument.id,
      fileName: firstDocument.fileName || firstDocument.filename,
      userName: firstDocument.userName || firstDocument.user_name,
      pkcs7Original: firstDocument.pkcs7Original || firstDocument.pkcs7,
      documentBase64:
        firstDocument.documentBase64 || firstDocument.base64 || firstDocument.fileBase64,
    };
  } catch (error) {
    console.error(`No fue posible interpretar el documento pendiente: ${error.message}`);
    return null;
  }
}

export function submitFunctionaryDigitalSignature(signatureUrl, payload, additionalHeaders = {}) {
  const response = http.post(signatureUrl, JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...additionalHeaders,
    },
    tags: { name: 'functionary_digital_signature', endpoint: 'functionary_signature' },
  });

  check(response, {
    'firma digital: status 200': (r) => r.status === 200,
    'firma digital: contiene PdfBase64': (r) => {
      try {
        return !!r.json('PdfBase64');
      } catch {
        return false;
      }
    },
  });

  return response;
}
