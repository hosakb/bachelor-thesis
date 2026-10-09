import express, { Router } from "express";
import { Row } from "read-excel-file";
import {
  investorIdExists,
  getInvestorById,
  getInvestorNameById,
} from "../models/investor";
import { Expertise } from "../models/track_record";
import {
  getStartupsForInvestor,
  updateRatingTotal,
} from "../models/investor_startup_map";
import { getWeights, updateWeights, Weights } from "../models/investor";
import {
  getCapTable,
  getQuestionnaire,
  Questionnaire,
  QuestionnaireAvg,
} from "../models/startup";

import { Milestone, getMilestones } from "../models/milestone";

import { getTrl } from "../models/trl";
import { getStartupNameById } from "../models/startup";
import { startupInFundPortfolio } from "../models/ownership";

import { Metrics, getMetrics } from "../models/metrics";
import { getInvestors } from "../models/potential_investor";
import { getAllPatents } from "../models/patent";
import {
  getExpertiseByStartup,
  getFoundersByStartupId,
} from "../models/track_record";
import {
  getQuestionnaireAverages,
  getAllRatings,
  getWeightedPoints,
} from "../util/calc/rating";
import { getMonth } from "../util/date";

const router: Router = express.Router();

router.get("/", async (req, res) => {
  const fundId = req.user?.fund;

  if (fundId === undefined) {
    if (req.user?.startup !== undefined) {
      console.log(
        `Redirecting user ${req.user?.id} to startup screen since no fund id is assigned.`
      );
      res.redirect("/startup");
    } else {
      console.log(
        `Redirecting user ${req.user?.id} to login screen since no fund id or startup id are assigned.`
      );
      res.redirect("/");
    }
  } else {
    req.session.fundId = fundId;

    try {
      if (!(await investorIdExists(fundId))) {
        res.redirect("/"); // invalid query result for fundId
        return;
      }

      req.session.startupTable = await getStartupsForInvestor(fundId);
      const portfolio = await getInvestorById(fundId);

      res.render("dashboard/fund/index", {
        layout: "../views/layouts/dashboard.ejs",
        dashboard: "fund",
        scripts: ["/js/table", "/js/ag-grid-community.min"],
        portfolio,
        page: "dashboard",
        title: await getInvestorNameById(fundId),
        name: req.user?.firstName + " " + req.user?.lastName,
        view: "fund",
      });
    } catch (error) {
      console.error(
        `Failed to fetch fund data for startup with id ${fundId} due to:\n${error}.\nRedirecting to login screen.`
      );
      res.redirect("/");
    }
  }
});

router.get("/table/values", (req, res) => {
  res.status(200).json(req.session.startupTable);
});

router.post("/startup", async (req, res) => {
  const startupId = req.body.id;

  try {
    if (!(await startupInFundPortfolio(req.session.fundId, startupId))) {
      console.error(
        `Fund ${req.session.fundId} tried to select startup ${startupId} outside its portfolio.`
      );
      res.status(403).send("Forbidden");
      return;
    }

    req.session.selectedStartup = String(startupId);
    req.session.startupName = await getStartupNameById(String(startupId));
  } catch (error) {
    console.error(
      `Failed to select startup ${startupId} due to ${error}. Redirecting to fund dashboard.`
    );
    res.redirect("/fund/");
    return;
  }

  res.setHeader("content-type", "application/javascript");
  res.redirect(`startup`);
});

router.get("/startup/founders", async (req, res) => {
  const startupId = req.session.selectedStartup;

  if (startupId === undefined) {
    console.log(
      `Redirecting user ${req.user?.id} to fund screen since no selected startup was found.`
    );
    return res.redirect("/fund/");
  }
  try {
    const capTable: Row[] = await getCapTable(startupId);

    res.render("dashboard/fund/founders", {
      layout: "../views/layouts/dashboard.ejs",
      dashboard: "fund",
      scripts: ["/js/chart/chart.min", "/js/founders"],
      title: req.session.startupName,
      name: req.user?.firstName + " " + req.user?.lastName,
      founders: await getFoundersByStartupId(startupId),
      startup: req.session.selectedStartup,
      page: "founders",
      capTable,
    });
  } catch (error) {
    console.error(
      `Failed to fetch startup request data for startup with id ${startupId} due to:\n${error}.\nRedirecting to fund dashboard.`
    );
    res.redirect("/fund/");
  }
});

