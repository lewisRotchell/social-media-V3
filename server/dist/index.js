"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const express_1 = __importDefault(require("express"));
const constants_1 = require("./constants");
const apollo_server_express_1 = require("apollo-server-express");
const apollo_server_core_1 = require("apollo-server-core");
const type_graphql_1 = require("type-graphql");
const User_1 = require("./resolvers/User");
const User_2 = require("./entities/User");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_1 = require("./utils/auth");
const jsonwebtoken_1 = require("jsonwebtoken");
const sendRefreshToken_1 = require("./utils/sendRefreshToken");
const cors_1 = __importDefault(require("cors"));
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    yield typeorm_1.createConnection({
        type: "postgres",
        host: "localhost",
        port: 5432,
        username: process.env.DBUSERNAME,
        password: process.env.PASSWORD,
        database: "jwtauth",
        logging: !constants_1.__prod__,
        synchronize: true,
        migrations: [],
        entities: [User_2.Users],
    });
    const app = express_1.default();
    app.use(cors_1.default({
        origin: "http://localhost:3000",
        credentials: true,
    }));
    app.use(cookie_parser_1.default());
    app.post("/refresh_token", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const token = req.cookies.jid;
        if (!token) {
            return res.send({ ok: false, accessToken: "" });
        }
        let payload = null;
        try {
            payload = jsonwebtoken_1.verify(token, process.env.COOKIE_SECRET);
        }
        catch (err) {
            console.log(err);
            return res.send({ ok: false, accessToken: "" });
        }
        const user = yield User_2.Users.findOne({ id: payload.userId });
        if (!user) {
            return res.send({ ok: false, accessToken: "" });
        }
        if (user.tokenVersion !== payload.tokenVersion) {
            return res.send({ ok: false, accessToken: "" });
        }
        sendRefreshToken_1.sendRefreshToken(res, auth_1.createRefreshToken(user));
        return res.send({ ok: true, accessToken: auth_1.createAccessToken(user) });
    }));
    const apolloServer = new apollo_server_express_1.ApolloServer({
        plugins: [apollo_server_core_1.ApolloServerPluginLandingPageGraphQLPlayground()],
        schema: yield type_graphql_1.buildSchema({
            resolvers: [User_1.UserResolver],
        }),
        context: ({ req, res }) => ({ req, res }),
    });
    yield apolloServer.start();
    apolloServer.applyMiddleware({ app, cors: false });
    app.listen(process.env.PORT || 4000, () => {
        console.log(`Server started on port ${process.env.PORT}`);
    });
});
main().catch((err) => console.log(err));
//# sourceMappingURL=index.js.map