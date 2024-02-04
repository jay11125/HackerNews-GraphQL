const { signup, login } = require("../resolvers/userResolver");
const { newLink, newVote } = require("../graphql/subscription");
const { createLink, feed, deleteLink, updateLink, voteLink } = require("../resolvers/linkResolver");

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
    voteLink,
  },

  Subscription: {
    newLink,
    newVote,
  },
};

module.exports = resolvers;
