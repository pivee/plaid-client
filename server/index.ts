import axios from "axios";
import * as bodyParser from "body-parser";
import cors from "cors";
import * as dotenv from "dotenv";
import express from "express";
import morgan from "morgan";

dotenv.config();

const plaidUrl = "https://sandbox.plaid.com";

const app = express();
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());
app.use(morgan("dev"));

app.get("/", function (request, response) {
  response.json({ message: "Hello World!" });
});

app.post("/create-link-token", async function (request, response) {
  const plaidResponse = await axios.post(
    [plaidUrl, "/link/token/create"].join("/"),
    {
      "client_id": process.env.PLAID_CLIENT_ID,
      "secret": process.env.PLAID_CLIENT_SECRET,
      "client_name": "Ferry",
      "user": { "client_user_id": process.env.PLAID_UNIQUE_USER_ID },
      "products": ["assets", "auth", "identity"],
      "country_codes": ["US"],
      "language": "en",
      "webhook": "https://webhook.example.com",
      // "redirect_uri": process.env.PLAID_REDIRECT_URI
      "redirect_uri": "https://useferry.retool.com/editor/eb69866e-b538-11ee-9ce9-d71eab21d3e1/Sandbox%20-%20Plaid%20Integration"
    }
  );

  response.json({ link_token: plaidResponse.data?.link_token });
});

app.post("/create-processor-token", async function (request, response) {
  console.log("✅ Exchange token");

  console.log(request.body);

  const publicToken = request.body?.public_token;
  const accountId = request.body?.accounts[0]?.id;

  try {
    const accessTokenResponse = await axios.post(
      [plaidUrl, "/item/public_token/exchange"].join("/"),
      {
        "client_id": process.env.PLAID_CLIENT_ID,
        "secret": process.env.PLAID_CLIENT_SECRET,
        "public_token": publicToken
      }
    );

    // Get access_token from public_token

    const processorTokenRequestBody = {
      "client_id": process.env.PLAID_CLIENT_ID,
      "secret": process.env.PLAID_CLIENT_SECRET,
      "access_token": accessTokenResponse.data?.access_token,
      "account_id": accountId,
      "processor": "highnote"
    };

    console.log(processorTokenRequestBody);

    const processorTokenResponse = await axios.post(
      [plaidUrl, "/processor/token/create"].join("/"),
      processorTokenRequestBody
    );

    response.json({ processorTokenResponse: processorTokenResponse.data });
  } catch (error) {
    console.error(error);
    response.sendStatus(500);
  }
});

app.listen(4000, function () { console.log("🚀 Server is running..."); });