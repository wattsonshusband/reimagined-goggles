const express = require("express");
const { exchangeCode } = require("./auth");
const app = express();

app.get("/callback", async (req, res) => {
 const code = req.query.code;
 if (!code) return res.send("No code returned");

 try {
  const token = await exchangeCode(code);
  res.send("Spotify authorization successful! You can close this window.");
  console.log("Access token saved:", token);
 } catch (err) {
  console.error(err);
  res.send("Failed to get token");
 }
});

app.listen(4567, () => console.log("Auth server running on port 4567"));
