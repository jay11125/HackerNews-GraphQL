import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./components/App";
import { BrowserRouter } from "react-router-dom";
import { setContext } from "@apollo/client/link/context";
import { split } from "@apollo/client";
import { createClient } from "graphql-ws";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { ApolloProvider, ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";
import { AUTH_TOKEN } from "./constants";

const httpLink = createHttpLink({
  uri: "http://localhost:4000/graphql",
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(AUTH_TOKEN);
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: "ws://localhost:4000/graphql",
    connectionParams: {
      authToken: localStorage.getItem(AUTH_TOKEN),
    },
  })
);

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === "OperationDefinition" && operation === "subscription";
  },
  wsLink,
  authLink.concat(httpLink)
);

const client = new ApolloClient({
  link,
  cache: new InMemoryCache({
    addTypename: false,
    typePolicies: {
      Query: {
        fields: {
          feed: { merge: true },
        },
      },
    },
  }),
});

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>
);
