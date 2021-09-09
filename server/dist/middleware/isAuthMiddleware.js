"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuth = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const isAuth = ({ context }, next) => {
    const authorization = context.req.headers["authorization"];
    if (!authorization) {
        throw new Error("not authenticated!");
    }
    try {
        const token = authorization === null || authorization === void 0 ? void 0 : authorization.split(" ")[1];
        const payload = jsonwebtoken_1.verify(token, process.env.JSONWEBTOKENSECRET);
        context.payload = payload;
    }
    catch (err) {
        console.log(err);
        throw new Error("not authenticated!");
    }
    return next();
};
exports.isAuth = isAuth;
//# sourceMappingURL=isAuthMiddleware.js.map