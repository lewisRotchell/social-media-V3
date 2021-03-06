import { ColorModeScript } from "@chakra-ui/react";
import * as React from "react";
import ReactDOM from "react-dom";
import { App } from "./App";
import { ApolloProvider } from "@apollo/client";

import { AccessTokenProvider } from "./context/AccessTokenProvider";

ReactDOM.render(
  <AccessTokenProvider>
    <App />
  </AccessTokenProvider>,
  document.getElementById("root")
);
