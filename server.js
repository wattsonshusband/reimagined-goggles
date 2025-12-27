require('dotenv').config();

const express = require('express');
const axios = require('axios');
const redis = require('./redis.js');
const { generate_session_id, sign_payload } = require('./crypto.js');
const { create_spotify_client } = require('./spotify.js');

const app = express();
app.use(express.json());

app.post("/session", async (_, res) => {
 const sessionId = generate_session_id();

 await redis.set(
  `oauth:${sessionId}`,
  JSON.stringify({ status: "pending" }),
  "EX",
  300
 );

 res.json({ sessionId });
});

app.get("/login", (req, res) => {
 const { sessionId } = req.query;

 const scopes = [
  "user-read-email",
  "user-read-private",
  "streaming"
 ];

 const spotifyApi = create_spotify_client();

 const authorizeURL = spotifyApi.createAuthorizeURL(
  scopes,
  sessionId // ← state parameter
 );

 res.redirect(authorizeURL);
});

app.get("/callback", async (req, res) => {
 const { code, state: sessionId } = req.query;

 const spotifyApi = create_spotify_client();

 try {
  const data = await spotifyApi.authorizationCodeGrant(code);

  const accessToken = data.body.access_token;
  const refreshToken = data.body.refresh_token;
  const expiresIn = data.body.expires_in;

  await redis.set(
   `oauth:${sessionId}`,
   JSON.stringify({
    status: "complete",
    accessToken,
    refreshToken,
    expiresAt: Date.now() + expiresIn * 1000
   }),
   "EX",
   300
  );

  res.send("<h3>Login complete. You may close this window.</h3>");
 } catch (err) {
  console.error("Spotify auth error", err);
  res.status(500).send("Authentication failed");
 }
});

app.get("/session/:id", async (req, res) => {
 const raw = await redis.get(`oauth:${req.params.id}`);
 if (!raw) return res.status(404).end();

 const session = JSON.parse(raw);

 const payload = {
  status: session.status,
  accessToken: session.accessToken ?? null
 };

 res.json({
  payload,
  signature: sign_payload(payload)
 });
});

app.delete("/session/:id", async (req, res) => {
 await redis.del(`oauth:${req.params.id}`);
 res.sendStatus(204);
});