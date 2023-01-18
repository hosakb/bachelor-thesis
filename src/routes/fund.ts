import express, { Router } from "express";
import { Row } from "read-excel-file";
import { getFundById, getFundNameById } from "../models/fund";

import { fundIdExists, getStartupsForFund } from "../models/fund_startup_map";
import { getWeights, updateWeights, Weights } from "../models/fund";
import {
  getCapTable,
  getMetrics,
  getMilestones,
  getQuestionnaire,
  getTrl,
  Metrics,
  Milestone,
  Questionnaire,
  QuestionnaireAvg,
} from "../models/startup";
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
import { Expertise } from "../util/types/express";

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
      if (await !fundIdExists(fundId)) {
        res.redirect("/"); // invalid query result for fundId
        return;
      }

      req.session.startupTable = await getStartupsForFund(fundId);
      const portfolio = await getFundById(fundId);

      res.render("dashboard/fund/index", {
        layout: "../views/layouts/dashboard.ejs",
        dashboard: "fund",
        stylesheets: ["main", "dashboard"],
        scripts: ["/js/table", "/js/ag-grid-community.min"],
        portfolio,
        page: "dashboard",
        title: await getFundNameById(fundId),
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

router.post("/startup", (req, res) => {
  req.session.selectedStartup = req.body.id;
  res.setHeader("content-type", "application/javascript");
  res.redirect(`startup`);
});

router.get("/startup/founders", async (req, res) => {
  const startupId = req.session.selectedStartup;

  if (startupId === undefined) {
    console.log(
      `Redirecting user ${req.user?.id} to fund screen since no selected startup was found.`
    );
    res.redirect("/fund/");
  }
  try {
    const capTable: Row[] = await getCapTable(startupId);

    res.render("dashboard/founders/index", {
      layout: "../views/layouts/dashboard.ejs",
      dashboard: "fund",
      stylesheets: ["main", "dashboard"],
      scripts: [],
      title: req.startupName,
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

router.get("/startup/", async (req, res) => {
  const startupId = req.session.selectedStartup;

  if (startupId === undefined) {
    console.log(
      `Redirecting user ${req.user?.id} to fund screen since no selected startup was found.`
    );
    res.redirect("/fund/");
  }

  try {
    const trl = await getTrl(startupId);

    res.render("dashboard/startup/index", {
      layout: "../views/layouts/dashboard.ejs",
      stylesheets: ["main", "dashboard"],
      scripts: [
        "/js/gantt/frappe-gantt.min",
        "/js/chart/chart.min",
        "/js/fund",
      ],
      dashboard: "fund",
      kpis: req.kpis,
      title: req.startupName,
      page: "startup",
      view: "startup",
      name: req.user?.firstName + " " + req.user?.lastName,
      startup: req.session.selectedStartup,
      trl: trl,
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
    res.redirect("/fund/");
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

    const weightedRating = {
      questionnaire,
      questionnaireAvg,
      weights,
      weightedPoints,
      rating,
      ratingTotal,
    };

    res.render("dashboard/founders/rating", {
      layout: "../views/layouts/dashboard.ejs",
      dashboard: "fund",
      stylesheets: ["main", "dashboard"],
      scripts: ["/js/rating"],
      title: req.startupName,
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
      expertise,
    };

    res.status(200).json(chartData);
  } catch (error) {
    res.status(200).json([]);
  }
});

export default router;
