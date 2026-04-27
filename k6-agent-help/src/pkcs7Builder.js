/**
 * pkcs7Builder.js
 *
 * Replaces: CreatePKCS7 + RemoveCMSHeader (cliente.js)
 *
 * Builds a detached CMS/PKCS7 signed-data structure using jsrsasign,
 * with SHA256withRSA and a SigningTime signed attribute — identical to
 * what the browser implementation produces.
 */

import pkg from 'jsrsasign';
const { asn1 } = pkg;

/**
 * Creates a PKCS7 signed-data structure and returns it as a bare
 * Base64 string (no PEM headers).
 *
 * @param {string} certPEM     - Signer certificate in PEM format.
 * @param {string} privateKeyPEM - Private key in PEM format.
 * @param {string} hexContent  - Document content as a hex string.
 * @returns {string} Base64 PKCS7 without CMS headers.
 */
export function buildPkcs7(certPEM, privateKeyPEM, hexContent) {
  const param = {
    content: { hex: hexContent },
    certs: [certPEM],
    signerInfos: [
      {
        hashAlg: 'sha256',
        sAttr: {
          SigningTime: {},
        },
        signerCert: certPEM,
        sigAlg: 'SHA256withRSA',
        signerPrvKey: privateKeyPEM,
      },
    ],
  };

  const signedData = asn1.cms.CMSUtil.newSignedData(param);
  const pem = signedData.getPEM();

  return removeCmsHeaders(pem);
}

/**
 * Strips the CMS PEM headers and all line breaks, leaving a flat Base64 string.
 * Equivalent to RemoveCMSHeader(cms) in cliente.js.
 * @param {string} cms - Full PEM string with CMS headers.
 * @returns {string}
 */
function removeCmsHeaders(cms) {
  return cms
    .replace('-----BEGIN CMS-----', '')
    .replace('-----END CMS-----', '')
    .replace(/(\r\n|\n|\r)/gm, '');
}
