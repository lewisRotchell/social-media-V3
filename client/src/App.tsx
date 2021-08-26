import * as React from "react";
import {
  ChakraProvider,
  Box,
  Text,
  VStack,
  Code,
  Grid,
  theme,
} from "@chakra-ui/react";
import { ColorModeSwitcher } from "./ColorModeSwitcher";
import { BrowserRouter, Route, Switch, Link } from "react-router-dom";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";

export const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <Box>
          <Grid>
            <header>
              <div>
                <Link to="/">Home</Link>
              </div>
              <div>
                <Link to="/register">Register</Link>
              </div>
              <div>
                <Link to="/login">Login</Link>
              </div>
            </header>
            <ColorModeSwitcher justifySelf="flex-end" />
          </Grid>
        </Box>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />
        </Switch>
      </BrowserRouter>
    </ChakraProvider>
  );
};
