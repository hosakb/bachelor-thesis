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
exports.calculateMetrics = void 0;
function calculateMetrics(financialData) {
    return __awaiter(this, void 0, void 0, function* () {
        const burnRate = financialData[financialData.length - 1].balance - financialData[0].balance;
        let cashRunway = 0;
        if (burnRate != 0) {
            cashRunway = financialData[0].balance / burnRate;
        }
        const liquidity = financialData[0].balance / financialData[0].shortTermLiabilities;
        return {
            date: financialData[0].evaluatedAt,
            burnRate,
            cashRunway,
            liquidity,
        };
    });
}
exports.calculateMetrics = calculateMetrics;
