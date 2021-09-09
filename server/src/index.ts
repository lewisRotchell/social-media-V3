import "dotenv/config";
//No need to use dotenv.config() when it is imported like this
import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import { __prod__ } from "./constants";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./resolvers/User";
import { MyContext } from "./types";
import { Users } from "./entities/User";
import cookieParser from "cookie-parser";
import { createAccessToken, createRefreshToken } from "./utils/auth";
import { verify as verifyJwt } from "jsonwebtoken";
import { sendRefreshToken } from "./utils/sendRefreshToken";
import cors from "cors";

const main = async () => {
  await createConnection({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: process.env.DBUSERNAME,
    password: process.env.PASSWORD,
    database: "jwtauth",
    logging: !__prod__,
    synchronize: true,
    migrations: [],
    entities: [Users],
  });

  const app = express();
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );
  app.use(cookieParser());
  //cookie parser parses cookie and puts it in req.cookies
  app.post("/refresh_token", async (req, res) => {
    const token = req.cookies.jid;
    if (!token) {
      return res.send({ ok: false, accessToken: "" });
    }
    let payload: any = null;
    try {
      payload = verifyJwt(token, process.env.COOKIE_SECRET!);
    } catch (err) {
      console.log(err);
      return res.send({ ok: false, accessToken: "" });
    }

    //Token is valid and we can send back an access token
    const user = await Users.findOne({ id: payload.userId });

    if (!user) {
      return res.send({ ok: false, accessToken: "" });
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      return res.send({ ok: false, accessToken: "" });
    }

    //refesh the refresh token
    sendRefreshToken(res, createRefreshToken(user));

    return res.send({ ok: true, accessToken: createAccessToken(user) });
  });

  const apolloServer = new ApolloServer({
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    schema: await buildSchema({
      resolvers: [UserResolver],
    }),
    context: ({ req, res }): MyContext => ({ req, res }),
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(process.env.PORT || 4000, () => {
    console.log(`Server started on port ${process.env.PORT}`);
  });
};

main().catch((err) => console.log(err));
