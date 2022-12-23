import express, { Router } from "express";
import {
  getNewStartupById,
  Milestone,
  persistCapTable,
  persistInfo,
  persistMilestones,
  StartupInfo,
  TrlData,
  persistTrlData,
  persistCoreTechnology,
} from "../models/startup";
import { PreviousVenture, insertTrackRecord } from "../models/track_record";
import {
  deleteSpreadsheets,
  formatCapTable,
  multerUpload,
  uploadCapTable,
} from "../util/excel";

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
  const {
    phase,
    startDatePhase,
    dueDatePhase,
    progress,
    productToMarket,
    timeToMarket,
    sector,
    milestoneData,
  } = req.body.startupInfo;

  const startupInfo: StartupInfo = {
    phase,
    startDatePhase,
    dueDatePhase,
    productToMarket,
    timeToMarket,
    progress,
    sector,
  };

  const milestones: Milestone[] = milestoneData;

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
      await persistMilestones(milestones, startupId);
      req.session.startupId = startupId;
      res.redirect("/onboarding/product");
    } catch (error) {
      console.error(
        `Failed to update kpis due to ${error}. Redirect to startup screen.`
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
    res.redirect("/onboarding/track-record");
  } catch (error) {
    console.error(
      `Failed to submit trl for startup with id ${startupId} due to: ${error}. Redirect to login screen.`
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
    title: req.startupName,
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
