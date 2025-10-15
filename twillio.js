import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;
console.log("Twilio SID:", accountSid);
console.log("Twilio Token loaded:", !!authToken);
console.log("Twilio Number:", fromNumber);

if (!accountSid || !authToken || !fromNumber) {
  throw new Error("Twilio credentials are missing in .env");
}

const client = twilio(accountSid, authToken);

// ✅ Utility function to send SMS
export const sendSMS = async (to, message) => {
  try {
    const sms = await client.messages.create({
      body: message,
      from: fromNumber,
      to: to,
    });
    return sms;
  } catch (err) {
    console.error("❌ Twilio sendSMS error:", err.message);
    throw err;
  }
};

export default client;
