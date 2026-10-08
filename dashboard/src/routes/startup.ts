import express, { NextFunction, Request, Response, Router } from "express";
import { Row } from "read-excel-file";
import { StartupOwnedTable, belongsToStartup } from "../models/ownership";
import {
  getInvestmentPhase,
  getStartupNameById,
  getCapTable,
  updateInvestmentPhase,
  updateInvestedCapital,
  persistCapTable,
} from "../models/startup";

import {
  Milestone,
  getMilestones,
  updateMilestoneDuration,
  updateMilestoneProgress,
  UnIndexedMilestone,
  NewMilestone,
  persistMilestones,
  persistMilestonesWithId,
} from "../models/milestone";

import {
  getTrl,
  TrlData,
  updateTrl,
  deleteTrl,
  persistTrlData,
} from "../models/trl";

import { Metrics, getMetrics } from "../models/metrics";

import {
  getInvestors,
  NewInvestor,
  insertInvestor,
  updateInvestorStatus,
} from "../models/potential_investor";

import {
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
} from "../models/patent";

import { getMonth, toDateInputValue } from "../util/date";
import {
  deleteSpreadsheets,
  formatCapTable,
  capTableUpload,
  uploadCapTable,
} from "../util/excel";

const router: Router = express.Router();

// Rejects requests that reference a record which does not belong to the
// logged-in user's startup.
const ownedRecord =
  (table: StartupOwnedTable, getId: (req: Request) => unknown) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (await belongsToStartup(table, getId(req), req.session.startupId)) {
        return next();
      }
      console.error(
        `Startup ${req.session.startupId} tried to access a ${table} record it does not own.`
      );
      res.status(403).send("Forbidden");
    } catch (error) {
      console.error(`Failed to verify ${table} ownership due to ${error}.`);
      res.sendStatus(500);
    }
  };

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
      res.render("dashboard/startup/index", {
        layout: "../views/layouts/dashboard.ejs",
        dashboard: "startup",
        scripts: [
          "/js/gantt/frappe-gantt.min",
          "/js/chart/chart.min",
          "/js/startup",
        ],
        phase: await getInvestmentPhase(startupId),
        page: "dashboard",
        title: await getStartupNameById(startupId),
        name: req.user?.firstName + " " + req.user?.lastName,
        trl: await getTrl(startupId),
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

router.put(
  "/gantt/period",
  ownedRecord("milestones", (req) => req.body.taskId),
  async (req, res) => {
    const { taskId, start, end } = req.body;

    try {
      await updateMilestoneDuration(taskId, start, end);
      res.sendStatus(200);
    } catch (error) {
      console.error(`Failed to update Milestone duration due to ${error}.`);
      res.sendStatus(500);
    }
  }
);

router.put(
  "/gantt/progress",
  ownedRecord("milestones", (req) => req.body.taskId),
  async (req, res) => {
    const { taskId, progress } = req.body;

    try {
      await updateMilestoneProgress(taskId, progress);
      res.sendStatus(200);
    } catch (error) {
      console.error(`Failed to update Milestone progress due to ${error}.`);
      res.sendStatus(500);
    }
  }
);

// =============================== Submit =====================================
router.get("/submit", async (req, res, next) => {
  try {
    const trl = await getTrl(req.session.startupId);
    const investors = await getInvestors(req.session.startupId);

    const startupName: string = await getStartupNameById(req.session.startupId);
    req.session.startupName = startupName;

    const investmentPhase: string = await getInvestmentPhase(
      req.session.startupId
    );
    req.session.phase = investmentPhase;

    // Milestone dates are rendered as YYYY-MM-DD so the inline edit form can
    // load them into <input type="date"> without losing the value.
    const milestones = (await getMilestones(req.session.startupId)).map(
      (milestone) => ({
        ...milestone,
        start: toDateInputValue(milestone.start),
        end: toDateInputValue(milestone.end),
      })
    );

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
  } catch (error) {
    next(error);
  }
});

router.post("/submit/reupload", (req, res) => {
  deleteSpreadsheets();
  res.redirect("/startup/submit");
});

router.post("/submit/cap-table", capTableUpload, async (req, res) => {
  const { nextPhase, investedCapital } = req.body;
  try {
    // Parse first so an invalid file does not leave a half-applied
    // investment round behind.
    const rows = await uploadCapTable(req.file);
    const capTable = formatCapTable(rows);

    const startupId = req.session.startupId;

    await updateInvestmentPhase(startupId, nextPhase);
    await updateInvestedCapital(startupId, parseInt(investedCapital));
    await persistCapTable(JSON.stringify(capTable), startupId);
    res.redirect("/startup/submit");

    return;
  } catch (error) {
    console.error(
      `The following error occurred during upload of a cap table. Redirecting to /startup/submit ${error}`
    );
    res.redirect("/startup/submit?capTableError=1");
  }
});

router.post(
  "/submit/update-trl",
  ownedRecord("trl", (req) => req.body.trlData?.id),
  async (req, res) => {
    const { id, technology, trl, criticality } = req.body.trlData;
    try {
      const trlData: TrlData = {
        id,
        technology,
        trl,
        criticality,
      };

      await updateTrl(trlData);
      res.sendStatus(200);
    } catch (error) {
      console.error(
        `The following error occurred during update of a technology trl with id ${id}. Redirecting to /startup/submit ${error}`
      );
      res.redirect("/startup/submit");
    }
  }
);

// Older clients send { id: { id } }; current clients send { id }.
const trlIdFromBody = (body: { id?: unknown }): unknown =>
  body.id !== null && typeof body.id === "object"
    ? (body.id as { id?: unknown }).id
    : body.id;

router.post(
  "/submit/delete-trl",
  ownedRecord("trl", (req) => trlIdFromBody(req.body)),
  async (req, res) => {
    const id = String(trlIdFromBody(req.body));
    try {
      await deleteTrl(id);
      res.sendStatus(200);
    } catch (error) {
      console.error(
        `The following error occurred during deletion of a technology trl with id ${id}. Redirecting to /startup/submit ${error}`
      );
      res.redirect("/startup/submit");
    }
  }
);

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

router.post(
  "/submit/update-investor-status",
  ownedRecord("investors", (req) => req.body.id),
  async (req, res) => {
    const { id, status } = req.body;
    if (!["contacted", "accepted", "declined"].includes(status)) {
      res.status(400).json({ error: "Unknown investor status." });
      return;
    }
    try {
      await updateInvestorStatus(status, id);
      res.status(200).json();
    } catch (error) {
      console.error(
        `Failed to update investors status. Error: ${error}. Redirecting to /startup/submit ${error}`
      );
      res.redirect("/startup/submit");
    }
  }
);

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

  const startDate = new Date(start);
  const endDate = new Date(end);
  const progressValue = Number(progress);
  if (
    typeof name !== "string" ||
    name.trim() === "" ||
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime()) ||
    endDate.getTime() < startDate.getTime() ||
    progress === "" ||
    !Number.isFinite(progressValue) ||
    progressValue < 0 ||
    progressValue > 100
  ) {
    res.status(400).json({
      error:
        "Please provide a name, valid start and due dates (due date not before start date) and a completion between 0 and 100.",
    });
    return;
  }

  try {
    const existingMilestones: Milestone[] = await getMilestones(
      req.session.startupId
    );

    if (!existingMilestones.some((m) => m.id == id)) {
      res.status(404).json({ error: "Milestone not found." });
      return;
    }

    for (const m of existingMilestones) {
      if (m.id == id) {
        m.name = name.trim();
        m.start = start;
        m.end = end;
        m.progress = progressValue;
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

router.post(
  "/submit/update-patent",
  ownedRecord("patents", (req) => req.body.patentId),
  async (req, res) => {
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
          inventorNomination:
            inventorNominationDeadline === "on" ? true : false,
          examinationRequest:
            examinationRequestDeadline === "on" ? true : false,
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
  }
);

router.post(
  "/submit/initial-patent-application",
  ownedRecord("patents", (req) => req.body.patentId),
  async (req, res) => {
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
  }
);

router.post(
  "/submit/update-status",
  ownedRecord("patents", (req) => req.body.patentId),
  async (req, res) => {
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
  }
);

router.post(
  "/submit/cancel-patent",
  ownedRecord("patents", (req) => req.body.id),
  async (req, res) => {
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
  }
);

export default router;
