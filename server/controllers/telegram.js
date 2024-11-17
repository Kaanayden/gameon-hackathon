
import crypto from "crypto";

export const verifyTelegramWebAppData = (req, res) => {
    console.log(req.body);
    const telegramInitData = req.body.telegramInitData;
    console.log(telegramInitData);
    // The data is a query string, which is composed of a series of field-value pairs.
    const encoded = decodeURIComponent(telegramInitData);
  
    // HMAC-SHA-256 signature of the bot's token with the constant string WebAppData used as a key.
    const secret = crypto.createHmac("sha256", "WebAppData").update(process.env.TELEGRAM_BOT_TOKEN);
  
    // Data-check-string is a chain of all received fields'.
    const arr = encoded.split("&");
    const hashIndex = arr.findIndex((str) => str.startsWith("hash="));
    const hash = arr.splice(hashIndex)[0].split("=")[1];
    // Sorted alphabetically
    arr.sort((a, b) => a.localeCompare(b));
    // In the format key=<value> with a line feed character ('\n', 0x0A) used as separator
    // e.g., 'auth_date=<auth_date>\nquery_id=<query_id>\nuser=<user>
    const dataCheckString = arr.join("\n");
  
    // The hexadecimal representation of the HMAC-SHA-256 signature of the data-check-string with the secret key
    const _hash = crypto
      .createHmac("sha256", secret.digest())
      .update(dataCheckString)
      .digest("hex");
  
    // If hash is equal, the data may be used on your server.
    // Complex data types are represented as JSON-serialized objects.
    if(_hash === hash) {
        res.status(200).send("Success");
    } else {
        res.status(400).send("Failed");
    }
  };