const express = require("express");
const axios = require("axios");
const { myPostCodes } = require("./../models/info-schema");
const VoiceResponse = require("twilio").twiml.VoiceResponse;

const postcodeRouter = express.Router();

postcodeRouter.post("/", (req, res) => {
  let suburbName = "";
  const twiml = new VoiceResponse();
  axios
    .get(
      `https://digitalapi.auspost.com.au/locations/v2/points/postcode/${
        req.body.Digits
      }`,
      { headers: { "AUTH-KEY": process.env.auspostkey } }
    )
    .then(re => {
      if (re.data.points[0].geo_location && re.data.points[0].address.suburb) {
        suburbName = re.data.points[0].address.suburb;
        return re.data.points[0].geo_location;
      }
      return { lat: -37.80778226, lon: 144.9609579 };
    })
    .then(re => {
      return axios.get(
        `https://api.darksky.net/forecast/${process.env.weatherkey}/${re.lat},${
          re.lon
        }?units=si`
      );
    })
    .then(re => {
      weatherMessage(
        twiml,
        suburbName,
        req.body.Digits,
        re.data.hourly.summary,
        re.data.daily.summary
      );
      saveToDB(req.body.Digits, suburbName);
      res
        .status(200)
        .type("text/xml")
        .send(twiml.toString());
    })
    .catch(err => {
      console.log("OOOOPSSSSSS", err);
      res.end(err);
    });
});

module.exports = { postcodeRouter };
// ===============================
//Helper Functions start here
// ===============================

function saveToDB(postcode, suburb) {
  let newPostCode = new myPostCodes({
    postcode,
    suburb: suburb || ""
  });
  newPostCode.save();
}

function weatherMessage(
  twiml,
  suburbName,
  postcode,
  hourlyForecast,
  dailyForecast
) {
  if (suburbName) {
    return twiml.say(
      `The weather forecast for ${suburbName} is ${hourlyForecast} ${dailyForecast}. Thank you for calling. Bye now.`
    );
  } else {
    return twiml.say(
      `The weather forecast for ${
        req.body.Digits
      } is ${hourlyForecast} ${dailyForecast}. Thank you for calling. Bye now.`
    );
  }
}
