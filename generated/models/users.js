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
const db = require('./config/db');
const bcrypt = require("bcryptjs");
const createUser = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const salt = yield bcrypt.genSalt(10);
    const hash = yield bcrypt.hash(password, salt);
    const data = yield db.query("INSERT INTO users(username, password) VALUES ($1, $2) RETURNING id, email, password", [email, hash]);
    if (data.rowCount == 0)
        return false;
    return data.rows[0];
});
const matchPassword = (password, hashPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const match = yield bcrypt.compare(password, hashPassword);
    return match;
});
