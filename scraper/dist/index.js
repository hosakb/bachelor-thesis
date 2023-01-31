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
Object.defineProperty(exports, "__esModule", { value: true });
exports.startJob = void 0;
const cron_1 = require("cron");
const business_central_1 = require("./models/business_central");
const startup_1 = require("./models/startup");
const finance_1 = require("./calc/finance");
const business_central_2 = require("./api/business-central");
const startJob = () => {
    new cron_1.CronJob("* * * 1 * *", function () {
        return __awaiter(this, void 0, void 0, function* () {
            console.info("Scraping Financial Data from Business Central");
            const startupIds = yield (0, startup_1.getStartupIds)();
            const bcUsers = yield fetchUsers(startupIds);
            for (const user of bcUsers) {
                yield scrapeFinancialData(user);
                const financialData = yield (0, business_central_1.getFinancialData)(user.startupId);
                const metrics = yield (0, finance_1.calculateMetrics)(financialData);
                yield (0, startup_1.persistMetrics)(metrics, user.startupId);
            }
        });
    }, null, true, "Europe/Berlin");
};
exports.startJob = startJob;
function scrapeFinancialData(user) {
    return __awaiter(this, void 0, void 0, function* () {
        const bc = new business_central_2.BusinessCentral(user.company, user.username, user.ntHashedPassword, user.lmHashedPassword);
        try {
            const balance = yield bc.getBalance();
            console.info(`Successfully scraped balance for ${user.company}.`);
            const liabilities = yield bc.getShortTermLiabilities();
            console.info(`Successfully scraped short term liabilities for ${user.company}.`);
            yield (0, business_central_1.insertFinancialData)(Math.round((balance + Number.EPSILON) * 100) / 100, Math.round((liabilities + Number.EPSILON) * 100) / 100, user.startupId);
            console.info(`Successfully persisted financial data for ${user.company}.`);
        }
        catch (error) {
            console.error(error);
        }
    });
}
function fetchUsers(ids) {
    return __awaiter(this, void 0, void 0, function* () {
        console.info(`Fetched ${ids.length} startups from database.`);
        const bcUsers = yield (0, business_central_1.getBcUsers)(ids);
        console.info(`Fetched ${bcUsers.length} Business Central Users from database.`);
        return bcUsers;
    });
}
