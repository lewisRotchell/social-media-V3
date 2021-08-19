import dotenv from "dotenv";
dotenv.config();
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

const main = async () => {
  await createConnection({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: process.env.DBUSERNAME,
    password: process.env.PASSWORD,
    database: "jwtauth",
    logging: !__prod__,
    // synchronize: true,
    migrations: [],
    entities: [Users],
  });

  const app = express();

  const apolloServer = new ApolloServer({
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    schema: await buildSchema({
      resolvers: [UserResolver],
    }),
    context: ({ req, res }): MyContext => ({ req, res }),
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log("Server started on port 4000");
  });
};

main().catch((err) => console.log(err));
