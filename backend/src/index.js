const path = require("path");
const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const { createServer } = require("http");
const { WebSocketServer } = require("ws");
const getUserId = require("./utils/authenticate");
const { useServer } = require("graphql-ws/lib/use/ws");
const { ApolloServer } = require("apollo-server-express");
const { loadFilesSync } = require("@graphql-tools/load-files");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { mergeTypeDefs, mergeResolvers } = require("@graphql-tools/merge");
const { ApolloServerPluginDrainHttpServer } = require("apollo-server-core");

dotenv.config();
const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 5000;

const typesArr = loadFilesSync(path.join(__dirname, "graphql", "schema.graphql"));
const resolversArray = loadFilesSync(path.join(__dirname, "graphql", "resolver.js"));

const schema = makeExecutableSchema({
  typeDefs: mergeTypeDefs(typesArr),
  resolvers: mergeResolvers(resolversArray),
});

const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/",
});

const serverCleanup = useServer({ schema }, wsServer);

const startApolloServer = async () => {
  const server = new ApolloServer({
    schema,
    context: ({ req }) => {
      return { ...req, userId: req && req.headers.authorization ? getUserId(req) : null };
    },
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
    csrfPrevention: true,
  });
  await server.start();
  server.applyMiddleware({ app, path: "/" });

  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("MongoDB Connected...");
      httpServer.listen({ port }, () =>
        console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
      );
    })
    .catch((error) => console.log(error));
};

startApolloServer();
