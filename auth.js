require('dotenv').config();

const axios = require("axios");
const { saveTokens, getTokens } = require("./tokenStore");
const querystring = require("querystring");

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const REDIRECT_URI = "http://localhost:4567/callback"; // your local callback
const SCOPES = "streaming user-read-playback-state user-modify-playback-state";

let codeVerifierGlobal = null;

// 1️⃣ Generate auth URL
function getAuthURL() {
 const { verifier, challenge } = require("./pkce").generatePKCE();
 codeVerifierGlobal = verifier;

 const params = querystring.stringify({
  response_type: "code",
  client_id: CLIENT_ID,
  scope: SCOPES,
  redirect_uri: REDIRECT_URI,
  code_challenge_method: "S256",
  code_challenge: challenge
 });

 return `https://accounts.spotify.com/authorize?${params}`;
}

// 2️⃣ Exchange code for token
async function exchangeCode(code) {
 const res = await axios.post(
  "https://accounts.spotify.com/api/token",
  querystring.stringify({
   grant_type: "authorization_code",
   code,
   redirect_uri: REDIRECT_URI,
   code_verifier: codeVerifierGlobal
  }),
  {
   headers: { "Content-Type": "application/x-www-form-urlencoded" }
  }
 );

 const expires_at = Date.now() + res.data.expires_in * 1000;

 await saveTokens({
  access_token: res.data.access_token,
  refresh_token: res.data.refresh_token,
  expires_at
 });

 return res.data.access_token;
}

// 3️⃣ Refresh token logic
async function getValidAccessToken() {
 const tokens = await getTokens();
 if (!tokens) return null;

 if (Date.now() < tokens.expires_at - 60_000) {
  return tokens.access_token;
 }

 const res = await axios.post(
  "https://accounts.spotify.com/api/token",
  querystring.stringify({
   grant_type: "refresh_token",
   refresh_token: tokens.refresh_token
  }),
  { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
 );

 const updated = {
  access_token: res.data.access_token,
  refresh_token: tokens.refresh_token,
  expires_at: Date.now() + res.data.expires_in * 1000
 };

 await saveTokens(updated);
 return updated.access_token;
}

module.exports = { getAuthURL, exchangeCode, getValidAccessToken };
