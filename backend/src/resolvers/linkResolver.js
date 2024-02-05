const LinkModel = require("../models/link.model");
const UserModel = require("../models/user.model");
const pubsub = require("../utils/pubsub");

const feed = async (_, args) => {
  const where = args.filter
    ? {
        $or: [
          { description: { $regex: args.filter, $options: "i" } },
          { url: { $regex: args.filter, $options: "i" } },
        ],
      }
    : {};
  let links = await LinkModel.find(where)
    .limit(args.take)
    .skip(args.skip)
    .sort(args.orderBy)
    .populate("postedBy");
  let count = await LinkModel.count(where);
  return { links, count };
};

const createLink = async (_, args, context) => {
  let newLink = new LinkModel({
    description: args.description,
    url: args.url,
    postedBy: context.userId,
    votes: [],
  });
  let link = await newLink.save();
  await UserModel.findByIdAndUpdate(context.userId, { $push: { links: link.id } });
  await link.populate("postedBy");
  pubsub.publish("NEW_LINK", link);

  return link;
};

const deleteLink = async (_, args, context) => {
  let deletedLink = await LinkModel.findByIdAndDelete(args.id);
  await UserModel.findByIdAndUpdate(context.userId, { $pull: { links: args.id } });

  return deletedLink;
};

const updateLink = async (_, args) => {
  let updatedLink = await LinkModel.findByIdAndUpdate(
    args.id,
    {
      url: args.url,
      description: args.description,
    },
    { new: true }
  ).populate("postedBy");

  return updatedLink;
};

const voteLink = async (_, args, context) => {
  const userId = context.userId;

  const tempLink = await LinkModel.findById(args.linkId);

  if (tempLink.votes.includes(userId)) {
    const link = await LinkModel.findByIdAndUpdate(
      args.linkId,
      { $pull: { votes: userId } },
      { new: true }
    );
    pubsub.publish("NEW_VOTE", link);
    return link;
  }

  const link = await LinkModel.findByIdAndUpdate(
    args.linkId,
    { $push: { votes: userId } },
    { new: true }
  );
  pubsub.publish("NEW_VOTE", link);
  return link;
};

module.exports = { createLink, feed, deleteLink, updateLink, voteLink };
