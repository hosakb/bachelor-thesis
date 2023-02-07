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
const startup_1 = require("../models/startup");
const date_1 = require("../util/date");
const excel_1 = require("../util/excel");
const router = express_1.default.Router();
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    const startupId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.startup;
    if (startupId === undefined) {
        if (((_b = req.user) === null || _b === void 0 ? void 0 : _b.fund) !== undefined) {
            console.info(`Redirecting user ${(_c = req.user) === null || _c === void 0 ? void 0 : _c.id} to fund screen since no startup id is assigned.`);
            res.redirect("/startup");
        }
        else {
            console.info(`Redirecting user ${(_d = req.user) === null || _d === void 0 ? void 0 : _d.id} to login screen since no fund id or startup id are assigned.`);
            res.redirect("/");
        }
    }
    else {
        try {
            const trl = yield (0, startup_1.getTrl)(startupId);
            res.render("dashboard/startup/index", {
                layout: "../views/layouts/dashboard.ejs",
                dashboard: "startup",
                scripts: [
                    "/js/gantt/frappe-gantt.min",
                    "/js/chart/chart.min",
                    "/js/startup",
                ],
                phase: yield (0, startup_1.getInvestmentPhase)(startupId),
                kpis: req.kpis,
                page: "dashboard",
                title: yield (0, startup_1.getStartupNameById)(startupId),
                name: ((_e = req.user) === null || _e === void 0 ? void 0 : _e.firstName) + " " + ((_f = req.user) === null || _f === void 0 ? void 0 : _f.lastName),
                trl: trl,
                investors: yield (0, startup_1.getInvestors)(startupId),
            });
        }
        catch (error) {
            console.error(`Failed to fetch startup data for startup with id ${startupId} due to:\n${error}.\nRedirecting to login screen.`);
            res.redirect("/");
        }
    }
}));
router.get("/chart/data", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const milestones = yield (0, startup_1.getMilestones)(req.session.startupId);
        const metrics = yield (0, startup_1.getMetrics)(req.session.startupId);
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
router.put("/gantt/period", (req) => __awaiter(void 0, void 0, void 0, function* () {
    const { taskId, start, end } = req.body;
    try {
        yield (0, startup_1.updateMilestoneDuration)(taskId, start, end);
    }
    catch (error) {
        console.error(`Failed to update Milestone duration due to ${error}.`);
    }
}));
router.put("/gantt/progress", (req) => __awaiter(void 0, void 0, void 0, function* () {
    const { taskId, progress } = req.body;
    try {
        yield (0, startup_1.updateMilestoneProgress)(taskId, progress);
    }
    catch (error) {
        console.error(`Failed to update Milestone progress due to ${error}.`);
    }
}));
// =============================== Submit =====================================
router.get("/submit", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _g, _h;
    const trl = yield (0, startup_1.getTrl)(req.session.startupId);
    req.session.trl = trl;
    const investors = yield (0, startup_1.getInvestors)(req.session.startupId);
    req.session.investors = investors;
    const startupName = yield (0, startup_1.getStartupNameById)(req.session.startupId);
    req.session.startupName = startupName;
    const investmentPhase = yield (0, startup_1.getInvestmentPhase)(req.session.startupId);
    req.session.phase = investmentPhase;
    const milestones = yield (0, startup_1.getMilestones)(req.session.startupId);
    req.session.milestones = milestones;
    const capTable = yield (0, startup_1.getCapTable)(req.session.startupId);
    const patents = yield (0, startup_1.getAllPatents)(req.session.startupId);
    res.render("dashboard/startup/submit", {
        layout: "../views/layouts/dashboard.ejs",
        dashboard: "startup",
        scripts: ["/js/submit"],
        page: "submit",
        title: startupName,
        name: ((_g = req.user) === null || _g === void 0 ? void 0 : _g.firstName) + " " + ((_h = req.user) === null || _h === void 0 ? void 0 : _h.lastName),
        trl: trl,
        investors,
        milestones,
        capTable,
        investmentPhase,
        patents,
    });
}));
router.post("/submit/reupload", (req, res) => {
    (0, excel_1.deleteSpreadsheets)();
    res.redirect("/startup/submit");
});
router.post("/cap-table", excel_1.multerUpload.single("cap-table"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _j;
    const { nextPhase, investedCapital } = req.body;
    try {
        yield (0, startup_1.updateInvestmentPhase)(req.session.startupId, nextPhase);
        yield (0, startup_1.updateInvestedCapital)(req.session.startupId, parseInt(investedCapital));
        const rows = yield (0, excel_1.uploadCapTable)();
        const capTable = (0, excel_1.formatCapTable)(rows);
        const startupId = (_j = req.user) === null || _j === void 0 ? void 0 : _j.startup;
        if (startupId == undefined) {
            throw new Error("Failed to fetch startup id.");
        }
        yield (0, startup_1.persistCapTable)(JSON.stringify(capTable), startupId);
        res.redirect("/startup/submit");
        return;
    }
    catch (error) {
        console.error(`The following error occurred during upload of a cap table. Redirecting to /startup/submit ${error}`);
        res.redirect("/startup/submit");
    }
}));
router.post("/submit/update-trl", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, technology, trl, criticality } = req.body.trlData;
    try {
        const trlData = {
            id,
            technology,
            trl,
            criticality,
        };
        yield (0, startup_1.updateTrl)(trlData);
    }
    catch (error) {
        console.error(`The following error occurred during update of a technology trl with id ${id}. Redirecting to /startup/submit ${error}`);
        res.redirect("/startup/submit");
    }
}));
router.post("/submit/delete-trl", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body.id;
    try {
        yield (0, startup_1.deleteTrl)(id);
    }
    catch (error) {
        console.error(`The following error occurred during deletion of a technology trl with id ${id}. Redirecting to /startup/submit ${error}`);
        res.redirect("/startup/submit");
    }
}));
router.post("/submit/add-trl", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { newTechnology, newTrlValue, newCriticality } = req.body;
    try {
        const trlData = {
            id: "",
            technology: newTechnology,
            trl: newTrlValue,
            criticality: newCriticality,
        };
        yield (0, startup_1.persistTrlData)(req.session.startupId, [trlData]);
        res.redirect("/startup/submit");
    }
    catch (error) {
        console.error(`Failed to persist new trl startup with id ${req.session.startupId}. Error: ${error}. Redirecting to /startup/submit `);
        res.redirect("/startup/submit");
    }
}));
router.post("/submit/new-investor", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, type, email, number, url, country, notes, contactDate } = req.body;
    try {
        const newInvestor = {
            name,
            type,
            email,
            number,
            url,
            country,
            notes,
            contactDate,
            startupId: req.session.startupId,
        };
        yield (0, startup_1.insertInvestor)(newInvestor);
        res.status(200).json();
    }
    catch (error) {
        console.error(`Failed to add new investors contact to startup with id ${req.session.startupId}. Error: ${error}. Redirecting to /startup/submit ${error}`);
        res.status(500).json();
        res.redirect("/startup/submit");
    }
}));
router.post("/submit/update-investor-status", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, status } = req.body;
    try {
        yield (0, startup_1.updateInvestorStatus)(status, id);
        res.status(200).json();
    }
    catch (error) {
        console.error(`Failed to update investors status. Error: ${error}. Redirecting to /startup/submit ${error}`);
        res.redirect("/startup/submit");
    }
}));
router.post("/submit/add-milestone", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { milestones } = req.body;
    const unIndexedMilestones = milestones;
    try {
        const existingMilestones = yield (0, startup_1.getMilestones)(req.session.startupId);
        const joinedMilestones = unIndexedMilestones.concat(existingMilestones.map((existingMilestone) => {
            return {
                name: existingMilestone.name,
                start: existingMilestone.start,
                end: existingMilestone.end,
                progress: existingMilestone.progress,
            };
        }));
        const indexedMilestones = joinedMilestones
            .sort((a, b) => {
            return new Date(b.start).getTime() - new Date(a.start).getTime();
        })
            .reverse()
            .map((m, index) => {
            return Object.assign({ index }, m);
        });
        yield (0, startup_1.persistMilestones)(indexedMilestones, req.session.startupId);
        res.status(200).json();
    }
    catch (error) {
        console.error(`Failed to persist milestone. Error: ${error}. Redirecting to /startup/submit ${error}`);
        res.redirect("/startup/submit");
    }
}));
router.post("/submit/delete-milestone", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    try {
        const existingMilestones = yield (0, startup_1.getMilestones)(req.session.startupId);
        const indexedMilestones = existingMilestones
            .filter((m) => m.id != id)
            .sort((a, b) => {
            return new Date(b.start).getTime() - new Date(a.start).getTime();
        })
            .reverse()
            .map((m, index) => {
            return {
                id: m.id,
                index,
                name: m.name,
                start: m.start,
                end: m.end,
                progress: m.progress,
            };
        });
        yield (0, startup_1.persistMilestonesWithId)(indexedMilestones, req.session.startupId);
        res.status(200).json();
    }
    catch (error) {
        console.error(`Failed to delete milestone. Error: ${error}. Redirecting to /startup/submit ${error}`);
        res.redirect("/startup/submit");
    }
}));
router.post("/submit/update-milestone", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, name, start, end, progress } = req.body;
    try {
        const existingMilestones = yield (0, startup_1.getMilestones)(req.session.startupId);
        for (const m of existingMilestones) {
            if (m.id == id) {
                m.name = name;
                m.start = start;
                m.end = end;
                m.progress = progress;
            }
        }
        const indexedMilestones = existingMilestones
            .sort((a, b) => {
            return new Date(b.start).getTime() - new Date(a.start).getTime();
        })
            .reverse()
            .map((m, index) => {
            return {
                id: m.id,
                index,
                name: m.name,
                start: m.start,
                end: m.end,
                progress: m.progress,
            };
        });
        yield (0, startup_1.persistMilestonesWithId)(indexedMilestones, req.session.startupId);
        res.status(200).json();
    }
    catch (error) {
        console.error(`Failed to update milestone with id ${id}. Error: ${error}. Redirecting to /startup/submit ${error}`);
        res.redirect("/startup/submit");
    }
}));
router.post("/submit/new-patent", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { invention, newInventor, patentStatus, patentConfirmationDate, patentOffice, patentExaminationNoticeDate, patentGrantDate, patentDuration, } = req.body;
    let newPatent;
    try {
        if (patentConfirmationDate === "" &&
            patentExaminationNoticeDate === "" &&
            patentGrantDate === "") {
            newPatent = {
                invention,
                newInventor,
                patentStatus,
                patentConfirmationDate: undefined,
                patentExaminationNoticeDate: undefined,
                patentGrantDate: undefined,
                patentOffice,
                patentDuration: undefined,
            };
        }
        else if (patentConfirmationDate !== "" &&
            patentExaminationNoticeDate === "" &&
            patentGrantDate === "") {
            newPatent = {
                invention,
                newInventor,
                patentStatus,
                patentConfirmationDate: new Date(patentConfirmationDate),
                patentExaminationNoticeDate: undefined,
                patentGrantDate: undefined,
                patentOffice,
                patentDuration: undefined,
            };
        }
        else if (patentConfirmationDate === "" &&
            patentExaminationNoticeDate !== "" &&
            patentGrantDate === "") {
            newPatent = {
                invention,
                newInventor,
                patentStatus,
                patentConfirmationDate: undefined,
                patentExaminationNoticeDate: new Date(patentExaminationNoticeDate),
                patentGrantDate: undefined,
                patentOffice,
                patentDuration: undefined,
            };
        }
        else if (patentConfirmationDate === "" &&
            patentExaminationNoticeDate === "" &&
            patentGrantDate !== "") {
            newPatent = {
                invention,
                newInventor,
                patentStatus,
                patentConfirmationDate: undefined,
                patentExaminationNoticeDate: undefined,
                patentGrantDate: new Date(patentGrantDate),
                patentOffice,
                patentDuration,
            };
        }
        else {
            throw new Error("Unknown Patent status.");
        }
        yield (0, startup_1.insertNewPatent)(newPatent, req.session.startupId);
        res.redirect("/startup/submit");
    }
    catch (error) {
        console.error(`Failed to add new Patent. Error: ${error}. Redirecting to /startup/submit ${error}`);
        res.redirect("/startup/submit");
    }
}));
router.post("/submit/update-patent", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { disclosurePatentId, patentStatus, submissionFeeDeadline, annualFeeDeadline, inventorNominationDeadline, examinationRequestDeadline, examinationNoticeDeadline, grantFeeDeadline, objectionFilingDeadline, objectionResponseDeadline, } = req.body;
    let p;
    try {
        if (disclosurePatentId === undefined || disclosurePatentId === '' || patentStatus === undefined || patentStatus === '') {
            throw new Error("Patent or Status not identifiable.");
        }
        else if (patentStatus === "disclosure-phase") {
            p = {
                id: disclosurePatentId,
                registrationFee: submissionFeeDeadline === "on" ? true : false,
                annualFee: annualFeeDeadline === "on" ? true : false,
                inventorNomination: inventorNominationDeadline === "on" ? true : false,
                examinationRequest: examinationRequestDeadline === "on" ? true : false,
            };
        }
        else if (patentStatus === "examination-phase") {
            p = {
                id: disclosurePatentId,
                patentExaminationNotice: examinationNoticeDeadline === "on" ? true : false,
            };
        }
        else if (patentStatus === "objection-phase") {
            p = {
                id: disclosurePatentId,
                grantFee: grantFeeDeadline === "on" ? true : false,
                objection: objectionFilingDeadline === "on" ? true : false,
                objectionResponse: objectionResponseDeadline === "on" ? true : false,
            };
        }
        else {
            throw new Error("Phase not identifiable");
        }
        yield (0, startup_1.updatePatent)(p);
        res.redirect("/startup/submit");
    }
    catch (error) {
        console.error(`Failed to update patent information. Error: ${error}. Redirecting to /startup/submit ${error}`);
        res.redirect("/startup/submit");
    }
}));
router.post("/submit/initial-patent-application", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { patentId, confirmationDate } = req.body;
    try {
        yield (0, startup_1.persistPatentConfirmationDate)(patentId, new Date(confirmationDate));
        res.redirect("/startup/submit");
    }
    catch (error) {
        console.error(`Failed to update patent information. Error: ${error}. Redirecting to /startup/submit ${error}`);
        res.redirect("/startup/submit");
    }
}));
exports.default = router;
