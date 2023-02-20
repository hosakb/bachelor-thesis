import express, { Router } from "express";
import {
  getNewStartupById,
  persistCapTable,
  persistInfo,
  StartupInfo,
  persistCoreTechnology,
  Questionnaire,
  persistQuestionnaire,
} from "../models/startup";
import { PreviousVenture, insertTrackRecord } from "../models/track_record";
import {
  deleteSpreadsheets,
  formatCapTable,
  multerUpload,
  uploadCapTable,
} from "../util/excel";

import { TrlData, persistTrlData } from "../models/trl";

const router: Router = express.Router();

router.get("/startup", async (req, res) => {
  let newStartup;
  const startupId = req.user?.startup;

  if (startupId == undefined) {
    throw new Error("Failed to fetch startup id.");
  }

  try {
    newStartup = await getNewStartupById(startupId);
    req.session.startupName = newStartup.name;
  } catch (e) {
    throw new Error("Failed to fetch startup from database.");
  }

  res.render("onboarding/startup", {
    layout: "../views/layouts/onboarding.ejs",
    title: req.session.startupName,
    name: req.user?.firstName + " " + req.user?.lastName,
    startupName: req.session.startupName,
    scripts: ["/js/onboarding/startup"],
  });
});

router.post(
  "/cap-table",
  multerUpload.single("cap-table"),
  async (req, res) => {
    try {
      const rows = await uploadCapTable();

      const capTable = formatCapTable(rows);
      req.session.capTable = capTable;
      res.json(JSON.stringify({ capTable: capTable }));
      deleteSpreadsheets();
      return;
    } catch (error) {
      console.error(
        `The following error occurred during upload of a cap table. Redirecting to /submit ${error}`
      );
      res.redirect("/");
    }
  }
);

router.post("/reupload", (req, res) => {
  deleteSpreadsheets();
  res.redirect("/submit");
});

router.post("/startup", async (req, res) => {
  const { phase, productToMarket, timeToMarket, sector, investedCapital } =
    req.body.startupInfo;

  const startupInfo: StartupInfo = {
    phase,
    productToMarket: productToMarket === "true",
    timeToMarket,
    sector,
    investedCapital,
  };

  const startupId = req.user?.startup;

  deleteSpreadsheets(); // TODO: error handling

  if (startupId === undefined) {
    console.error(
      `Redirecting to login screen since no startup is assigned to user with id ${req.user?.id}`
    );
    res.redirect("/");
  } else {
    try {
      await persistCapTable(JSON.stringify(req.session.capTable), startupId);
      await persistInfo(startupInfo, startupId);
      req.session.startupId = startupId;
      res.redirect("/onboarding/product");
    } catch (error) {
      console.error(
        `Failed to onboard startup due to ${error}. Redirect to startup screen.`
      );
      res.redirect("/onboarding/startup");
    }
  }
});

router.get("/product", async (req, res) => {
  const startupId = req.user?.startup;

  if (startupId == undefined) {
    console.error("Failed to fetch startup id. Redirect to login screen.");
    res.redirect("/");
    return;
  }

  res.render("onboarding/product", {
    layout: "../views/layouts/onboarding.ejs",
    title: req.session.startupName,
    name: req.user?.firstName + " " + req.user?.lastName,
    startupName: req.session.startupName,
    scripts: ["/js/onboarding/product"],
  });
});

router.post("/trl", async (req, res) => {
  const { trlData, coreTechnology } = req.body;

  const newTrlData: TrlData[] = JSON.parse(trlData);
  const startupId = req.user?.startup;

  if (startupId == undefined) {
    throw new Error("Failed to fetch startup id.");
  }

  try {
    await persistTrlData(startupId, newTrlData);
    await persistCoreTechnology(startupId, coreTechnology);
    res.redirect("/onboarding/questionnaire");
  } catch (error) {
    console.error(
      `Failed to submit trl for startup with id ${startupId} due to: ${error}. Redirect to login screen.`
    );
    res.redirect("/");
  }
});

router.get("/questionnaire", async (req, res) => {
  const startupId = req.user?.startup;

  if (startupId == undefined) {
    console.error("Failed to fetch startup id. Redirect to login screen.");
    res.redirect("/");
    return;
  }

  res.render("onboarding/questionnaire", {
    layout: "../views/layouts/onboarding.ejs",
    title: req.session.startupName,
    name: req.user?.firstName + " " + req.user?.lastName,
    startupName: req.session.startupName,
    scripts: ["/js/onboarding/questionnaire"],
  });
});

