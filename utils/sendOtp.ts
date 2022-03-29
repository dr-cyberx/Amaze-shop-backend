const Twilio = require('twilio');

const sendOtp = async (phoneNumber: number): Promise<string | null> => {
  try {
    const client = Twilio(
      process.env.TWILLIO_ACCOUNT_SID,
      process.env.TWILLIO_AUTH_TOKEN,
    );
    const OTP: number = Math.floor(1000 + Math.random() * 9000);
    await client.messages
      .create({
        body: `${OTP}`,
        messagingServiceSid: process.env.MESSAGING_SERVICE,
        to: `91${phoneNumber}`,
      })
      .done();
    return `${OTP}`;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default sendOtp;
