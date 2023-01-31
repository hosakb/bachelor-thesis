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
exports.persistMetrics = exports.getStartupIds = void 0;
const db_1 = __importDefault(require("../config/db"));
const getStartupIds = () => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
        const result = yield client.query(`SELECT id FROM startup`, []);
        return result.rows.map((row) => {
            return row.id;
        });
    }
    catch (err) {
        throw new Error(`Failed query Startup Ids. Error: ${err}`);
    }
    finally {
        client.release();
    }
});
exports.getStartupIds = getStartupIds;
const persistMetrics = (metrics, startupId) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
        yield client.query("INSERT INTO metrics (date, burn_rate, cash_runway, liquidity, startup) VALUES ($1, $2, $3, $4, $5)", [
            metrics.date,
            metrics.burnRate,
            metrics.cashRunway,
            metrics.liquidity,
            startupId,
        ]);
    }
    catch (err) {
        throw new Error(`Failed to persist metrics data for startup with id ${startupId}. Error: ${err}`);
    }
    finally {
        client.release();
    }
});
exports.persistMetrics = persistMetrics;
