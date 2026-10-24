/**
 * Hashes a plaintext password using browser native Web Crypto SHA-256.
 * Ensures the plaintext password is never sent in the HTTP request payload.
 */
export async function hashClientPassword(plaintext) {
  if (!plaintext) return '';
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    return plaintext;
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
