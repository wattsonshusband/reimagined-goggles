const crypto = require("crypto");

function base64url(buffer) {
 return buffer
  .toString("base64")
  .replace(/\+/g, "-")
  .replace(/\//g, "_")
  .replace(/=+$/, "");
}

function generatePKCE() {
 const verifier = base64url(crypto.randomBytes(32));
 const challenge = base64url(
  crypto.createHash("sha256").update(verifier).digest()
 );
 return { verifier, challenge };
}

module.exports = { generatePKCE };
