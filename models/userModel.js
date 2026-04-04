const mongoose = require("mongoose");

// Create user model
const User = mongoose.model("registered_User", {
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: false },
  uniqueId: { type: String, required: true },
  avatar: { type: String, required: true },
  googleIdToken: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
});



module.exports = User;