router.post("/questionnaire", async (req, res) => {
  const {
    q1_1_1,
    q1_2_1,
    q1_2_2,
    q1_2_3,
    q1_2_4,
    q1_2_5,
    q1_2_6,
    q1_2_7,
    q1_2_8,
    q1_2_9,
    q1_2_10,
    q1_2_11,
    q1_2_12,
    q1_2_13,
    q1_2_14,
    q1_2_15,
    q1_2_16,
    q1_2_17,
    q1_2_18,
    q1_2_19,
    q1_2_20,
    q1_2_21,
    q1_2_22,
    q1_2_23,
    q1_2_24,
    q1_3_1,
    q1_3_2,
    q1_3_3,
    q1_3_4,
    q1_4_1,
    q1_4_2,
    q1_4_3,
    q1_4_4,
    q1_4_5,
    q1_4_6,
    q2_1_1,
    q2_1_2,
    q2_1_3,
    q2_1_4,
    q2_1_5,
    q2_1_6,
    q2_1_7,
    q2_1_8,
    q2_1_9,
    q2_1_10,
    q2_2_1,
    q2_2_2,
    q2_2_3,
    q2_3_1,
    q2_3_2,
    q2_3_3,
    q2_4_1,
    q2_4_2,
    q2_4_3,
    q2_4_4,
    q2_4_5,
    q2_4_6,
    q2_4_7,
    q2_5_1,
    q2_5_2,
    q2_5_3,
    q2_5_4,
    q2_5_5,
    q2_5_6,
    q3_1_1,
    q3_1_2,
    q3_1_3,
    q3_1_4,
    q4_1_1,
    q4_1_2,
    q5_1_1,
    q5_1_2,
    q5_1_3,
    q6_1_1,
    q6_1_2,
    q6_2_1,
    q6_2_2,
    q6_2_3,
    q6_2_4,
    q6_2_5,
    q6_3_1,
    q6_3_2,
    q6_3_3,
    q6_3_4,
    q6_4_1,
    q6_4_2,
    q6_4_3,
    q7_1_1,
    q7_1_2,
    q7_1_3,
    q7_1_4,
    q7_1_5,
    q7_1_6,
    q7_2_1,
    q7_2_2,
    q8_1_1,
    q8_1_2,
  } = req.body;
  const startupId = req.user?.startup;

  if (startupId == undefined) {
    throw new Error("Failed to fetch startup id.");
  }

  try {
    const questionnaire: Questionnaire = {
      q1_1_1: parseInt(q1_1_1),
      q1_2_1: parseInt(q1_2_1),
      q1_2_2: parseInt(q1_2_2),
      q1_2_3: parseInt(q1_2_3),
      q1_2_4: parseInt(q1_2_4),
      q1_2_5: parseInt(q1_2_5),
      q1_2_6: parseInt(q1_2_6),
      q1_2_7: parseInt(q1_2_7),
      q1_2_8: parseInt(q1_2_8),
      q1_2_9: parseInt(q1_2_9),
      q1_2_10: parseInt(q1_2_10),
      q1_2_11: parseInt(q1_2_11),
      q1_2_12: parseInt(q1_2_12),
      q1_2_13: parseInt(q1_2_13),
      q1_2_14: parseInt(q1_2_14),
      q1_2_15: parseInt(q1_2_15),
      q1_2_16: parseInt(q1_2_16),
      q1_2_17: parseInt(q1_2_17),
      q1_2_18: parseInt(q1_2_18),
      q1_2_19: parseInt(q1_2_19),
      q1_2_20: parseInt(q1_2_20),
      q1_2_21: parseInt(q1_2_21),
      q1_2_22: parseInt(q1_2_22),
      q1_2_23: parseInt(q1_2_23),
      q1_2_24: parseInt(q1_2_24),
      q1_3_1: parseInt(q1_3_1),
      q1_3_2: parseInt(q1_3_2),
      q1_3_3: parseInt(q1_3_3),
      q1_3_4: parseInt(q1_3_4),
      q1_4_1: parseInt(q1_4_1),
      q1_4_2: parseInt(q1_4_2),
      q1_4_3: parseInt(q1_4_3),
      q1_4_4: parseInt(q1_4_4),
      q1_4_5: parseInt(q1_4_5),
      q1_4_6: parseInt(q1_4_6),
      q2_1_1: parseInt(q2_1_1),
      q2_1_2: parseInt(q2_1_2),
      q2_1_3: parseInt(q2_1_3),
      q2_1_4: parseInt(q2_1_4),
      q2_1_5: parseInt(q2_1_5),
      q2_1_6: parseInt(q2_1_6),
      q2_1_7: parseInt(q2_1_7),
      q2_1_8: parseInt(q2_1_8),
      q2_1_9: parseInt(q2_1_9),
      q2_1_10: parseInt(q2_1_10),
      q2_2_1: parseInt(q2_2_1),
      q2_2_2: parseInt(q2_2_2),
      q2_2_3: parseInt(q2_2_3),
      q2_3_1: parseInt(q2_3_1),
      q2_3_2: parseInt(q2_3_2),
      q2_3_3: parseInt(q2_3_3),
      q2_4_1: parseInt(q2_4_1),
      q2_4_2: parseInt(q2_4_2),
      q2_4_3: parseInt(q2_4_3),
      q2_4_4: parseInt(q2_4_4),
      q2_4_5: parseInt(q2_4_5),
      q2_4_6: parseInt(q2_4_6),
      q2_4_7: parseInt(q2_4_7),
      q2_5_1: parseInt(q2_5_1),
      q2_5_2: parseInt(q2_5_2),
      q2_5_3: parseInt(q2_5_3),
      q2_5_4: parseInt(q2_5_4),
      q2_5_5: parseInt(q2_5_5),
      q2_5_6: parseInt(q2_5_6),
      q3_1_1: parseInt(q3_1_1),
      q3_1_2: parseInt(q3_1_2),
      q3_1_3: parseInt(q3_1_3),
      q3_1_4: parseInt(q3_1_4),
      q4_1_1: parseInt(q4_1_1),
      q4_1_2: parseInt(q4_1_2),
      q5_1_1: parseInt(q5_1_1),
      q5_1_2: parseInt(q5_1_2),
      q5_1_3: parseInt(q5_1_3),
      q6_1_1: parseInt(q6_1_1),
      q6_1_2: parseInt(q6_1_2),
      q6_2_1: parseInt(q6_2_1),
      q6_2_2: parseInt(q6_2_2),
      q6_2_3: parseInt(q6_2_3),
      q6_2_4: parseInt(q6_2_4),
      q6_2_5: parseInt(q6_2_5),
      q6_3_1: parseInt(q6_3_1),
      q6_3_2: parseInt(q6_3_2),
      q6_3_3: parseInt(q6_3_3),
      q6_3_4: parseInt(q6_3_4),
      q6_4_1: parseInt(q6_4_1),
      q6_4_2: parseInt(q6_4_2),
      q6_4_3: parseInt(q6_4_3),
      q7_1_1: parseInt(q7_1_1),
      q7_1_2: parseInt(q7_1_2),
      q7_1_3: parseInt(q7_1_3),
      q7_1_4: parseInt(q7_1_4),
      q7_1_5: parseInt(q7_1_5),
      q7_1_6: parseInt(q7_1_6),
      q7_2_1: parseInt(q7_2_1),
      q7_2_2: parseInt(q7_2_2),
      q8_1_1: parseInt(q8_1_1),
      q8_1_2: parseInt(q8_1_2),
    };

    await persistQuestionnaire(startupId, questionnaire);
    res.redirect("/onboarding/track-record");
  } catch (error) {
    console.error(
      `Failed to upload questionnaire for startup with id ${startupId} due to: ${error}. Redirect to login screen.`
    );
    res.redirect("/");
  }
});

