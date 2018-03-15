const { mongoose } = require("./../db/mongoose");

var postCodeSchema = new mongoose.Schema({
  postcode: Number,
  suburb: { type: String, default: "Sydney" },
  created_at: Number
});

var myPostCodes = mongoose.model("myPostCodes", postCodeSchema);

module.exports = {
  myPostCodes
};
