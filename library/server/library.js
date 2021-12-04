require("dotenv").config();
const { ApolloServer } = require("apollo-server-express");
const {
  ApolloServerPluginLandingPageGraphQLPlayground,
} = require("apollo-server-core");
const { execute, subscribe } = require("graphql");
const { SubscriptionServer } = require("subscriptions-transport-ws");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const express = require("express");
const { createServer } = require("http");
const jwt = require("jsonwebtoken");

const typeDefs = require("./typeDefs");
const resolvers = require("./resolvers");

require("./db");
const User = require("./models/user");

const JWT_SECRET = "NEED_HERE_A_SECRET_KEY";

(async function () {
  const app = express();
  // This `app` is the returned value from `express()`.
  const httpServer = createServer(app);

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  const server = new ApolloServer({
    schema,
    context: async ({ req }) => {
      const auth = req ? req.headers.authorization : null;
      if (auth && auth.toLowerCase().startsWith("bearer ")) {
        const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET);
        const currentUser = await User.findById(decodedToken.id);
        return { currentUser };
      }
    },
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  });

  SubscriptionServer.create(
    // This is the `schema` we just created.
    {
      schema,
      // These are imported from `graphql`.
      execute,
      subscribe,
    },
    {
      // This is the `httpServer` we created in a previous step.
      server: httpServer,
      // Pass a different path here if your ApolloServer serves at
      // a different path.
      // path: server.graphqlPath,
    }
  );

  await server.start();
  server.applyMiddleware({ app });

  const PORT = 4000;
  httpServer.listen(PORT, () => {
    console.log(
      `Query endpoint ready at http://localhost:${PORT}${server.graphqlPath}`
    );
    console.log(
      `Subscription endpoint ready at ws://localhost:${PORT}${server.graphqlPath}`
    );
  });
})();
