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
    .skip(args.skip * args.take)
    .sort(args.orderBy)
    .populate("postedBy");
  return links;
};

const createLink = async (_, args, context) => {
  let newLink = new LinkModel({
    description: args.description,
    url: args.url,
    postedBy: context.userId,
  });
  let link = await newLink.save();
  await UserModel.findByIdAndUpdate(context.userId, { $push: { links: link._id } });
  await link.populate("postedBy");
  pubsub.publish("NEW_LINK", link);

  return link;
};

const deleteLink = async (_, args, context) => {
  let deletedLink = await LinkModel.findByIdAndDelete(args._id);
  await UserModel.findByIdAndUpdate(context.userId, { $pull: { links: args._id } });

  return deletedLink;
};

const updateLink = async (_, args) => {
  let updatedLink = await LinkModel.findByIdAndUpdate(
    args._id,
    {
      url: args.url,
      description: args.description,
    },
    { new: true }
  ).populate("postedBy");

  return updatedLink;
};

module.exports = { createLink, feed, deleteLink, updateLink };
