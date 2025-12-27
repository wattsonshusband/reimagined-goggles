const SpotifyWebApi = require('spotify-web-api-node');

function create_spotify_client() {
 return new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI
 });
}

async function refresh_access_token(refreshToken) {
 const spotifyApi = create_spotify_client();
 spotifyApi.setRefreshToken(refreshToken);

 const data = await spotifyApi.refreshAccessToken();

 return {
  accessToken: data.body.access_token,
  expiresIn: data.body.expires_in
 };
}

module.exports = { create_spotify_client, refresh_access_token }