import express, { Router, Request } from "express";
import { BusinessCentral } from "../api/business-central";
import {
  getInvestmentPhase,
  Milestone,
  getMilestones,
  updateMilestoneDuration,
  updateMilestoneProgress,
  getTrl,
  Metrics,
  getMetrics,
} from "../models/startup";
import { getMonth } from "../util/date";

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
        title: req.startupName,
        name: req.user?.firstName + " " + req.user?.lastName,
        trl: trl,
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

    const burnRate =  metrics.map((x) => {
      return x.burnRate;
    });
    const runway =  metrics.map((x) => {
      return x.runway;
    });
    const liquidity  =  metrics.map((x) => {
      return x.liquidity;
    });

    const chartData = {
      milestones,
      burnRate: {
        months,
        periodData: burnRate
      },
      runway: {
        months,
        periodData: runway
      },
      liquidity: {
        months,
        periodData: liquidity
      }
    }

    res.status(200).json(chartData);
  } catch (error) {
    res.status(200).json([]);
  }
});

router.put("/gantt/period", async (req, res) => {
  const { taskId, start, end } = req.body;

  try {
    await updateMilestoneDuration(taskId, start, end);
  } catch (error) {
    console.error(`Failed to update Milestone duration due to ${error}.`);
  }
});

router.put("/gantt/progress", async (req, res) => {
  const { taskId, progress } = req.body;

  try {
    await updateMilestoneProgress(taskId, progress);
  } catch (error) {
    console.error(`Failed to update Milestone progress due to ${error}.`);
  }
});

export default router;
