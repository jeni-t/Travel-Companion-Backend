const axios = require("axios");

let accessToken = null;
let tokenExpiry = null;

const ensureAccessToken = async () => {
  const now = Date.now();

  if (accessToken && tokenExpiry && now < tokenExpiry) {
    return accessToken;
  }

  const { data } = await axios.post(
    "https://test.api.amadeus.com/v1/security/oauth2/token",
    new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.AMADEUS_API_KEY,
      client_secret: process.env.AMADEUS_API_SECRET,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  accessToken = data.access_token;
  tokenExpiry = now + data.expires_in * 1000;

  return accessToken;
};

module.exports = { ensureAccessToken };

