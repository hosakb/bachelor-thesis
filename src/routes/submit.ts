import express from "express";
import { Kpis, persistCapTable, updateKpis } from "../models/startup";
import getTodaysDate from "../util/date";
import {
  deleteSpreadsheets,
  formatCapTable,
  multerUpload,
  uploadCapTable,
  uploadKpis,
} from "../util/excel";

const router = express.Router();

router.get("/", (req, res) => {
  if (req.user?.startup === undefined) {
    if (req.user?.fund !== undefined) {
      console.log(
        `Redirecting user ${req.user?.id} to fund screen since no startup id is assigned.`
      );
      res.redirect("/startup");
    } else {
      console.log(
        `Redirecting user ${req.user?.id} to login screen since no fund id or startup id are assigned.`
      );
      res.redirect("/");
    }
  } else {
    res.render("submit/index", {
      layout: "../views/layouts/startup.ejs",
      page: "submit",
      title: "Finvia", // TODO: make dynamic
      name: req.user?.firstName + " " + req.user?.lastName,
    });
  }
});

router.post("/", multerUpload.single("kpis"), async (req, res) => {
  try {
    const rows = await uploadKpis();

    const kpis: Kpis = JSON.parse(JSON.stringify(rows[rows.length - 1]));

    kpis.date = kpis.date.substring(0, 10);
    kpis.cashFlowRate = Math.round(kpis.cashFlowRate * 100);
    kpis.numberOfEmployees = Math.round(kpis.numberOfEmployees * 100);
    kpis.liquidity = Math.round(kpis.liquidity * 100);

    res.render("submit/index", {
      layout: "../views/layouts/startup.ejs",
      page: "submit",
      kpis,
      title: "Finvia", // TODO: make dynamic
      name: req.user?.firstName + " " + req.user?.lastName,
    });

    return;
  } catch (error) {
    console.log(
      `The following error occurred during upload of kpis. Redirecting to /submit ${error}`
    );
    res.redirect("/");
  }
});

router.post("/reupload", (req, res) => {
  deleteSpreadsheets();
  res.redirect("/submit");
});

router.post("/kpis", async (req, res) => {
  const { date, numberOfEmployees, cashFlowRate, liquidity } = req.body.kpis;

  const kpis: Kpis = {
    date: date,
    numberOfEmployees: numberOfEmployees,
    cashFlowRate: cashFlowRate,
    liquidity: liquidity,
  };

  deleteSpreadsheets(); // TODO: error handling
  const startupId = req.user?.startup;
  if (startupId === undefined) {
    console.log(
      `Redirecting to login screen since no startup is assigned to user with id ${req.user?.id}`
    );
    res.redirect("/");
  } else {
    try {
      await updateKpis(kpis, startupId);
      res.redirect("/startup");
    } catch (error) {
      console.log(
        `Failed to update kpis due to ${error}. Redirect to startup screen.`
      );
      res.redirect("/startup");
    }
  }
});

router.post("/kpi-form", async (req, res) => {
  const { numberOfEmployees, cashFlowRate, liquidity } = req.body;

  const kpis: Kpis = {
    date: getTodaysDate(),
    numberOfEmployees: numberOfEmployees,
    cashFlowRate: cashFlowRate,
    liquidity: liquidity,
  };
  const startupId = req.user?.startup;
  if (startupId === undefined) {
    console.log(
      `Redirecting to login screen since no startup is assigned to user with id ${req.user?.id}`
    );
    res.redirect("/");
  } else {
    try {
      await updateKpis(kpis, req.session.startupId);
      res.redirect("/startup");
    } catch (error) {
      console.log(
        `Failed to update kpis due to ${error}. Redirect to startup screen.`
      );
      res.redirect("/startup");
    }
  }
});

router.post(
  "/cap-table",
  multerUpload.single("cap-table"),
  async (req, res) => {
    try {
      const rows = await uploadCapTable();

      const capTable = formatCapTable(rows);

      const startupId = req.user?.startup;

      if (startupId == undefined) {
        throw new Error("Failed to fetch startup id.");
      }

      await persistCapTable(JSON.stringify(capTable), startupId);

      res.render("submit/index", {
        layout: "../views/layouts/startup.ejs",
        page: "submit",
        title: "Finvia", // TODO: make dynamic
        name: req.user?.firstName + " " + req.user?.lastName,
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

export default router;
