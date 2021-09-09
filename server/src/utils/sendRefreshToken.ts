import { Response } from "express";
import { __prod__ } from "../constants";

export const sendRefreshToken = (res: Response, token: string) => {
  res.cookie("jid", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: __prod__, //cookie only works in https
    path: "/refresh_token", //only sends refresh token when access token needs to be refreshed
  });
};
