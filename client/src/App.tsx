import { ColorModeScript } from "@chakra-ui/react";
import React, { useState } from "react";
import ReactDOM from "react-dom";
import { ApolloProvider } from "@apollo/client";
// import { getAccessToken, setAccessToken } from "./utils/accessToken";

import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
import { ApolloLink, Observable } from "apollo-link";
import { TokenRefreshLink } from "apollo-link-token-refresh";
import jwtDecode from "jwt-decode";
// import { setAccessToken } from "./utils/accessToken";
import { useAccessToken } from "./context/AccessTokenProvider";
import { Routes } from "./Routes";

export const App = () => {
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useAccessToken();

  const cache = new InMemoryCache({});

  const requestLink = new ApolloLink(
    (operation, forward) =>
      new Observable((observer) => {
        let handle: any;
        Promise.resolve(operation)
          .then((operation) => {
            // const accessToken = getAccessToken();
            if (accessToken) {
              operation.setContext({
                headers: {
                  authorization: `bearer ${accessToken}`,
                },
              });
            }
          })
          .then(() => {
            handle = forward(operation).subscribe({
              next: observer.next.bind(observer),
              error: observer.error.bind(observer),
              complete: observer.complete.bind(observer),
            });
          })
          .catch(observer.error.bind(observer));

        return () => {
          if (handle) handle.unsubscribe();
        };
      })
  );

  const tokenRefreshLink: any = new TokenRefreshLink({
    accessTokenField: "accessToken",
    //Checks if token is valid
    isTokenValidOrUndefined: () => {
      // const token = getAccessToken();

      if (!accessToken) {
        return true;
      }

      try {
        const { exp }: any = jwtDecode(accessToken);
        if (Date.now() >= exp * 1000) {
          return false;
        } else {
          return true;
        }
      } catch {
        return false;
      }
    },
    //If the token is not valid, it's going to call this function and get a new access token
    fetchAccessToken: () => {
      return fetch("http://localhost:4000/refresh_token", {
        method: "POST",
        credentials: "include",
      });
    },
    //sets access token here
    handleFetch: (accessToken) => {
      setAccessToken(accessToken);
    },
    handleError: (err) => {
      console.warn("Your refresh token is invalid. Try to relogin");
      console.error(err);
    },
  });

  //this gets called on every graphql request
  //But only fetches access token  if the token is invalid
  const client: any = new ApolloClient({
    link: ApolloLink.from([
      tokenRefreshLink,
      onError(({ graphQLErrors, networkError }) => {
        console.log(graphQLErrors);
        console.log(networkError);
      }),
      requestLink,
      new HttpLink({
        uri: "http://localhost:4000/graphql",
        credentials: "include",
      }),
    ]),
    cache,
  });

  return (
    <>
      <ApolloProvider client={client}>
        <Routes />
      </ApolloProvider>
    </>
  );
};
