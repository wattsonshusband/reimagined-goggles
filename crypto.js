const crypto = require('crypto');

function generate_session_id() {
 return crypto.randomBytes(32).toString("hex");
}

function sign_payload(payload) {
 return crypto
  .createHmac("sha256", process.env.SESSION_HMAC_SECRET)
  .update(JSON.stringify(payload))
  .digest("hex");
}

module.exports = {
 generate_session_id,
 sign_payload
} 
