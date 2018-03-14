const express = require("express");
const beep = require("beepbeep");
const bodyParser = require("body-parser");
const axios = require("axios");
const { mongoose } = require("./db/mongoose");
const { myPostCodes } = require("./models/info-schema");
const { postcodeRouter } = require("./routes/postcode");
const VoiceResponse = require("twilio").twiml.VoiceResponse;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use("/postcode", postcodeRouter);

app.get("/", (req, res) => {
  myPostCodes
    .find()
    .then(re => res.send(re))
    .catch(err => res.send(err));
});

app.post("/", (req, res) => {
  const twiml = new VoiceResponse();

  const gather = twiml.gather({
    input: "dtmf",
    timeout: 10,
    finishOnKey: "#",
    action: "/postcode",
    method: "POST"
  });
  gather.say(
    "Welcome to the weather service. To find the weather information, please enter the postcode of your location. Once you are done, press the hash key."
  );
  res
    .status(200)
    .type("text/xml")
    .send(twiml.toString());
});

app.listen(3000, () => {
  console.log("app running on port 3000");
});
