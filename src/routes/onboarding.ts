import express, { Router } from "express";
import {
  getStartupById,
  persistCapTable,
  persistInfo,
  StartupInfo,
} from "../models/startup";
import { PreviousVenture, insertTrackRecord } from "../models/track_record";
import {
  deleteSpreadsheets,
  formatCapTable,
  multerUpload,
  uploadCapTable,
} from "../util/excel";

const router: Router = express.Router();

router.get("/", async (req, res) => {
  let newStartup;
  const startupId = req.user?.startup;

  if (startupId == undefined) {
    throw new Error("Failed to fetch startup id.");
  }

  try {
    newStartup = await getStartupById(startupId);
  } catch (e) {
    throw new Error("Failed to fetch startup from database.");
  }

  res.render("onboarding/track_record", {
    layout: "../views/layouts/onboarding.ejs",
    title: req.startupName,
    name: req.user?.firstName + " " + req.user?.lastName,
    startupName: newStartup.name,
    founder: req.user?.firstName + " " + req.user?.lastName,
  });
});

router.post("/track-record", async (req, res) => {
  const { expertise, ventures } = req.body.trackRecord;

  try {
    if (req.user?.id == undefined) {
      throw new Error("Failed use read user_id");
    }

    const userId = req.user?.id;
    const previousVenture: PreviousVenture[] = ventures;

    await insertTrackRecord(userId, expertise, previousVenture);
    res.redirect("/startup");
  } catch (error) {
    console.log(
      `Failed to submit track record due to: ${error}. Redirect to login screen.`
    );
    res.redirect("/onboarding");
  }
});

router.get("/startup", async (req, res) => {
  let newStartup;
  const startupId = req.user?.startup;

  if (startupId == undefined) {
    throw new Error("Failed to fetch startup id.");
  }

  try {
    newStartup = await getStartupById(startupId);
    req.session.startupName = newStartup.name;
  } catch (e) {
    throw new Error("Failed to fetch startup from database.");
  }

  res.render("onboarding/startup", {
    layout: "../views/layouts/onboarding.ejs",
    title: req.session.startupName,
    name: req.user?.firstName + " " + req.user?.lastName,
    startupName: req.session.startupName,
  });
});

router.post("/track-record", async (req, res) => {
  const { expertise, ventures } = req.body.trackRecord;

  try {
    if (req.user?.id == undefined) {
      throw new Error("Failed use read user_id");
    }

    const userId = req.user?.id;
    const previousVenture: PreviousVenture[] = ventures;

    await insertTrackRecord(userId, expertise, previousVenture);
    res.redirect("/startup");
  } catch (error) {
    console.log(
      `Failed to submit track record due to: ${error}. Redirect to login screen.`
    );
    res.redirect("/");
  }
});

router.post(
  "/cap-table",
  multerUpload.single("cap-table"),
  async (req, res) => {
    try {
      const rows = await uploadCapTable();

      const capTable = formatCapTable(rows);
      req.session.capTable = capTable;

      res.render("onboarding/startup", {
        layout: "../views/layouts/onboarding.ejs",
        title: req.session.startupName,
        name: req.user?.firstName + " " + req.user?.lastName,
        startupName: req.session.startupName,
        capTable,
      });

      return;
    } catch (error) {
      console.log(
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
  const { phase, revenue, productToMarket, timeToMarket, sector } =
    req.body.startupInfo;

  const startupInfo: StartupInfo = {
    phase,
    revenue,
    productToMarket,
    timeToMarket,
    sector,
  };

  const startupId = req.user?.startup;

  deleteSpreadsheets(); // TODO: error handling

  if (startupId === undefined) {
    console.log(
      `Redirecting to login screen since no startup is assigned to user with id ${req.user?.id}`
    );
    res.redirect("/");
  } else {
    try {
      await persistCapTable(JSON.stringify(req.session.capTable), startupId);
      await persistInfo(startupInfo, startupId);
      res.redirect("/onboarding");
    } catch (error) {
      console.log(
        `Failed to update kpis due to ${error}. Redirect to startup screen.`
      );
      res.redirect("/onboarding/startup");
    }
  }
});

export default router;
