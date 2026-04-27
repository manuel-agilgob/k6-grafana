/**
 * index.js — Firel Signer
 *
 * Orchestrates the full Firel signing flow:
 *   1. Convert document to hex          (fileProcessor)
 *   2. Extract credentials from PFX     (pfxProcessor)
 *   3. Build the PKCS7 signed-data      (pkcs7Builder)
 *   4. Send to CREAR_EVIDENCIA_URL      (evidenceClient)
 *      └─ Returns the signed PDF in Base64
 *
 * Replaces: SeleccionarArchivo + firmar (electronicSignature.js)
 *           + the whole of cliente.js
 *           + signDocument() in Service.php / SignatureDocumentController.php
 *
 * Usage (CLI):
 *   node index.js <document> <cert.pfx> <password> <userName> [evidenceUrl]
 *
 * Usage (module):
 *   import { signDocument, signAndSubmit } from './index.js';
 */

import path from 'path';
import fs from 'fs';
import { processFileForSigning } from './src/fileProcessor.js';
import { extractCredentialsFromPfx } from './src/pfxProcessor.js';
import { buildPkcs7 } from './src/pkcs7Builder.js';
import { sendToEvidenceEndpoint } from './src/evidenceClient.js';

// ─── Step 1-3: local signing ────────────────────────────────────────────────

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

// ─── Step 1-4: sign + submit to evidence endpoint ───────────────────────────

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

// ─── CLI entry point ─────────────────────────────────────────────────────────

if (process.argv[1] === path.resolve('index.js')) {
  const [,, documentPath, pfxPath, password, userName, evidenceUrl] = process.argv;

  if (!documentPath || !pfxPath || !password) {
    console.error('Usage: node index.js <document> <cert.pfx> <password> [userName] [evidenceUrl]');
    process.exit(1);
  }

  const run = async () => {
    // Step 1-3: always sign locally
    const { pkcs7, fileName } = await signDocument(documentPath, pfxPath, password);
    console.log('✔ PKCS7 generated');
    console.log('  File name :', fileName);
    console.log('  PKCS7 (first 80 chars):', pkcs7.slice(0, 80) + '…');

    // Step 4: optionally submit to the evidence endpoint
    if (evidenceUrl && userName) {
      console.log(`\n  Sending to evidence endpoint…`);
      console.log(`  URL      : ${evidenceUrl}`);
      console.log(`  UserName : ${userName}`);

      const { pdfBase64 } = await signAndSubmit(documentPath, pfxPath, password, userName, evidenceUrl);

      // Save the resulting PDF locally for inspection
      const outFile = `signed_${fileName.replace(/^pkcs7_/, '').replace(/\.\w+$/, '.pdf')}`;
      fs.writeFileSync(outFile, Buffer.from(pdfBase64, 'base64'));

      console.log(`\n✔ Signed PDF received and saved as: ${outFile}`);
      console.log(`  PdfBase64 (first 60 chars): ${pdfBase64.slice(0, 60)}…`);
    } else {
      console.log('\n  (No evidenceUrl/userName provided — skipping endpoint submission)');
    }
  };

  run().catch((err) => {
    console.error('✘ Failed:', err.message);
    process.exit(1);
  });
}

