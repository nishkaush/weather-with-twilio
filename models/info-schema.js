const { mongoose } = require("./../db/mongoose");

var postCodeSchema = new mongoose.Schema({
  postcode: Number
});

var myPostCodes = mongoose.model("myPostCodes", postCodeSchema);

module.exports = {
  myPostCodes
};
