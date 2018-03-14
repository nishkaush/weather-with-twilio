const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

let connection = mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/clique"
);

module.exports = {
  mongoose
};
