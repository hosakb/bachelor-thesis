import express, { Router } from "express";
import { Row } from "read-excel-file";
import {
  getInvestmentPhase,
  Milestone,
  getMilestones,
  updateMilestoneDuration,
  updateMilestoneProgress,
  getTrl,
  Metrics,
  getMetrics,
  getStartupNameById,
  getInvestors,
  getCapTable,
  updateInvestmentPhase,
  updateInvestedCapital,
  persistCapTable,
  TrlData,
  updateTrl,
  deleteTrl,
  persistTrlData,
  NewInvestor,
  insertInvestor,
  updateInvestorStatus,
  UnIndexedMilestone,
  NewMilestone,
  persistMilestones,
  persistMilestonesWithId,
  NewPatent,
  insertNewPatent,
  getAllPatents,
  UpdatedPatentDisclosure,
  UpdatedPatentExamination,
  UpdatedPatentObjection,
  updatePatent,
  persistPatentConfirmationDate,
  updatePatentPhaseStatus,
  updateCancelPatent,
  getPatentAnnualFeeDateById,
} from "../models/startup";
import { getMonth } from "../util/date";
import {
  deleteSpreadsheets,
  formatCapTable,
  multerUpload,
  uploadCapTable,
} from "../util/excel";

const router: Router = express.Router();

router.get("/", async (req, res) => {
  const startupId = req.user?.startup;

  if (startupId === undefined) {
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
    try {
      const trl = await getTrl(startupId);
      res.render("dashboard/startup/index", {
        layout: "../views/layouts/dashboard.ejs",
        dashboard: "startup",
        scripts: [
          "/js/gantt/frappe-gantt.min",
          "/js/chart/chart.min",
          "/js/startup",
        ],
        phase: await getInvestmentPhase(startupId),
        kpis: req.kpis,
        page: "dashboard",
        title: await getStartupNameById(startupId),
        name: req.user?.firstName + " " + req.user?.lastName,
        trl: trl,
        investors: await getInvestors(startupId),
      });
    } catch (error) {
      console.error(
        `Failed to fetch startup data for startup with id ${startupId} due to:\n${error}.\nRedirecting to login screen.`
      );
      res.redirect("/");
    }
  }
});

router.get("/chart/data", async (req, res) => {
  try {
    const milestones: Milestone[] = await getMilestones(req.session.startupId);
    const metrics: Metrics[] = await getMetrics(req.session.startupId);

    const months = metrics.map((x) => {
      return getMonth(x.date);
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
  } catch (error) {
    res.status(200).json([]);
  }
});

router.put("/gantt/period", async (req) => {
  const { taskId, start, end } = req.body;

  try {
    await updateMilestoneDuration(taskId, start, end);
  } catch (error) {
    console.error(`Failed to update Milestone duration due to ${error}.`);
  }
});

router.put("/gantt/progress", async (req) => {
  const { taskId, progress } = req.body;

  try {
    await updateMilestoneProgress(taskId, progress);
  } catch (error) {
    console.error(`Failed to update Milestone progress due to ${error}.`);
  }
});

// =============================== Submit =====================================
router.get("/submit", async (req, res) => {
  const trl = await getTrl(req.session.startupId);
  req.session.trl = trl;
  const investors = await getInvestors(req.session.startupId);
  req.session.investors = investors;

  const startupName: string = await getStartupNameById(req.session.startupId);
  req.session.startupName = startupName;

  const investmentPhase: string = await getInvestmentPhase(
    req.session.startupId
  );
  req.session.phase = investmentPhase;

  const milestones = await getMilestones(req.session.startupId);
  req.session.milestones = milestones;

  const capTable: Row[] = await getCapTable(req.session.startupId);

  const patents = await getAllPatents(req.session.startupId);

  res.render("dashboard/startup/submit", {
    layout: "../views/layouts/dashboard.ejs",
    dashboard: "startup",
    scripts: ["/js/submit"],
    page: "submit",
    title: startupName,
    name: req.user?.firstName + " " + req.user?.lastName,
    trl: trl,
    investors,
    milestones,
    capTable,
    investmentPhase,
    patents,
  });
});

router.post("/submit/reupload", (req, res) => {
  deleteSpreadsheets();
  res.redirect("/startup/submit");
});

router.post(
  "/cap-table",
  multerUpload.single("cap-table"),
  async (req, res) => {
    const { nextPhase, investedCapital } = req.body;
    try {
      await updateInvestmentPhase(req.session.startupId, nextPhase);
      await updateInvestedCapital(
        req.session.startupId,
        parseInt(investedCapital)
      );

      const rows = await uploadCapTable();

      const capTable = formatCapTable(rows);

      const startupId = req.user?.startup;

      if (startupId == undefined) {
        throw new Error("Failed to fetch startup id.");
      }

      await persistCapTable(JSON.stringify(capTable), startupId);
      res.redirect("/startup/submit");

      return;
    } catch (error) {
      console.error(
        `The following error occurred during upload of a cap table. Redirecting to /startup/submit ${error}`
      );
      res.redirect("/startup/submit");
    }
  }
);

router.post("/submit/update-trl", async (req, res) => {
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
      `The following error occurred during update of a technology trl with id ${id}. Redirecting to /startup/submit ${error}`
    );
    res.redirect("/startup/submit");
  }
});

