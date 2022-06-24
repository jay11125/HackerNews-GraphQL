const pubsub = require("../utils/pubsub");

const newLink = {
  resolve: (payload) => {
    return payload;
  },
  subscribe: () => pubsub.asyncIterator("NEW_LINK"),
};

const newVote = {
  resolve: (payload) => {
    return payload;
  },
  subscribe: () => pubsub.asyncIterator("NEW_VOTE"),
};

module.exports = {
  newLink,
  newVote,
};
