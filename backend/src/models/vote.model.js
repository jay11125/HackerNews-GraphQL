const mongoose = require("mongoose");

const VoteSchema = new mongoose.Schema(
  {
    link: { type: mongoose.Schema.Types.ObjectId, ref: "Link" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const VoteModel = mongoose.model("Vote", VoteSchema);
module.exports = VoteModel;
