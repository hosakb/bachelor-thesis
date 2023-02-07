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
exports.updateTrl = exports.updateStartupName = exports.updatePatent = exports.updateMilestoneProgress = exports.updateMilestoneDuration = exports.updateInvestorStatus = exports.updateInvestor = exports.updateInvestmentPhase = exports.updateInvestedCapital = exports.persistTrlData = exports.persistQuestionnaire = exports.persistPatentConfirmationDate = exports.persistMilestonesWithId = exports.persistMilestones = exports.persistInfo = exports.persistCoreTechnology = exports.persistCapTable = exports.insertNewStartup = exports.insertNewPatent = exports.insertInvestor = exports.getTrlAvailable = exports.getTrl = exports.getStartupTableRowById = exports.getStartups = exports.getStartupNameById = exports.getStartupIds = exports.getQuestionnaireFilledOut = exports.getQuestionnaire = exports.getNewStartupById = exports.getMilestones = exports.getMetrics = exports.getInvestors = exports.getInvestmentPhase = exports.getInfoByStartupId = exports.getFirstStartupLoginById = exports.getCapTable = exports.getAllStartups = exports.getAllPatents = exports.deleteTrl = exports.deleteStartup = exports.InvestmentPhase = void 0;
const db_1 = __importDefault(require("../config/db"));
const trl_1 = require("../util/calc/trl");
var InvestmentPhase;
(function (InvestmentPhase) {
    InvestmentPhase["Seed"] = "seed";
    InvestmentPhase["Startup"] = "startup";
    InvestmentPhase["FirstStage"] = "first_stage";
    InvestmentPhase["SecondStage"] = "second_stage";
    InvestmentPhase["ThirdStage"] = "third_stage";
    InvestmentPhase["Final"] = "final";
})(InvestmentPhase || (InvestmentPhase = {}));
exports.InvestmentPhase = InvestmentPhase;
function isUpdatedPatentDisclosure(value) {
    return (
    // eslint-disable-next-line no-prototype-builtins
    value.hasOwnProperty("registrationFee") &&
        // eslint-disable-next-line no-prototype-builtins
        value.hasOwnProperty("annualFee") &&
        // eslint-disable-next-line no-prototype-builtins
        value.hasOwnProperty("inventorNomination") &&
        // eslint-disable-next-line no-prototype-builtins
        value.hasOwnProperty("examinationRequest"));
}
function isUpdatedPatentExamination(value) {
    // eslint-disable-next-line no-prototype-builtins
    return value.hasOwnProperty("patentExaminationNotice");
}
function isUpdatedPatentObjection(value) {
    return (
    // eslint-disable-next-line no-prototype-builtins
    value.hasOwnProperty("grantFee") &&
        // eslint-disable-next-line no-prototype-builtins
        value.hasOwnProperty("objection") &&
        // eslint-disable-next-line no-prototype-builtins
        value.hasOwnProperty("objectionResponse"));
}
const insertNewStartup = (startupName) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
        const result = yield client.query(`INSERT INTO startup (name) VALUES ($1) RETURNING id;`, [startupName]);
        if (result.rows[0].id == undefined || result.rows[0].id == null) {
            throw new Error(`Expected value for id after inserting. Received ${result.rows[0].id}.`);
        }
        return result.rows[0].id;
    }
    catch (err) {
        throw new Error(`Failed insert new startup. Error: ${err}`);
    }
    finally {
        client.release();
    }
});
exports.insertNewStartup = insertNewStartup;
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
const getFirstStartupLoginById = (startUpId) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    let result;
    try {
        result = yield client.query(`SELECT cap_table FROM startup
      WHERE id = $1`, [startUpId]);
        if (result.rowCount === 0) {
            throw new Error("No startup found for id: " + startUpId);
        }
    }
    catch (err) {
        throw new Error(`  "Failed query for first login for startup with email: ${startUpId}. Error:  ${err}`);
    }
    finally {
        client.release();
    }
    if (result.rows[0].cap_table == null) {
        return true;
    }
    else {
        return false;
    }
});
exports.getFirstStartupLoginById = getFirstStartupLoginById;
const getNewStartupById = (startupId) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    let result;
    try {
        result = yield client.query("SELECT id, name FROM startup WHERE id=$1", [
            startupId,
        ]);
    }
    catch (err) {
        throw new Error(`Failed to query new Startup. Error: ${err}`);
    }
    finally {
        client.release();
    }
    const { id, name } = result.rows[0];
    const s = {
        id,
        name: name,
    };
    return s;
});
exports.getNewStartupById = getNewStartupById;
const getStartupTableRowById = (startupId) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    let result;
    try {
        result = yield client.query("SELECT id, name, stage, invested_capital, sector FROM startup WHERE id=$1", [startupId]);
    }
    catch (err) {
        throw new Error(`Failed to query startup infos. Error: ${err}`);
    }
    finally {
        client.release();
    }
    const { id, name, stage, invested_capital, sector } = result.rows[0];
    const s = {
        id,
        name: name,
        stage: stage,
        sector: sector,
        totalInvestment: invested_capital,
    };
    return s;
});
exports.getStartupTableRowById = getStartupTableRowById;
const getStartups = () => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    let result;
    try {
        result = yield client.query("SELECT id, name, stage FROM startup");
    }
    catch (err) {
        throw new Error(`Failed to fetch all startups due to the following error: ${err}`);
    }
    finally {
        client.release();
    }
    if (result.rowCount === 0) {
        throw new Error(`No startups found found in db.`);
    }
    const startups = result.rows.map((row) => {
        return { id: row.id, name: row.name, stage: row.stage };
    });
    return startups;
});
exports.getStartups = getStartups;
const getAllStartups = () => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
        const result = yield client.query("SELECT id, name, stage, created_at, updated_at  FROM startup");
        return result.rows.map((startup) => {
            return {
                id: startup.id,
                name: startup.name,
                stage: startup.stage,
                createdAt: startup.created_at,
                updatedAt: startup.updated_at,
            };
        });
    }
    catch (err) {
        throw new Error(`Failed to fetch all startups due to the following error: ${err}`);
    }
    finally {
        client.release();
    }
});
exports.getAllStartups = getAllStartups;
const getStartupNameById = (startupId) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    let result;
    try {
        result = yield client.query("SELECT name FROM startup WHERE id = $1", [
            startupId,
        ]);
        if (result.rowCount === 0) {
            throw new Error(`No startups found found for id ${startupId}.`);
        }
    }
    catch (err) {
        throw new Error(`Failed to query startup with id ${startupId} due to the following error: ${err}`);
    }
    finally {
        client.release();
    }
    return result.rows[0].name;
});
exports.getStartupNameById = getStartupNameById;
const getInvestmentPhase = (startupId) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    let result;
    try {
        result = yield client.query("SELECT stage FROM startup WHERE id=$1", [
            startupId,
        ]);
    }
    catch (err) {
        throw new Error(`Failed to query investment phase for startup id ${startupId}. Error: ${err}`);
    }
    finally {
        client.release();
    }
    const phase = result.rows[0].stage;
    return phase;
});
exports.getInvestmentPhase = getInvestmentPhase;
const updateInvestmentPhase = (startupId, investmentPhase) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
        yield client.query("UPDATE startup set stage = $1 where id = $2", [
            investmentPhase,
            startupId,
        ]);
    }
    catch (err) {
        throw new Error(`Failed to update investment phase for startup id ${startupId}. Error: ${err}`);
    }
    finally {
        client.release();
    }
});
exports.updateInvestmentPhase = updateInvestmentPhase;
const updateInvestedCapital = (startupId, investedCapital) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
        yield client.query("UPDATE startup set invested_capital = $1 where id = $2", [investedCapital, startupId]);
    }
    catch (err) {
        throw new Error(`Failed to update invested capital for startup id ${startupId}. Error: ${err}`);
    }
    finally {
        client.release();
    }
});
exports.updateInvestedCapital = updateInvestedCapital;
const persistCapTable = (capTable, startupId) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
        yield client.query("UPDATE startup SET cap_table = $1 WHERE id = $2", [
            capTable,
            startupId,
        ]);
    }
    catch (err) {
        throw new Error(`Failed to persist cap table for startup id ${startupId}. Error: ${err}`);
    }
    finally {
        client.release();
    }
});
exports.persistCapTable = persistCapTable;
const updateStartupName = (name, startupId) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
        yield client.query("UPDATE startup SET name = $1 WHERE id = $2", [
            name,
            startupId,
        ]);
    }
    catch (err) {
        throw new Error(`Failed to update startup name for startup id ${startupId}. Error: ${err}`);
    }
    finally {
        client.release();
    }
});
exports.updateStartupName = updateStartupName;
const getCapTable = (startupId) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    let result;
    try {
        result = yield client.query("SELECT cap_table FROM startup WHERE id = $1", [
            startupId,
        ]);
    }
    catch (err) {
        throw new Error(`Failed to fetch cap table for startup id ${startupId}. Error: ${err}`);
    }
    finally {
        client.release();
    }
    const capTable = result.rows[0].cap_table;
    return capTable;
});
exports.getCapTable = getCapTable;
const persistInfo = (startupInfo, startupId) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
        yield client.query("UPDATE startup SET stage = $1, invested_capital = $2, sector = $3, has_product = $4 , est_time_to_market = $5 WHERE id = $6", [
            startupInfo.phase,
            startupInfo.investedCapital,
            startupInfo.sector,
            startupInfo.productToMarket,
            startupInfo.timeToMarket,
            startupId,
        ]);
    }
    catch (err) {
        throw new Error(`Failed to persist startup info for startup id ${startupId}. Error: ${err}`);
    }
    finally {
        client.release();
    }
});
exports.persistInfo = persistInfo;
const getInfoByStartupId = (startupId) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    let result;
    try {
        result = yield client.query("SELECT info FROM startup WHERE id = $1", [
            startupId,
        ]);
    }
    catch (err) {
        throw new Error(`Failed to query startup info for startup id ${startupId}. Error: ${err}`);
    }
    finally {
        client.release();
    }
    const info = result.rows[0].info;
    return info;
});
exports.getInfoByStartupId = getInfoByStartupId;
const persistMilestones = (milestones, startupId) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
        yield client.query("DELETE FROM milestones WHERE startup_id = $1;", [
            startupId,
        ]);
        for (const milestone of milestones) {
            yield client.query("INSERT INTO milestones (start_date, end_date, progress, startup_id, name, index) VALUES ($1, $2, $3, $4, $5, $6)", [
                milestone.start,
                milestone.end,
                milestone.progress,
                startupId,
                milestone.name,
                milestone.index,
            ]);
        }
    }
    catch (err) {
        throw new Error(`Failed to insert startup milestones for startup id ${startupId}. Error: ${err}`);
    }
    finally {
        client.release();
    }
});
exports.persistMilestones = persistMilestones;
const persistMilestonesWithId = (milestones, startupId) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
        yield client.query("DELETE FROM milestones WHERE startup_id = $1;", [
            startupId,
        ]);
        for (const milestone of milestones) {
            yield client.query("INSERT INTO milestones (id, start_date, end_date, progress, startup_id, name, index) VALUES ($1, $2, $3, $4, $5, $6, $7)", [
                milestone.id,
                milestone.start,
                milestone.end,
                milestone.progress,
                startupId,
                milestone.name,
                milestone.index,
            ]);
        }
    }
    catch (err) {
        throw new Error(`Failed to insert startup milestones for startup id ${startupId}. Error: ${err}`);
    }
    finally {
        client.release();
    }
});
exports.persistMilestonesWithId = persistMilestonesWithId;
const getMilestones = (startupId) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    let result;
    try {
        result = yield client.query("SELECT id, name, start_date, end_date, progress, index FROM milestones WHERE startup_id = $1", [startupId]);
    }
    catch (err) {
        throw new Error(`Failed to query milestones for startup id ${startupId}. Error: ${err}`);
    }
    finally {
        client.release();
    }
    const milestones = result.rows.map((row) => {
        return {
            id: row.id,
            index: row.index,
            name: row.name,
            start: row.start_date,
            end: row.end_date,
            progress: row.progress,
        };
    });
    return milestones;
});
exports.getMilestones = getMilestones;
const updateMilestoneProgress = (taskId, progress) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
        yield client.query("UPDATE milestones SET progress = $1 WHERE id = $2", [
            progress,
            taskId,
        ]);
    }
    catch (err) {
        throw new Error(`Failed to update milestones progress with id ${taskId}. Error: ${err}`);
    }
    finally {
        client.release();
    }
});
exports.updateMilestoneProgress = updateMilestoneProgress;
const updateMilestoneDuration = (taskId, start, end) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
        yield client.query("UPDATE milestones SET start_date = $1, end_date = $2 WHERE id = $3", [start, end, taskId]);
    }
    catch (err) {
        throw new Error(`Failed to update milestone with id ${taskId}. Error: ${err}`);
    }
    finally {
        client.release();
    }
});
exports.updateMilestoneDuration = updateMilestoneDuration;
const getTrlAvailable = (startupId) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    let result;
    try {
        result = yield client.query("SELECT id FROM trl WHERE startup_id = $1;", [
            startupId,
        ]);
    }
    catch (err) {
        throw new Error(`Failed to query availability of trl data for startup with id ${startupId}. Error: ${err}`);
    }
    finally {
        client.release();
    }
    if (result.rowCount == 0) {
        return false;
    }
    return true;
});
exports.getTrlAvailable = getTrlAvailable;
const getTrl = (startupId) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    let result;
    try {
        result = yield client.query("SELECT startup.product, trl.id, trl.technology, trl.trl, trl.criticality FROM trl JOIN startup ON trl.startup_id = startup.id WHERE startup.id = $1;", [startupId]);
    }
    catch (err) {
        throw new Error(`Failed to query trl data for startup with id ${startupId}. Error: ${err}`);
    }
    finally {
        client.release();
    }
    const trlData = result.rows.map((trl) => {
        return {
            id: trl.id,
            technology: trl.technology,
            trl: trl.trl,
            criticality: trl.criticality,
        };
    });
    const trl = {
        product: result.rows[0].product,
        trlProd: (0, trl_1.calcTrlProd)(trlData),
        trlData: trlData,
    };
    return trl;
});
exports.getTrl = getTrl;
const persistTrlData = (startupId, trlData) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
        for (const trl of trlData) {
            yield client.query("INSERT INTO trl (technology, trl, criticality, startup_id) VALUES ($1, $2, $3, $4);", [trl.technology, trl.trl, trl.criticality, startupId]);
        }
    }
    catch (err) {
        throw new Error(`Failed to persist trl data for startup with id ${startupId}. Error: ${err}`);
    }
    finally {
        client.release();
    }
});
exports.persistTrlData = persistTrlData;
const persistCoreTechnology = (startupId, product) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
        yield client.query("UPDATE startup SET product = $1 WHERE id = $2;", [
            product,
            startupId,
        ]);
    }
    catch (err) {
        throw new Error(`Failed to persist product for startup with id ${startupId}. Error: ${err}`);
    }
    finally {
        client.release();
    }
});
exports.persistCoreTechnology = persistCoreTechnology;
const updateTrl = (trlData) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
        yield client.query("UPDATE trl SET technology = $1, trl = $2, criticality = $3 WHERE id = $4;", [trlData.technology, trlData.trl, trlData.criticality, trlData.id]);
    }
    catch (err) {
        throw new Error(`${err}`);
    }
    finally {
        client.release();
    }
});
exports.updateTrl = updateTrl;
const deleteTrl = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
        yield client.query("DELETE FROM trl WHERE id = $1;", [id]);
    }
    catch (err) {
        throw new Error(`Failed to delete trl with id ${id}. Error: ${err}`);
    }
    finally {
        client.release();
    }
});
exports.deleteTrl = deleteTrl;
const deleteStartup = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
        yield client.query("DELETE FROM startup WHERE id = $1;", [id]);
    }
    catch (err) {
        throw new Error(`Failed to delete startup with id ${id}. Error: ${err}`);
    }
    finally {
        client.release();
    }
});
exports.deleteStartup = deleteStartup;
const persistQuestionnaire = (startupId, questionnaire) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
        yield client.query("UPDATE startup SET questionnaire = $1 WHERE id = $2;", [
            JSON.stringify(questionnaire),
            startupId,
        ]);
    }
    catch (err) {
        throw new Error(`Failed to persist questionnaire data for startup with id ${startupId}. Error: ${err}`);
    }
    finally {
        client.release();
    }
});
exports.persistQuestionnaire = persistQuestionnaire;
const getQuestionnaire = (startupId) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    let result;
    try {
        result = yield client.query("SELECT questionnaire FROM startup WHERE id = $1;", [startupId]);
    }
    catch (err) {
        throw new Error(`Failed to query questionnaire data for startup with id ${startupId}. Error: ${err}`);
    }
    finally {
        client.release();
    }
    return result.rows[0].questionnaire;
});
exports.getQuestionnaire = getQuestionnaire;
const getQuestionnaireFilledOut = (startupId) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    let result;
    try {
        result = yield client.query("SELECT questionnaire FROM startup WHERE id = $1;", [startupId]);
    }
    catch (err) {
        throw new Error(`Failed to query questionnaire data for startup with id ${startupId}. Error: ${err}`);
    }
    finally {
        client.release();
    }
    if (result.rows[0].questionnaire == undefined) {
        return false;
    }
    else {
        return true;
    }
});
exports.getQuestionnaireFilledOut = getQuestionnaireFilledOut;
const getMetrics = (startupId) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    let result;
    try {
        result = yield client.query("SELECT date, burn_rate, cash_runway, liquidity FROM metrics WHERE startup = $1;", [startupId]);
    }
    catch (err) {
        throw new Error(`Failed to query metrics data for startup with id ${startupId}. Error: ${err}`);
    }
    finally {
        client.release();
    }
    const metrics = result.rows.map((row) => {
        return {
            date: row.date,
            burnRate: row.burn_rate,
            cashRunway: row.cash_runway,
            liquidity: row.liquidity,
        };
    });
    return metrics;
});
exports.getMetrics = getMetrics;
const insertInvestor = (investor) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
        yield client.query("INSERT INTO investors (name, type, email, number, url, country, notes, contact_date, startup_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)", [
            investor.name,
            investor.type,
            investor.email,
            investor.number,
            investor.url,
            investor.country,
            investor.notes,
            investor.contactDate,
            investor.startupId,
        ]);
    }
    catch (err) {
        throw new Error(`Failed to persist contacted investor startup with id ${investor.startupId}. Error: ${err}`);
    }
    finally {
        client.release();
    }
});
exports.insertInvestor = insertInvestor;
const getInvestors = (startupId) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
        const result = yield client.query("SELECT id, name, type, email, number, url, country, notes, contact_date, startup_id, status FROM investors WHERE startup_id = $1;", [startupId]);
        const investors = result.rows.map((row) => {
            return {
                id: row.id,
                name: row.name,
                type: row.type,
                email: row.email,
                number: row.number,
                url: row.url,
                country: row.country,
                notes: row.notes,
                contactDate: row.contact_date,
                status: row.status,
            };
        });
        return investors;
    }
    catch (err) {
        throw new Error(`Failed to contacted investors for startup with id ${startupId}. Error: ${err}`);
    }
    finally {
        client.release();
    }
});
exports.getInvestors = getInvestors;
const updateInvestor = (updatedInvestor) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
        yield client.query("UPDATE investors SET email = $1, number = $2, url = $3, notes = $4  WHERE id = $5;", [
            updatedInvestor.email,
            updatedInvestor.notes,
            updatedInvestor.url,
            updatedInvestor.notes,
            updatedInvestor.id,
        ]);
    }
    catch (err) {
        throw new Error(`Failed to update contacted investors for with id ${updatedInvestor.id}. Error: ${err}`);
    }
    finally {
        client.release();
    }
});
exports.updateInvestor = updateInvestor;
const updateInvestorStatus = (status, id) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
        yield client.query("UPDATE investors SET status = $1 WHERE id = $2;", [
            status,
            id,
        ]);
    }
    catch (err) {
        throw new Error(`Failed to update contacted investors status with id ${id}. Error: ${err}`);
    }
    finally {
        client.release();
    }
});
exports.updateInvestorStatus = updateInvestorStatus;
const insertNewPatent = (patent, startupId) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
        if (patent.patentConfirmationDate === undefined &&
            patent.patentExaminationNoticeDate === undefined &&
            patent.patentGrantDate === undefined) {
            yield client.query("INSERT INTO patents (invention, inventor, status, patent_office, startup_id) VALUES ($1, $2, $3, $4, $5)", [
                patent.invention,
                patent.newInventor,
                patent.patentStatus,
                patent.patentOffice,
                startupId,
            ]);
        }
        else if (patent.patentConfirmationDate !== undefined &&
            patent.patentExaminationNoticeDate === undefined &&
            patent.patentGrantDate === undefined) {
            yield client.query("INSERT INTO patents (invention, inventor, status, patent_office, application_confirmation_date, startup_id) VALUES ($1, $2, $3, $4, $5, $6)", [
                patent.invention,
                patent.newInventor,
                patent.patentStatus,
                patent.patentOffice,
                patent.patentConfirmationDate,
                startupId,
            ]);
        }
        else if (patent.patentConfirmationDate === undefined &&
            patent.patentExaminationNoticeDate !== undefined &&
            patent.patentGrantDate === undefined) {
            yield client.query("INSERT INTO patents (invention, inventor, status, patent_office, patent_examination_notice_date, startup_id) VALUES ($1, $2, $3, $4, $5, $6)", [
                patent.invention,
                patent.newInventor,
                patent.patentStatus,
                patent.patentOffice,
                patent.patentExaminationNoticeDate,
                startupId,
            ]);
        }
        else if (patent.patentConfirmationDate === undefined &&
            patent.patentExaminationNoticeDate === undefined &&
            patent.patentGrantDate !== undefined) {
            yield client.query("INSERT INTO patents (invention, inventor, status, patent_office, grant_date, patent_duration, startup_id) VALUES ($1, $2, $3, $4, $5, $6, $7)", [
                patent.invention,
                patent.newInventor,
                patent.patentStatus,
                patent.patentOffice,
                patent.patentGrantDate,
                patent.patentDuration,
                startupId,
            ]);
        }
        else {
            throw new Error("Unknown Patent Status");
        }
    }
    catch (err) {
        throw new Error(`Failed to insert new patent for startup with id: ${startupId}. Error: ${err}`);
    }
    finally {
        client.release();
    }
});
exports.insertNewPatent = insertNewPatent;
const getAllPatents = (startupId) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
        const result = yield client.query("SELECT * FROM patents WHERE startup_id = $1;", [startupId]);
        return result.rows.map((row) => {
            return {
                id: row.id,
                invention: row.invention,
                inventor: row.inventor,
                status: row.status,
                confirmationDate: row.application_confirmation_date !== null
                    ? new Date(row.application_confirmation_date)
                    : null,
                patentOffice: row.patent_office,
                updatedAt: row.updated_at,
                registrationFee: row.registration_fee,
                inventorNomination: row.inventor_nomination,
                annualFee: row.annual_fee,
                patentExaminationRequest: row.patent_examination_request,
                patentExaminationNoticeDate: row.patent_examination_notice_date !== null
                    ? new Date(row.patent_examination_notice_date)
                    : null,
                patentExaminationNotice: row.patent_examination_notice,
                grantDate: row.grant_date !== null ? new Date(row.grant_date) : null,
                grantFee: row.grant_fee,
                objection: row.objection,
                rejectionReason: row.rejection_reason,
                patentDuration: row.patent_duration,
                examinationRequest: row.examination_request,
                objectionResponse: row.objection_response,
            };
        });
    }
    catch (err) {
        throw new Error(`Failed query patents for startup with id: ${startupId}. Error: ${err}`);
    }
    finally {
        client.release();
    }
});
exports.getAllPatents = getAllPatents;
const updatePatent = (patentUpdate) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
        if (isUpdatedPatentDisclosure(patentUpdate)) {
            console.log(patentUpdate);
            yield client.query("UPDATE patents SET registration_fee = $1, annual_fee = $2, inventor_nomination = $3, examination_request = $4 WHERE id = $5;", [
                patentUpdate.registrationFee,
                patentUpdate.annualFee,
                patentUpdate.inventorNomination,
                patentUpdate.examinationRequest,
                patentUpdate.id,
            ]);
        }
        else if (isUpdatedPatentExamination(patentUpdate)) {
            yield client.query("UPDATE patents SET patent_examination_notice = $1 WHERE id = $2;", [patentUpdate.patentExaminationNotice, patentUpdate.id]);
        }
        else {
            yield client.query("UPDATE patents SET grant_fee = $1, objection = $2, objection_response = $3 WHERE id = $4;", [
                patentUpdate.grantFee,
                patentUpdate.objection,
                patentUpdate.objectionResponse,
                patentUpdate.id,
            ]);
        }
    }
    catch (err) {
        throw new Error(`Failed to update patent with id ${patentUpdate.id} due to Error: ${err}`);
    }
    finally {
        client.release();
    }
});
exports.updatePatent = updatePatent;
const persistPatentConfirmationDate = (id, date) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
        yield client.query("UPDATE patents SET application_confirmation_date = $1, status = 'disclosure-phase' WHERE id = $2;", [date, id]);
    }
    catch (err) {
        throw new Error(`Failed to update patent application confirmation date with id ${id} due to Error: ${err}`);
    }
    finally {
        client.release();
    }
});
exports.persistPatentConfirmationDate = persistPatentConfirmationDate;
