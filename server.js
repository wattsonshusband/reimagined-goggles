require('dotenv').config();

const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = `https://${process.env.DOMAIN_NAME}/callback`;

// Step 1 – redirect user to Spotify
app.get("/login", (req, res) => {
 const scope = "streaming user-read-email user-read-private";
 const url =
  "https://accounts.spotify.com/authorize" +
  "?response_type=code" +
  `&client_id=${CLIENT_ID}` +
  `&scope=${encodeURIComponent(scope)}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

 res.redirect(url);
});

// Step 2 – Spotify redirects here
app.get("/callback", async (req, res) => {
 const code = req.query.code;

 const tokenRes = await axios.post(
  "https://accounts.spotify.com/api/token",
  {
   method: "POST",
   headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization:
     "Basic " +
     Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
   },
   body: new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
   }),
  }
 );

 const data = await tokenRes.json();

 // Send token back to Electron via custom protocol
 res.send(`
  <script>
   window.location.href =
    "myapp://callback?token=${data.access_token}";
  </script>
 `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
 console.log("Auth server running on port 3000");
});

