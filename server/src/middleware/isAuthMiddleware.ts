import { MyContext } from "../types";
import { MiddlewareFn } from "type-graphql/dist/interfaces/Middleware";
import { verify } from "jsonwebtoken";

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
  const authorization = context.req.headers["authorization"];

  if (!authorization) {
    throw new Error("not authenticated!");
  }

  try {
    const token = authorization?.split(" ")[1];
    const payload = verify(token, process.env.JSONWEBTOKENSECRET as string);
    context.payload = payload as any;
  } catch (err) {
    console.log(err);
    throw new Error("not authenticated!");
  }
  return next();
};
