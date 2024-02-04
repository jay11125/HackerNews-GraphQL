const mongoose = require("mongoose");

const LinkSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    url: { type: String, required: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const LinkModel = mongoose.model("Link", LinkSchema);
module.exports = LinkModel;
