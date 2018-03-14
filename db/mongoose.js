const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

let connection = mongoose.connect("mongodb://localhost:27017/clique");

module.exports = {
  mongoose
};
