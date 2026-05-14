const twilio = require('twilio');

// Initialize Twilio client conditionally so it doesn't crash if keys are missing
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

const sendWhatsAppToAllUsers = async (users, message) => {
  const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // default Twilio sandbox number

  if (!twilioClient) {
    console.log('⚠️ Twilio credentials missing in .env');
    console.log('📦 Mock WhatsApp Broadcast:');
    console.log(message);
    return;
  }

  // Iterate and send WhatsApp message to users who have a phone number
  const promises = users.map(user => {
    if (user.phone) {
      // Ensure phone number starts with + and country code. E.g. +91XXXXXXXXXX
      const toPhone = user.phone.startsWith('+') ? user.phone : `+${user.phone}`;
      return twilioClient.messages.create({
        from: twilioNumber,
        to: `whatsapp:${toPhone}`,
        body: message,
      }).catch(err => {
        console.error(`Failed to send WhatsApp to ${toPhone}:`, err.message);
      });
    }
  });

  await Promise.all(promises);
};

module.exports = {
  sendWhatsAppToAllUsers,
};
