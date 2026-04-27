/**
 * pfxProcessor.js
 *
 * Replaces: OpenPfx + validaPassword (cliente.js)
 *
 * Reads a PFX file from disk, validates the password, and extracts
 * the private key and certificate in PEM format using node-forge.
 */

import fs from 'fs';
import path from 'path';
import forge from 'node-forge';

/**
 * Reads a PFX file and extracts the private key + certificate PEMs.
 * @param {string} pfxPath - Absolute or relative path to the .pfx file.
 * @param {string} password - Password to unlock the PFX.
 * @returns {{ privateKeyPem: string, certPEM: string }}
 * @throws If the file is not found, is not a PFX, or the password is wrong.
 */
export function extractCredentialsFromPfx(pfxPath, password) {
  const resolvedPath = path.resolve(pfxPath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`PFX file not found: ${resolvedPath}`);
  }

  const ext = path.extname(resolvedPath).replace('.', '').toLowerCase();
  if (ext !== 'pfx') {
    throw new Error(`Expected a .pfx file, got ".${ext}"`);
  }

  const buffer = fs.readFileSync(resolvedPath);

  // Equivalent to: forge.util.binary.raw.encode(new Uint8Array(bufferFile))
  const pkcs12Der = forge.util.binary.raw.encode(new Uint8Array(buffer));
  const p12Asn1 = forge.asn1.fromDer(pkcs12Der);

  const p12 = parseP12WithPassword(p12Asn1, password);

  const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
  const pkeyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });

  const certBag = certBags[forge.pki.oids.certBag][0];
  const keyBag = pkeyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0];

  const privateKeyPem = forge.pki.privateKeyToPem(keyBag.key).replace(/\r\n/g, '\n');
  const certPEM = forge.pki.certificateToPem(certBag.cert).replace(/\r\n/g, '\n');

  return { privateKeyPem, certPEM };
}

/**
 * Parses a PKCS12 ASN1 structure with the given password.
 * Equivalent to validaPassword(p12Asn1, password) in cliente.js.
 * @param {forge.asn1.Asn1} p12Asn1
 * @param {string} password
 * @returns {forge.pkcs12.Pkcs12Pfx}
 * @throws If the password is incorrect or the file is malformed.
 */
function parseP12WithPassword(p12Asn1, password) {
  try {
    return forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);
  } catch {
    throw new Error('Wrong PFX password or corrupted file.');
  }
}
