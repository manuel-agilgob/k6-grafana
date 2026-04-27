#!/usr/bin/env node
/**
 * generate-pkcs7.js
 *
 * Pre-paso para la prueba de k6 de firma digital.
 * Genera el PKCS7 una sola vez con Node.js (usando node-forge y jsrsasign)
 * y lo guarda en un JSON temporal para que k6 lo consuma con open().
 *
 * Uso:
 *   node src/scripts/generate-pkcs7.js <documentPath> <pfxPath> <pfxPassword> <outputJson>
 *
 * Variables de entorno (alternativa a argumentos):
 *   DOCUMENT_PATH  FIREL_FILE  FIREL_PASSWORD  PKCS7_OUTPUT
 */

import { signDocument } from '../services/fun-digital-signature.js';
import fs from 'fs';
import path from 'path';

const documentPath = process.argv[2] || process.env.DOCUMENT_PATH;
const pfxPath      = process.argv[3] || process.env.FIREL_FILE;
const password     = process.argv[4] || process.env.FIREL_PASSWORD;
const outputPath   = process.argv[5] || process.env.PKCS7_OUTPUT || '.tmp/pkcs7.json';

if (!documentPath || !pfxPath || !password) {
    console.error(documentPath, pfxPath, password)
  console.error('Uso: node generate-pkcs7.js <documentPath> <pfxPath> <pfxPassword> [outputJson]');
  console.error('  o bien, define DOCUMENT_PATH, FIREL_FILE y FIREL_PASSWORD como variables de entorno.');
  process.exit(1);
}

(async () => {
  try {
    console.log(`Firmando: ${path.resolve(documentPath)}`);
    const { pkcs7, fileName } = await signDocument(documentPath, pfxPath, password);

    const outputDir = path.dirname(path.resolve(outputPath));
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(path.resolve(outputPath), JSON.stringify({ pkcs7, fileName }, null, 2));
    console.log(`PKCS7 guardado en: ${path.resolve(outputPath)}`);
  } catch (err) {
    console.error(`Error al generar PKCS7: ${err.message}`);
    process.exit(1);
  }
})();
