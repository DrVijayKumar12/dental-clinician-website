const mongoose = require("mongoose");

// COMMENT MODEL
const commentSchema = new mongoose.Schema({
  username: { type: String, required: true },
  comment: { type: String, required: true },
  subject: { type: String, required: true },
  chapterUrl: { type: String, required: true },
  avatarUrl: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
