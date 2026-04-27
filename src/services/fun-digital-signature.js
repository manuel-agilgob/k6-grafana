import path from 'path';
import fs from 'fs';
import { processFileForSigning } from './digital-signature-logic/fileProcessor.js';
import { extractCredentialsFromPfx } from './digital-signature-logic/pfxProcessor.js';
import { buildPkcs7 } from './digital-signature-logic/pkcs7Builder.js';
import { sendToEvidenceEndpoint } from './digital-signature-logic/evidenceClient.js';


/**
 * Signs a document using a Firel PFX certificate and returns the PKCS7.
 * Does NOT contact any remote endpoint.
 *
 * @param {string} documentPath - Path to the document to sign (PDF, DOCX…).
 * @param {string} pfxPath      - Path to the .pfx certificate file.
 * @param {string} password     - Password for the PFX.
 * @returns {Promise<{ pkcs7: string, fileName: string }>}
 */
export async function signDocument(documentPath, pfxPath, password) {
  const { hex, ext } = processFileForSigning(documentPath);
  const { privateKeyPem, certPEM } = extractCredentialsFromPfx(pfxPath, password);
  const pkcs7 = buildPkcs7(certPEM, privateKeyPem, hex);

  if (!pkcs7) {
    throw new Error('PKCS7 generation failed.');
  }

  return { pkcs7, fileName: `pkcs7_${Date.now()}.${ext}` };
}



/**
 * Full pipeline: signs the document and sends it to CREAR_EVIDENCIA_URL.
 * Returns the signed PDF as a Base64 string (PdfBase64).
 *
 * @param {string} documentPath  - Path to the document to sign.
 * @param {string} pfxPath       - Path to the .pfx certificate file.
 * @param {string} password      - Password for the PFX.
 * @param {string} userName      - Full name of the signer (used by the evidence service).
 * @param {string} evidenceUrl   - Full URL of CREAR_EVIDENCIA_URL.
 * @returns {Promise<{ pdfBase64: string, fileName: string }>}
 */
export async function signAndSubmit(documentPath, pfxPath, password, userName, evidenceUrl) {
  const { pkcs7, fileName } = await signDocument(documentPath, pfxPath, password);

  const pdfBase64 = await sendToEvidenceEndpoint({
    endpointUrl: evidenceUrl,
    pkcs7,
    fileName,
    userName,
  });

  return { pdfBase64, fileName };
}