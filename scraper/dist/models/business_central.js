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
exports.getFinancialData = exports.insertFinancialData = exports.getBcUsers = void 0;
const db_1 = __importDefault(require("../config/db"));
const getBcUsers = (startups) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
        const users = [];
        for (const id of startups) {
            const result = yield client.query(`SELECT company, username, lm_hashed_password, nt_hashed_password FROM business_central WHERE startup_id = $1;`, [id]);
            if (result.rows[0].company != undefined &&
                result.rows[0].username != undefined &&
                result.rows[0].lm_hashed_password != undefined &&
                result.rows[0].nt_hashed_password != undefined) {
                users.push({
                    company: result.rows[0].company,
                    username: result.rows[0].username,
                    startupId: id,
                    lmHashedPassword: result.rows[0].lm_hashed_password,
                    ntHashedPassword: result.rows[0].nt_hashed_password,
                });
            }
            else {
                console.error(`Failed to query Business Central user for startupId ${id}`);
            }
        }
        return users;
    }
    catch (err) {
        throw new Error(`Failed query Business Central Users. Error: ${err}`);
    }
    finally {
        client.release();
    }
});
exports.getBcUsers = getBcUsers;
const insertFinancialData = (balance, shortTermLiabilities, startupId) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
        yield client.query("INSERT INTO business_central_finance (balance, short_term_liabilities, startup_id) VALUES ($1, $2, $3);", [balance, shortTermLiabilities, startupId]);
    }
    catch (err) {
        throw new Error(`Failed to insert financial data for startup with id ${startupId} Error: ${err}`);
    }
    finally {
        client.release();
    }
});
exports.insertFinancialData = insertFinancialData;
const getFinancialData = (startupId) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
        const result = yield client.query("SELECT balance, short_term_liabilities, startup_id, evaluated_at FROM business_central_finance WHERE startup_id = $1 ORDER BY evaluated_at DESC LIMIT 30;", [startupId]);
        const financialData = result.rows.map((row) => {
            return {
                balance: row.balance,
                shortTermLiabilities: row.short_term_liabilities,
                startupId: row.startup_id,
                evaluatedAt: row.evaluated_at,
            };
        });
        return financialData;
    }
    catch (err) {
        throw new Error(`Failed to query financial data for startup with id ${startupId} Error: ${err}`);
    }
    finally {
        client.release();
    }
});
exports.getFinancialData = getFinancialData;
