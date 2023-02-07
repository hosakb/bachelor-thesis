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
const express_1 = __importDefault(require("express"));
const fund_1 = require("../models/fund");
const fund_startup_map_1 = require("../models/fund_startup_map");
const fund_2 = require("../models/fund");
const startup_1 = require("../models/startup");
const track_record_1 = require("../models/track_record");
const rating_1 = require("../util/calc/rating");
const date_1 = require("../util/date");
const router = express_1.default.Router();
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    const fundId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.fund;
    if (fundId === undefined) {
        if (((_b = req.user) === null || _b === void 0 ? void 0 : _b.startup) !== undefined) {
            console.log(`Redirecting user ${(_c = req.user) === null || _c === void 0 ? void 0 : _c.id} to startup screen since no fund id is assigned.`);
            res.redirect("/startup");
        }
        else {
            console.log(`Redirecting user ${(_d = req.user) === null || _d === void 0 ? void 0 : _d.id} to login screen since no fund id or startup id are assigned.`);
            res.redirect("/");
        }
    }
    else {
        req.session.fundId = fundId;
        try {
            if (yield !(0, fund_startup_map_1.fundIdExists)(fundId)) {
                res.redirect("/"); // invalid query result for fundId
                return;
            }
            req.session.startupTable = yield (0, fund_startup_map_1.getStartupsForFund)(fundId);
            const portfolio = yield (0, fund_1.getFundById)(fundId);
            res.render("dashboard/fund/index", {
                layout: "../views/layouts/dashboard.ejs",
                dashboard: "fund",
                scripts: ["/js/table", "/js/ag-grid-community.min"],
                portfolio,
                page: "dashboard",
                title: yield (0, fund_1.getFundNameById)(fundId),
                name: ((_e = req.user) === null || _e === void 0 ? void 0 : _e.firstName) + " " + ((_f = req.user) === null || _f === void 0 ? void 0 : _f.lastName),
                view: "fund",
            });
        }
        catch (error) {
            console.error(`Failed to fetch fund data for startup with id ${fundId} due to:\n${error}.\nRedirecting to login screen.`);
            res.redirect("/");
        }
    }
}));
router.get("/table/values", (req, res) => {
    res.status(200).json(req.session.startupTable);
});
router.post("/startup", (req, res) => {
    req.session.selectedStartup = req.body.id;
    res.setHeader("content-type", "application/javascript");
    res.redirect(`startup`);
});
router.get("/startup/founders", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _g, _h, _j;
    const startupId = req.session.selectedStartup;
    if (startupId === undefined) {
        console.log(`Redirecting user ${(_g = req.user) === null || _g === void 0 ? void 0 : _g.id} to fund screen since no selected startup was found.`);
        res.redirect("/fund/");
    }
    try {
        const capTable = yield (0, startup_1.getCapTable)(startupId);
        res.render("dashboard/fund/founders", {
            layout: "../views/layouts/dashboard.ejs",
            dashboard: "fund",
            scripts: ["/js/chart/chart.min", "/js/founders"],
            title: req.startupName,
            name: ((_h = req.user) === null || _h === void 0 ? void 0 : _h.firstName) + " " + ((_j = req.user) === null || _j === void 0 ? void 0 : _j.lastName),
            founders: yield (0, track_record_1.getFoundersByStartupId)(startupId),
            startup: req.session.selectedStartup,
            page: "founders",
            capTable,
        });
    }
    catch (error) {
        console.error(`Failed to fetch startup request data for startup with id ${startupId} due to:\n${error}.\nRedirecting to fund dashboard.`);
        res.redirect("/fund/");
    }
}));
router.post("/expertise", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const startupId = req.session.selectedStartup;
        const expertiseValues = yield (0, track_record_1.getExpertiseByStartup)(startupId);
        const expertise = {
            name: [],
            amount: [],
        };
        for (const i of expertiseValues) {
            if (!expertise.name.includes(i)) {
                expertise.name.push(i);
                const amount = expertiseValues.filter((x) => x == i);
                expertise.amount.push(amount.length);
            }
        }
        res.status(200).json(expertise);
    }
    catch (error) {
        res.status(200).json([]);
    }
}));
router.get("/startup/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _k, _l, _m;
    const startupId = req.session.selectedStartup;
    if (startupId === undefined) {
        console.log(`Redirecting user ${(_k = req.user) === null || _k === void 0 ? void 0 : _k.id} to fund screen since no selected startup was found.`);
        res.redirect("/fund/");
    }
    try {
        const trl = yield (0, startup_1.getTrl)(startupId);
        res.render("dashboard/startup/index", {
            layout: "../views/layouts/dashboard.ejs",
            scripts: [
                "/js/gantt/frappe-gantt.min",
                "/js/chart/chart.min",
                "/js/fund",
            ],
            dashboard: "fund",
            kpis: req.kpis,
            title: req.startupName,
            page: "startup",
            view: "startup",
            name: ((_l = req.user) === null || _l === void 0 ? void 0 : _l.firstName) + " " + ((_m = req.user) === null || _m === void 0 ? void 0 : _m.lastName),
            startup: req.session.selectedStartup,
            trl: trl,
            investors: yield (0, startup_1.getInvestors)(startupId),
        });
    }
    catch (error) {
        console.error(`Failed to fetch startup request data for startup with id ${startupId} due to:\n${error}.\nRedirecting to fund dashboard.`);
        res.redirect("/fund/");
    }
}));
router.get("/startup/rating", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _o, _p, _q;
    const startupId = req.session.selectedStartup;
    const fundId = req.session.fundId;
    if (startupId === undefined) {
        console.log(`Redirecting user ${(_o = req.user) === null || _o === void 0 ? void 0 : _o.id} to fund screen since no selected startup was found.`);
        res.redirect("/fund/");
    }
    try {
        const questionnaire = yield (0, startup_1.getQuestionnaire)(startupId);
        let q;
        for (q in questionnaire) {
            if (Object.prototype.hasOwnProperty.call(questionnaire, q)) {
                questionnaire[q] = parseFloat(questionnaire[q].toFixed(1));
            }
        }
        const questionnaireAvg = (0, rating_1.getQuestionnaireAverages)(questionnaire);
        let qa;
        for (qa in questionnaireAvg) {
            if (Object.prototype.hasOwnProperty.call(questionnaireAvg, qa)) {
                questionnaireAvg[qa] = parseFloat(questionnaireAvg[qa].toFixed(1));
            }
        }
        const weights = yield (0, fund_2.getWeights)(fundId);
        const weightedPoints = (0, rating_1.getWeightedPoints)(questionnaireAvg, weights);
        let wp;
        for (wp in weightedPoints) {
            if (Object.prototype.hasOwnProperty.call(weightedPoints, wp)) {
                weightedPoints[wp] = parseFloat(weightedPoints[wp].toFixed(1));
            }
        }
        const rating = (0, rating_1.getAllRatings)(questionnaireAvg);
        let r;
        for (r in rating) {
            if (Object.prototype.hasOwnProperty.call(rating, r)) {
                rating[r] = parseFloat(rating[r].toFixed(2));
            }
        }
        const ratingTotal = parseFloat((18 - (17 * weightedPoints.sum) / (weights.sum * 5)).toFixed(2));
        yield (0, fund_startup_map_1.updateRatingTotal)(ratingTotal, startupId, fundId);
        const weightedRating = {
            questionnaire,
            questionnaireAvg,
            weights,
            weightedPoints,
            rating,
            ratingTotal,
        };
        res.render("dashboard/fund/rating", {
            layout: "../views/layouts/dashboard.ejs",
            dashboard: "fund",
            scripts: ["/js/rating"],
            title: req.startupName,
            name: ((_p = req.user) === null || _p === void 0 ? void 0 : _p.firstName) + " " + ((_q = req.user) === null || _q === void 0 ? void 0 : _q.lastName),
            startup: req.session.selectedStartup,
            weightedRating: weightedRating,
            page: "rating",
        });
    }
    catch (error) {
        console.error(`Failed to fetch startup request data for startup with id ${startupId} due to:\n${error}.\nRedirecting to fund dashboard.`);
        res.redirect("/fund/");
    }
}));
router.post("/update-weights", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { weights } = req.body;
    const newWeights = weights;
    const fundId = req.session.fundId;
    try {
        yield (0, fund_2.updateWeights)(fundId, newWeights);
        res.redirect("/fund/startup/rating");
    }
    catch (error) {
        console.error(`Failed to update weights for fund with id ${fundId} due to: ${error}. Redirect to login screen.`);
        res.redirect("/");
    }
}));
router.get("/chart/data", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const startupId = req.session.selectedStartup;
        const milestones = yield (0, startup_1.getMilestones)(startupId);
        const metrics = yield (0, startup_1.getMetrics)(startupId);
        const months = metrics.map((x) => {
            return (0, date_1.getMonth)(x.date);
        });
        const burnRate = metrics.map((x) => {
            return x.burnRate;
        });
        const cashRunway = metrics.map((x) => {
            return x.cashRunway;
        });
        const liquidity = metrics.map((x) => {
            return x.liquidity;
        });
        const chartData = {
            milestones,
            burnRate: {
                months,
                periodData: burnRate,
            },
            cashRunway: {
                months,
                periodData: cashRunway,
            },
            liquidity: {
                months,
                periodData: liquidity,
            },
        };
        res.status(200).json(chartData);
    }
    catch (error) {
        res.status(200).json([]);
    }
}));
exports.default = router;