router.get("/track-record", async (req, res) => {
  let newStartup;
  const startupId = req.user?.startup;

  if (startupId == undefined) {
    throw new Error("Failed to fetch startup id.");
  }

  try {
    newStartup = await getNewStartupById(startupId);
  } catch (e) {
    throw new Error("Failed to fetch startup from database.");
  }

  res.render("onboarding/track_record", {
    layout: "../views/layouts/onboarding.ejs",
    title: req.session.startupName,
    name: req.user?.firstName + " " + req.user?.lastName,
    startupName: newStartup.name,
    founder: req.user?.firstName + " " + req.user?.lastName,
    scripts: ["/js/onboarding/founder"],
  });
});

router.post("/track-record", async (req, res) => {
  const { expertise, ventures } = req.body.trackRecord;

  try {
    if (req.user?.id == undefined) {
      console.error("Failed to fetch user id. Redirect to login screen.");
      res.redirect("/");
      return;
    }

    const userId = req.user?.id;
    const previousVenture: PreviousVenture[] = ventures;

    await insertTrackRecord(userId, expertise, previousVenture);

    const startupId = req.user.startup;

    if (startupId == undefined) {
      throw new Error("Failed to fetch startup id.");
    }

    req.session.startupId = startupId;
    res.redirect("/startup");
  } catch (error) {
    console.error(
      `Failed to submit track record due to: ${error}. Redirect to login screen.`
    );
    res.redirect("/");
  }
});

export default router;