router.post("/submit/delete-trl", async (req, res) => {
  const { id } = req.body.id;
  try {
    await deleteTrl(id);
  } catch (error) {
    console.error(
      `The following error occurred during deletion of a technology trl with id ${id}. Redirecting to /startup/submit ${error}`
    );
    res.redirect("/startup/submit");
  }
});

router.post("/submit/add-trl", async (req, res) => {
  const { newTechnology, newTrlValue, newCriticality } = req.body;
  try {
    const trlData: TrlData = {
      id: "",
      technology: newTechnology,
      trl: newTrlValue,
      criticality: newCriticality,
    };

    await persistTrlData(req.session.startupId, [trlData]);
    res.redirect("/startup/submit");
  } catch (error) {
    console.error(
      `Failed to persist new trl startup with id ${req.session.startupId}. Error: ${error}. Redirecting to /startup/submit `
    );
    res.redirect("/startup/submit");
  }
});

router.post("/submit/new-investor", async (req, res) => {
  const { name, type, email, number, url, country, notes, contactDate } =
    req.body;
  try {
    const newInvestor: NewInvestor = {
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
    await insertInvestor(newInvestor);
    res.status(200).json();
  } catch (error) {
    console.error(
      `Failed to add new investors contact to startup with id ${req.session.startupId}. Error: ${error}. Redirecting to /startup/submit ${error}`
    );
    res.status(500).json();
    res.redirect("/startup/submit");
  }
});

router.post("/submit/update-investor-status", async (req, res) => {
  const { id, status } = req.body;
  try {
    await updateInvestorStatus(status, id);
    res.status(200).json();
  } catch (error) {
    console.error(
      `Failed to update investors status. Error: ${error}. Redirecting to /startup/submit ${error}`
    );
    res.redirect("/startup/submit");
  }
});

router.post("/submit/add-milestone", async (req, res) => {
  const { milestones } = req.body;

  const unIndexedMilestones: UnIndexedMilestone[] = milestones;
  try {
    const existingMilestones: Milestone[] = await getMilestones(
      req.session.startupId
    );

    const joinedMilestones: UnIndexedMilestone[] = unIndexedMilestones.concat(
      existingMilestones.map((existingMilestone) => {
        return {
          name: existingMilestone.name,
          start: existingMilestone.start,
          end: existingMilestone.end,
          progress: existingMilestone.progress,
        };
      })
    );

    const indexedMilestones: NewMilestone[] = joinedMilestones
      .sort((a: UnIndexedMilestone, b: UnIndexedMilestone) => {
        return new Date(b.start).getTime() - new Date(a.start).getTime();
      })
      .reverse()
      .map((m, index) => {
        return {
          index,
          ...m,
        };
      });

    await persistMilestones(indexedMilestones, req.session.startupId);
    res.status(200).json();
  } catch (error) {
    console.error(
      `Failed to persist milestone. Error: ${error}. Redirecting to /startup/submit ${error}`
    );
    res.redirect("/startup/submit");
  }
});

router.post("/submit/delete-milestone", async (req, res) => {
  const { id } = req.body;

  try {
    const existingMilestones: Milestone[] = await getMilestones(
      req.session.startupId
    );

    const indexedMilestones = existingMilestones
      .filter((m) => m.id != id)
      .sort((a: Milestone, b: Milestone) => {
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

    await persistMilestonesWithId(indexedMilestones, req.session.startupId);

    res.status(200).json();
  } catch (error) {
    console.error(
      `Failed to delete milestone. Error: ${error}. Redirecting to /startup/submit ${error}`
    );
    res.redirect("/startup/submit");
  }
});

router.post("/submit/update-milestone", async (req, res) => {
  const { id, name, start, end, progress } = req.body;

  try {
    const existingMilestones: Milestone[] = await getMilestones(
      req.session.startupId
    );

    for (const m of existingMilestones) {
      if (m.id == id) {
        m.name = name;
        m.start = start;
        m.end = end;
        m.progress = progress;
      }
    }

    const indexedMilestones = existingMilestones
      .sort((a: Milestone, b: Milestone) => {
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

    await persistMilestonesWithId(indexedMilestones, req.session.startupId);

    res.status(200).json();
  } catch (error) {
    console.error(
      `Failed to update milestone with id ${id}. Error: ${error}. Redirecting to /startup/submit ${error}`
    );
    res.redirect("/startup/submit");
  }
});

router.post("/submit/new-patent", async (req, res) => {
  const {
    invention,
    newInventor,
    patentStatus,
    patentConfirmationDate,
    patentOffice,
    patentExaminationNoticeDate,
    patentGrantDate,
    patentDuration,
  } = req.body;
  let newPatent: NewPatent;
  try {
    if (
      patentConfirmationDate === "" &&
      patentExaminationNoticeDate === "" &&
      patentGrantDate === ""
    ) {
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
    } else if (
      patentConfirmationDate !== "" &&
      patentExaminationNoticeDate === "" &&
      patentGrantDate === ""
    ) {
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
    } else if (
      patentConfirmationDate === "" &&
      patentExaminationNoticeDate !== "" &&
      patentGrantDate === ""
    ) {
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
    } else if (
      patentConfirmationDate === "" &&
      patentExaminationNoticeDate === "" &&
      patentGrantDate !== ""
    ) {
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
    } else {
      throw new Error("Unknown Patent status.");
    }
    await insertNewPatent(newPatent, req.session.startupId);
    res.redirect("/startup/submit");
  } catch (error) {
    console.error(
      `Failed to add new Patent. Error: ${error}. Redirecting to /startup/submit ${error}`
    );
    res.redirect("/startup/submit");
  }
});

router.post("/submit/update-patent", async (req, res) => {
  const {
    patentId,
    patentStatus,
    submissionFeeDeadline,
    annualFeeDeadline,
    inventorNominationDeadline,
    examinationRequestDeadline,
    examinationNoticeDeadline,
    grantFeeDeadline,
    objectionFilingDeadline,
    objectionResponseDeadline,
  } = req.body;

  let p:
    | UpdatedPatentDisclosure
    | UpdatedPatentExamination
    | UpdatedPatentObjection;
  try {
    if (
      patentId === undefined ||
      patentId === "" ||
      patentStatus === undefined ||
      patentStatus === ""
    ) {
      throw new Error("Patent or Status not identifiable.");
    } else if (patentStatus === "disclosure-phase") {
      const lastAnnualFeeDate: Date = await getPatentAnnualFeeDateById(
        patentId
      );
      const newAnnualFeeDate = new Date(lastAnnualFeeDate);
      newAnnualFeeDate.setFullYear(lastAnnualFeeDate.getFullYear() + 1);
      p = {
        id: patentId,
        registrationFee: submissionFeeDeadline === "on" ? true : false,
        annualFeeDate:
          annualFeeDeadline === "on" ? newAnnualFeeDate : lastAnnualFeeDate,
        inventorNomination: inventorNominationDeadline === "on" ? true : false,
        examinationRequest: examinationRequestDeadline === "on" ? true : false,
      };
    } else if (patentStatus === "examination-phase") {
      p = {
        id: patentId,
        patentExaminationNotice:
          examinationNoticeDeadline === "on" ? true : false,
      };
    } else if (patentStatus === "objection-phase") {
      p = {
        id: patentId,
        grantFee: grantFeeDeadline === "on" ? true : false,
        objection: objectionFilingDeadline === "on" ? true : false,
        objectionResponse: objectionResponseDeadline === "on" ? true : false,
      };
    } else {
      throw new Error("Phase not identifiable");
    }
    await updatePatent(p);
    res.redirect("/startup/submit");
  } catch (error) {
    console.error(
      `Failed to update patent information. Error: ${error}. Redirecting to /startup/submit ${error}`
    );
    res.redirect("/startup/submit");
  }
});

router.post("/submit/initial-patent-application", async (req, res) => {
  const { patentId, confirmationDate } = req.body;

  try {
    await persistPatentConfirmationDate(patentId, new Date(confirmationDate));
    res.redirect("/startup/submit");
  } catch (error) {
    console.error(
      `Failed to update initial patent information. Error: ${error}. Redirecting to /startup/submit ${error}`
    );
    res.redirect("/startup/submit");
  }
});

router.post("/submit/update-status", async (req, res) => {
  const { currentPatentStatus, patentId, nextPhaseDate, grantDuration } =
    req.body;

  try {
    await updatePatentPhaseStatus(
      patentId,
      currentPatentStatus,
      new Date(nextPhaseDate),
      parseInt(grantDuration)
    );
    res.redirect("/startup/submit");
  } catch (error) {
    console.error(
      `Failed to update patent information. Error: ${error}. Redirecting to /startup/submit ${error}`
    );
    res.redirect("/startup/submit");
  }
});

router.post("/submit/cancel-patent", async (req, res) => {
  const { id, date, status, reason } = req.body;
  try {
    await updateCancelPatent(id, reason, status, new Date(date));
    res.redirect("/startup/submit");
  } catch (error) {
    console.error(
      `Failed to set patent as canceled with patent id ${id}. ${error}. Redirecting to /startup/submit ${error}`
    );
    res.redirect("/startup/submit");
  }
});

export default router;
