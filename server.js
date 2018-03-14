const express = require("express");
const beep = require("beepbeep");
const bodyParser = require("body-parser");
const axios = require("axios");
const { mongoose } = require("./db/mongoose");
const { myPostCodes } = require("./models/info-schema");
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

  twiml.say(
    "Please wait while I fetch the weather information for you. Thanks!"
  );
  res
    .status(200)
    .type("text/xml")
    .send(twiml.toString());
});

app.post("/postcode", (req, res) => {
  let suburbName = "";
  const twiml = new VoiceResponse();
  console.log("req.body.Digits is --->", req.body.Digits);
  axios
    .get(
      `https://digitalapi.auspost.com.au/locations/v2/points/postcode/${
        req.body.Digits
      }`,
      { headers: { "AUTH-KEY": "9436ee625b90476fabc6d88fe1d35b5f" } }
    )
    .then(re => {
      if (re.data.points[0].geo_location && re.data.points[0].address.suburb) {
        console.log("YIPPPEEEE!!", re.data.points[0].geo_location);
        suburbName = re.data.points[0].address.suburb;
        let location = re.data.points[0].geo_location;
        return location;
      } else {
        let location = { lat: -37.80778226, lon: 144.9609579 };
        return location;
      }
    })
    .then(re => {
      return axios.get(
        `https://api.darksky.net/forecast/4c01a970ef5af31cfa5d6b58ae94165d/${
          re.lat
        },${re.lon}?units=si`
      );
    })
    .then(re => {
      console.log(
        "FINAL WEATHER Summary IS-->",
        re.data.hourly.summary + re.data.daily.summary
      );
      if (suburbName) {
        twiml.say(
          `The weather forecast for ${suburbName} is ${
            re.data.hourly.summary
          } ${re.data.daily.summary}. Thank you for calling. Bye now.`
        );
      } else {
        twiml.say(
          `The weather forecast for ${req.body.Digits} is ${
            re.data.hourly.summary
          } ${re.data.daily.summary}. Thank you for calling. Bye now.`
        );
      }
      let newPostCode = new myPostCodes({
        postcode: req.body.Digits
      });
      newPostCode.save();
      res
        .status(200)
        .type("text/xml")
        .send(twiml.toString());
    })
    .catch(err => {
      console.log("OOOOPSSSSSS", err);
    });
});

app.listen(3000, () => {
  console.log("app running on port 3000");
});
