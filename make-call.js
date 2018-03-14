const accountSid = "AC998cb62514cb9e82c1993f858a2ae1da";
const authToken = "95c59b29e79758c8ce2636e6535a1c2e";
const Twilio = require("twilio");
const client = new Twilio(accountSid, authToken);

client.api.calls
  .create({
    url: "http://demo.twilio.com/docs/voice.xml",
    to: "+61401079942",
    from: "+61488842493"
  })
  .then(call => console.log(call.sid));
