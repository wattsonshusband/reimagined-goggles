const keytar = require("keytar");

const SERVICE = "electron-spotify";
const ACCOUNT = "user";

async function saveTokens(tokens) {
 // tokens: { access_token, refresh_token, expires_at }
 await keytar.setPassword(SERVICE, ACCOUNT, JSON.stringify(tokens));
}

async function getTokens() {
 const raw = await keytar.getPassword(SERVICE, ACCOUNT);
 return raw ? JSON.parse(raw) : null;
}

async function clearTokens() {
 await keytar.deletePassword(SERVICE, ACCOUNT);
}

module.exports = { saveTokens, getTokens, clearTokens };