router.post("/expertise", async (req, res) => {
  try {
    const startupId = req.session.selectedStartup;

    const expertiseValues = await getExpertiseByStartup(startupId);

    const expertise: Expertise = {
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
  } catch (error) {
    res.status(200).json([]);
  }
});

router.get("/startup/", async (req, res) => {
  const startupId = req.session.selectedStartup;

  if (startupId === undefined) {
    console.log(
      `Redirecting user ${req.user?.id} to fund screen since no selected startup was found.`
    );
    return res.redirect("/fund/");
  }

  try {
    const trl = await getTrl(startupId);

    res.render("dashboard/startup/index", {
      layout: "../views/layouts/dashboard.ejs",
      scripts: [
        "/js/gantt/frappe-gantt.min",
        "/js/chart/chart.min",
        "/js/fund",
      ],
      dashboard: "fund",
      title: req.session.startupName,
      page: "startup",
      view: "startup",
      name: req.user?.firstName + " " + req.user?.lastName,
      startup: req.session.selectedStartup,
      trl: trl,
      investors: await getInvestors(startupId),
      patents: await getAllPatents(startupId),
    });
  } catch (error) {
    console.error(
      `Failed to fetch startup request data for startup with id ${startupId} due to:\n${error}.\nRedirecting to fund dashboard.`
    );
    res.redirect("/fund/");
  }
});

router.get("/startup/rating", async (req, res) => {
  const startupId = req.session.selectedStartup;
  const fundId = req.session.fundId;

  if (startupId === undefined) {
    console.log(
      `Redirecting user ${req.user?.id} to fund screen since no selected startup was found.`
    );
    return res.redirect("/fund/");
  }
  try {
    const questionnaire: Questionnaire = await getQuestionnaire(startupId);

    let q: keyof typeof questionnaire;
    for (q in questionnaire) {
      if (Object.prototype.hasOwnProperty.call(questionnaire, q)) {
        questionnaire[q] = parseFloat(questionnaire[q].toFixed(1));
      }
    }

    const questionnaireAvg: QuestionnaireAvg =
      getQuestionnaireAverages(questionnaire);

    let qa: keyof typeof questionnaireAvg;
    for (qa in questionnaireAvg) {
      if (Object.prototype.hasOwnProperty.call(questionnaireAvg, qa)) {
        questionnaireAvg[qa] = parseFloat(questionnaireAvg[qa].toFixed(1));
      }
    }

    const weights: Weights = await getWeights(fundId);
    const weightedPoints = getWeightedPoints(questionnaireAvg, weights);

    let wp: keyof typeof weightedPoints;
    for (wp in weightedPoints) {
      if (Object.prototype.hasOwnProperty.call(weightedPoints, wp)) {
        weightedPoints[wp] = parseFloat(weightedPoints[wp].toFixed(1));
      }
    }

    const rating = getAllRatings(questionnaireAvg);

    let r: keyof typeof rating;
    for (r in rating) {
      if (Object.prototype.hasOwnProperty.call(rating, r)) {
        rating[r] = parseFloat(rating[r].toFixed(2));
      }
    }

    const ratingTotal = parseFloat(
      (18 - (17 * weightedPoints.sum) / (weights.sum * 5)).toFixed(2)
    );

    await updateRatingTotal(ratingTotal, startupId, fundId);

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
      title: req.session.startupName,
      name: req.user?.firstName + " " + req.user?.lastName,
      startup: req.session.selectedStartup,
      weightedRating: weightedRating,
      page: "rating",
    });
  } catch (error) {
    console.error(
      `Failed to fetch startup request data for startup with id ${startupId} due to:\n${error}.\nRedirecting to fund dashboard.`
    );
    res.redirect("/fund/");
  }
});

router.post("/update-weights", async (req, res) => {
  const { weights } = req.body;

  const newWeights: Weights = weights;

  const fundId = req.session.fundId;

  try {
    await updateWeights(fundId, newWeights);
    res.redirect("/fund/startup/rating");
  } catch (error) {
    console.error(
      `Failed to update weights for fund with id ${fundId} due to: ${error}. Redirect to login screen.`
    );
    res.redirect("/");
  }
});

router.get("/chart/data", async (req, res) => {
  try {
    const startupId = req.session.selectedStartup;

    const milestones: Milestone[] = await getMilestones(startupId);
    const metrics: Metrics[] = await getMetrics(startupId);

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

export default router;
