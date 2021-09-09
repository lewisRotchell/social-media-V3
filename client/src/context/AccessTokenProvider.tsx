import React, { useContext, createContext, FC, useState } from "react";

//Created because, whenever the accesstoken changes
//It wouldnt cause the react app to refresh
//This global variable will though

type AccessTokenContext = [
  string,
  React.Dispatch<React.SetStateAction<string>>
];

const AccessTokenProvider: FC = (props) => {
  const [accessToken, setAccessToken] = useState<string>("");
  return (
    <AccessToken.Provider value={[accessToken, setAccessToken]} {...props} />
  );
};

const AccessToken = createContext<AccessTokenContext>(["", () => {}]);

const useAccessToken = (): AccessTokenContext =>
  useContext<AccessTokenContext>(AccessToken);

export { AccessTokenProvider, useAccessToken };
