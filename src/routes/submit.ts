import express from "express";
import {
  deleteTrl,
  getTrl,
  persistCapTable,
  persistTrlData,
  TrlData,
  updateTrl,
} from "../models/startup";
import {
  deleteSpreadsheets,
  formatCapTable,
  multerUpload,
  uploadCapTable,
} from "../util/excel";

const router = express.Router();

router.get("/", async (req, res) => {
  if (req.user?.startup === undefined) {
    if (req.user?.fund !== undefined) {
      console.info(
        `Redirecting user ${req.user?.id} to fund screen since no startup id is assigned.`
      );
      res.redirect("/startup");
    } else {
      console.info(
        `Redirecting user ${req.user?.id} to login screen since no fund id or startup id are assigned.`
      );
      res.redirect("/");
    }
  } else {
    const trl = await getTrl(req.user?.startup);
    req.session.trl = trl;
    res.render("submit/index", {
      layout: "../views/layouts/dashboard.ejs",
      dashboard: "startup",
      scripts: ["/js/submit"],
      page: "submit",
      title: "Finvia", // TODO: make dynamic
      name: req.user?.firstName + " " + req.user?.lastName,
      trl: trl,
    });
  }
});

// router.post("/", multerUpload.single("kpis"), async (req, res) => {
//   try {
//     const rows = await uploadKpis();

//     const kpis: Kpis = JSON.parse(JSON.stringify(rows[rows.length - 1]));

//     kpis.date = kpis.date.substring(0, 10);
//     kpis.cashFlowRate = Math.round(kpis.cashFlowRate * 100);
//     kpis.numberOfEmployees = Math.round(kpis.numberOfEmployees * 100);
//     kpis.liquidity = Math.round(kpis.liquidity * 100);

//     res.render("submit/index", {
//       layout: "../views/layouts/startup.ejs",
//       page: "submit",
//       kpis,
//       title: "Finvia", // TODO: make dynamic
//       name: req.user?.firstName + " " + req.user?.lastName,
//     });

//     return;
//   } catch (error) {
//     console.error(
//       `The following error occurred during upload of kpis. Redirecting to /submit ${error}`
//     );
//     res.redirect("/");
//   }
// });

router.post("/reupload", (req, res) => {
  deleteSpreadsheets();
  res.redirect("/submit");
});

// router.post("/kpis", async (req, res) => {
//   const { date, numberOfEmployees, cashFlowRate, liquidity } = req.body.kpis;

//   const kpis: Kpis = {
//     date: date,
//     numberOfEmployees: numberOfEmployees,
//     cashFlowRate: cashFlowRate,
//     liquidity: liquidity,
//   };

//   deleteSpreadsheets(); // TODO: error handling
//   const startupId = req.user?.startup;
//   if (startupId === undefined) {
//     console.info(
//       `Redirecting to login screen since no startup is assigned to user with id ${req.user?.id}`
//     );
//     res.redirect("/");
//   } else {
//     try {
//       await updateKpis(kpis, startupId);
//       res.redirect("/startup");
//     } catch (error) {
//       console.error(
//         `Failed to update kpis due to ${error}. Redirect to startup screen.`
//       );
//       res.redirect("/startup");
//     }
//   }
// });

// router.post("/kpi-form", async (req, res) => {
//   const { numberOfEmployees, cashFlowRate, liquidity } = req.body;

//   const kpis: Kpis = {
//     date: getTodaysDate(),
//     numberOfEmployees: numberOfEmployees,
//     cashFlowRate: cashFlowRate,
//     liquidity: liquidity,
//   };
//   const startupId = req.user?.startup;
//   if (startupId === undefined) {
//     console.info(
//       `Redirecting to login screen since no startup is assigned to user with id ${req.user?.id}`
//     );
//     res.redirect("/");
//   } else {
//     try {
//       await updateKpis(kpis, req.session.startupId);
//       res.redirect("/startup");
//     } catch (error) {
//       console.error(
//         `Failed to update kpis due to ${error}. Redirect to startup screen.`
//       );
//       res.redirect("/startup");
//     }
//   }
// });

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
        trl: req.session.trl,
      });

      return;
    } catch (error) {
      console.error(
        `The following error occurred during upload of a cap table. Redirecting to /submit ${error}`
      );
      res.redirect("/submit");
    }
  }
);

router.post("/update-trl", async (req, res) => {
  const { id, technology, trl, criticality } = req.body.trlData;
  try {
    const trlData: TrlData = {
      id,
      technology,
      trl,
      criticality,
    };

    await updateTrl(trlData);
  } catch (error) {
    console.error(
      `The following error occurred during update of a technology trl with id ${id}. Redirecting to /submit ${error}`
    );
    res.redirect("/submit");
  }
});

router.post("/delete-trl", async (req, res) => {
  const { id } = req.body.id;
  try {
    await deleteTrl(id);
  } catch (error) {
    console.error(
      `The following error occurred during deletion of a technology trl with id ${id}. Redirecting to /submit ${error}`
    );
    res.redirect("/submit");
  }
});

router.post("/add-trl", async (req, res) => {
  const { technology, trl, criticality } = req.body.trlData;
  try {
    const trlData: TrlData = {
      id: "",
      technology,
      trl,
      criticality,
    };

    await persistTrlData(req.session.startupId, [trlData]);
    res.redirect("/submit");
  } catch (error) {
    console.error(
      `The following error occurred during adding of a new technology trl to startup with id ${req.session.startupId} to the db. Redirecting to /submit ${error}`
    );
    res.redirect("/submit");
  }
});

export default router;
