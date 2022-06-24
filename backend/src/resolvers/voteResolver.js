const VoteModel = require("../models/vote.model");
const pubsub = require("../utils/pubsub");

const vote = async (_, args, context) => {
  const userId = context.userId;

  const alreadyVoted = await VoteModel.findOne({ user: userId, link: args.linkId });

  if (alreadyVoted) {
    throw new Error(`Already voted for link: ${args.linkId}`);
  }

  const newVote = new VoteModel({
    user: userId,
    link: args.linkId,
  });
  let vote = await newVote.save();
  await vote.populate("user");
  await vote.populate("link");

  pubsub.publish("NEW_VOTE", vote);

  return vote;
};

module.exports = { vote };
