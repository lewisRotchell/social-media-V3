import React, { useState, useEffect } from "react";
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
import { Bye } from "./pages/Bye";
// import { setAccessToken } from "./utils/accessToken";
import { useAccessToken } from "./context/AccessTokenProvider";
import { Header } from "./components/Header";

export const Routes: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useAccessToken();

  useEffect(() => {
    const createAccessToken = async () => {
      const response = await fetch("http://localhost:4000/refresh_token", {
        method: "POST",
        credentials: "include",
      });
      const { accessToken } = await response.json();
      setAccessToken(accessToken);
      setLoading(false);
    };
    createAccessToken();
  }, [accessToken, setAccessToken]);

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <Header />
        <Box>
          <Grid>
            <ColorModeSwitcher justifySelf="flex-end" />
          </Grid>
        </Box>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />
          <Route exact path="/bye" component={Bye} />
        </Switch>
      </BrowserRouter>
    </ChakraProvider>
  );
};
