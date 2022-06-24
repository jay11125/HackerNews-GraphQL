const { vote } = require("../resolvers/voteResolver");
const { signup, login } = require("../resolvers/userResolver");
const { newLink, newVote } = require("../graphql/subscription");
const { createLink, feed, deleteLink, updateLink } = require("../resolvers/linkResolver");

const resolvers = {
  Query: {
    feed,
  },

  Mutation: {
    createLink,
    deleteLink,
    updateLink,
    signup,
    login,
    vote,
  },

  Subscription: {
    newLink,
    newVote,
  },
};

module.exports = resolvers;
