import express from "express";
import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();

app.get("/", function (request, response) {
  response.json({ message: "Hello World!" });
});

app.post("/create-link-token", async function (request, response) {
  const plaidResponse = await axios.post(
    "https://sandbox.plaid.com/link/token/create",
    {
      "client_id": process.env.PLAID_CLIENT_ID,
      "secret": process.env.PLAID_CLIENT_SECRET,
      "client_name": "Ferry",
      "user": { "client_user_id": process.env.PLAID_UNIQUE_USER_ID },
      "products": ["assets", "auth", "identity"],
      "country_codes": ["US"],
      "language": "en",
      "webhook": "https://webhook.example.com",
      "redirect_uri": process.env.PLAID_REDIRECT_URI
    }
  );

  response.json({ link_token: plaidResponse.data?.link_token });
});

app.listen(4000, function () { console.log("🚀 Server is running..."); });