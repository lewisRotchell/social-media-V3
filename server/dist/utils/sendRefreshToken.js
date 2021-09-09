"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendRefreshToken = void 0;
const constants_1 = require("../constants");
const sendRefreshToken = (res, token) => {
    res.cookie("jid", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: constants_1.__prod__,
        path: "/refresh_token",
    });
};
exports.sendRefreshToken = sendRefreshToken;
//# sourceMappingURL=sendRefreshToken.js.map