import { sign } from "jsonwebtoken";
import { Users } from "../entities/User";

export const createAccessToken = (user: Users) => {
  return sign({ userId: user.id }, process.env.JSONWEBTOKENSECRET as string, {
    expiresIn: "15m",
  });
};

export const createRefreshToken = (user: Users) => {
  return sign(
    { userId: user.id, tokenVersion: user.tokenVersion },
    process.env.COOKIE_SECRET as string,
    {
      expiresIn: "7d",
    }
  );
};
