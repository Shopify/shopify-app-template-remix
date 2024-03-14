import crypto from 'crypto';
import ecKeyUtils from 'eckey-utils';

const PRIVATE_KEY = '<PRIVATE_KEY_PEM>';

const EC_CURVE = 'prime256v1';
const CIPHER = 'aes-256-ctr';
const CIPHER_LENGTH = crypto.getCipherInfo(CIPHER)?.keyLength || 0;

const MAC_DIGEST = 'sha256';
const MAC_LENGTH = crypto.createHash(MAC_DIGEST).digest().length / 2;

/**
 * Decrypts ECIES credit card payload from Shopify
 * @param {*} encryptedPayload
 */
const decryptCreditCardPayload = ({ encryptedMessage, ephemeralPublicKey, tag }) => {
  console.log('[ECIES] Beginning decryption...');
  const ciphertext = decodeBase64(encryptedMessage);
  const mac = decodeBase64(tag);

  const sharedSecret = computeSharedSecret(ephemeralPublicKey);
  const keyPair = crypto.hkdfSync(MAC_DIGEST, sharedSecret, '', '', CIPHER_LENGTH + MAC_LENGTH);
  const cipherKey = Buffer.from(keyPair.slice(0, CIPHER_LENGTH));
  const computedMac = computeMac(keyPair, ciphertext);

  if (!crypto.timingSafeEqual(computedMac, mac)) throw new Error('Invalid Message Authenticaton Code');

  const result = decryptCipher(cipherKey, ciphertext);
  console.log(`[ECIES] Decryption complete.`);
  return JSON.parse(result);
}

// Decode a base64 encoded string
const decodeBase64 = (encoded) => {
  return Buffer.from(encoded, 'base64');
}

// Compute the shared secret using the `ephemeralPublicKey`
const computeSharedSecret = (ephemeralPublicKey) => {
  console.log('[ECIES] Creating keys...');
  const ecdh = crypto.createECDH(EC_CURVE);

  const privateKey = ecKeyUtils.parsePem(PRIVATE_KEY).privateKey;
  ecdh.setPrivateKey(privateKey);
  const publicKey = ecKeyUtils.parsePem(ephemeralPublicKey).publicKey;

  return ecdh.computeSecret(publicKey);
}

// Compute the hmac of decoded `encryptedMessage` to ensure it matches the decoded value of `tag`
const computeMac = (keyPair, ciphertext) => {
  console.log('[ECIES] Computing HMAC...');
  const hmacKey = Buffer.from(keyPair.slice(CIPHER_LENGTH, MAC_LENGTH + CIPHER_LENGTH));

  const hmac = crypto.createHmac(MAC_DIGEST, hmacKey);
  hmac.update(ciphertext);
  return hmac.digest().subarray(0, MAC_LENGTH);
}

// Decrypt the ciphertext using the key
const decryptCipher = (cipherKey, ciphertext) => {
  console.log('[ECIES] Decrypting...');
  const iv = Buffer.alloc(16, 0);
  const decipher = crypto.createCipheriv(CIPHER, cipherKey, iv);
  return decipher.update(ciphertext.toString('hex'), 'hex', 'utf8') + decipher.final('utf8');
}

export default decryptCreditCardPayload;
