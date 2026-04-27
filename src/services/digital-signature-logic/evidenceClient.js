/**
 * evidenceClient.js
 *
 * Sends a PKCS7 to the CREAR_EVIDENCIA_URL endpoint and returns
 * the signed document as a Base64 string.
 *
 * Mirrors the private signDocument() method found in:
 *   - web/src/app/Helpers/Service.php
 *   - web/src/app/Http/Controllers/api/v1/SignatureDocumentController.php
 *
 * Endpoint contract:
 *   POST CREAR_EVIDENCIA_URL
 *   Body (JSON):
 *     {
 *       "CertificateType": 3,          // 3 = Firel
 *       "Pkcs7Original":  "<base64>",  // bare PKCS7 string
 *       "FileName":       "<string>",  // e.g. "pkcs7_1714234567890.pdf"
 *       "UserName":       "<string>",  // signer full name
 *     }
 *   Response (JSON):
 *     { "PdfBase64": "<base64 PDF>" }
 */

// CertificateType values found across the codebase
export const CERTIFICATE_TYPE = {
  FIREL: 3,
};

/**
 * Sends the PKCS7 to the evidence endpoint and returns the signed PDF in Base64.
 *
 * @param {object} options
 * @param {string} options.endpointUrl  - Full URL of CREAR_EVIDENCIA_URL.
 * @param {string} options.pkcs7        - Bare Base64 PKCS7 string.
 * @param {string} options.fileName     - Suggested filename (e.g. "pkcs7_xxx.pdf").
 * @param {string} options.userName     - Full name of the signer.
 * @param {number} [options.certificateType=CERTIFICATE_TYPE.FIREL] - Certificate type.
 * @returns {Promise<string>} Signed document as Base64.
 * @throws If the request fails or PdfBase64 is absent in the response.
 */
export async function sendToEvidenceEndpoint({
  endpointUrl,
  pkcs7,
  fileName,
  userName,
  certificateType = CERTIFICATE_TYPE.FIREL,
}) {
  const body = JSON.stringify({
    CertificateType: certificateType,
    Pkcs7Original: pkcs7,
    FileName: fileName,
    UserName: userName,
  });

  let response;
  try {
    response = await fetch(endpointUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
  } catch (networkError) {
    throw new Error(`Network error reaching evidence endpoint: ${networkError.message}`);
  }

  if (!response.ok) {
    throw new Error(`Evidence endpoint responded with HTTP ${response.status}: ${response.statusText}`);
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error('Evidence endpoint returned a non-JSON response.');
  }

  if (!result.PdfBase64) {
    throw new Error(`Evidence endpoint did not return PdfBase64. Response: ${JSON.stringify(result)}`);
  }

  return result.PdfBase64;
}
