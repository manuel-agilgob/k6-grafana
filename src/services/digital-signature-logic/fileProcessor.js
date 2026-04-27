/**
 * fileProcessor.js
 *
 * Replaces: SelectFileSign + ConvertToHex (cliente.js)
 *
 * Reads a file from disk and converts its binary content to a
 * hexadecimal string — the format expected by the PKCS7 builder.
 */

import fs from 'fs';
import path from 'path';

const SUPPORTED_EXTENSIONS = ['pdf', 'docx', 'doc', 'xml'];

/**
 * Reads a file and returns its content as a hex string.
 * @param {string} filePath - Absolute or relative path to the file.
 * @returns {{ hex: string, ext: string }} Hex content and file extension.
 */
export function processFileForSigning(filePath) {
  const resolvedPath = path.resolve(filePath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`File not found: ${resolvedPath}`);
  }

  const ext = path.extname(resolvedPath).replace('.', '').toLowerCase();

  if (!SUPPORTED_EXTENSIONS.includes(ext)) {
    throw new Error(`Unsupported file type ".${ext}". Supported: ${SUPPORTED_EXTENSIONS.join(', ')}`);
  }

  const buffer = fs.readFileSync(resolvedPath);
  const hex = bufferToHex(buffer);

  if (!hex) {
    throw new Error('File is empty or could not be converted to hex.');
  }

  return { hex, ext };
}

/**
 * Converts a Node.js Buffer to a hexadecimal string.
 * Equivalent to ConvertToHex(arrayBuffer) in cliente.js.
 * @param {Buffer} buffer
 * @returns {string}
 */
function bufferToHex(buffer) {
  const hexOctets = [];
  for (let i = 0; i < buffer.length; i++) {
    hexOctets.push(buffer[i].toString(16).padStart(2, '0'));
  }
  return hexOctets.join('');
}
