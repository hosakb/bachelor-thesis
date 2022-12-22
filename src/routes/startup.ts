import express, { Router, Request } from "express";
import { BusinessCentral } from "../api/business-central";
import {
  getKpis,
  getStartupNameById,
  InvestmentPhaseKpis,
  Kpis,
  TimeSeriesKpis,
  InvestmentPhase,
  getInvestmentPhase,
  Milestone,
  getMilestones,
  updateMilestoneDuration,
  updateMilestoneProgress,
} from "../models/startup";

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
      const bc = new BusinessCentral(
        "http://navsrv-2020.lutz.local:18058/BC180-Demo/ODataV4/",
        "CRONUS AG",
        "student",
        "lutzGast_21!"
      ); // TODO: ENV
      bc.queryBusinessCentral();
      await getStartupKpiRequestData(req, startupId);

      res.render("dashboard/startup/index", {
        layout: "../views/layouts/dashboard.ejs",
        dashboard: "startup",
        scripts: ["/js/gantt/frappe-gantt.min", "/js/chart/chart.min", "/js/startup"],
        phase: await getInvestmentPhase(startupId),
        kpis: req.kpis,
        page: "dashboard",
        title: req.startupName,
        name: req.user?.firstName + " " + req.user?.lastName,
      });
    } catch (error) {
      console.error(
        `Failed to fetch startup data for startup with id ${startupId} due to:\n${error}.\nRedirecting to login screen.`
      );
      res.redirect("/");
    }
  }
});

export async function getStartupKpiRequestData(
  req: Request,
  startupId: string
) {
  req.startupName = await getStartupNameById(startupId);
  const investmentPhaseKpis: InvestmentPhaseKpis = await getKpis(startupId);
  const { phase, kpis } = investmentPhaseKpis;

  if (kpis.length === 0) {
    returnEmptyKpiRequestData(phase, req, kpis);
    return;
  }
  returnKpiRequestData(phase, req, kpis);
}

function returnKpiRequestData(
  phase: InvestmentPhase,
  req: Request,
  kpis: Kpis[]
) {
  switch (phase) {
    case InvestmentPhase.Seed:
      (req.phase = phase),
        (req.kpis = {
          numberOfEmployees: kpis[kpis.length - 1].numberOfEmployees,
          cashFlowRate: kpis[kpis.length - 1].cashFlowRate,
          liquidity: kpis[kpis.length - 1].liquidity,
        });
      toPeriodDataKpis(kpis, req);
      break;
    case InvestmentPhase.Startup:
      (req.phase = phase),
        (req.kpis = {
          numberOfEmployees: kpis[kpis.length - 1].numberOfEmployees,
          cashFlowRate: kpis[kpis.length - 1].cashFlowRate,
          liquidity: kpis[kpis.length - 1].liquidity,
        });
      toPeriodDataKpis(kpis, req);
      break;
    case InvestmentPhase.FirstStage:
      (req.phase = phase),
        (req.kpis = {
          numberOfEmployees: kpis[kpis.length - 1].numberOfEmployees,
          cashFlowRate: kpis[kpis.length - 1].cashFlowRate,
          liquidity: kpis[kpis.length - 1].liquidity,
        });
      toPeriodDataKpis(kpis, req);
      break;
    case InvestmentPhase.SecondStage:
      (req.phase = phase),
        (req.kpis = {
          numberOfEmployees: kpis[kpis.length - 1].numberOfEmployees,
          cashFlowRate: kpis[kpis.length - 1].cashFlowRate,
          liquidity: kpis[kpis.length - 1].liquidity,
        });
      toPeriodDataKpis(kpis, req);
      break;
    case InvestmentPhase.ThirdStage:
      (req.phase = phase),
        (req.kpis = {
          numberOfEmployees: kpis[kpis.length - 1].numberOfEmployees,
          cashFlowRate: kpis[kpis.length - 1].cashFlowRate,
          liquidity: kpis[kpis.length - 1].liquidity,
        });
      toPeriodDataKpis(kpis, req);
      break;
    case InvestmentPhase.Final:
      (req.phase = phase),
        (req.kpis = {
          numberOfEmployees: kpis[kpis.length - 1].numberOfEmployees,
          cashFlowRate: kpis[kpis.length - 1].cashFlowRate,
          liquidity: kpis[kpis.length - 1].liquidity,
        });
      toPeriodDataKpis(kpis, req);
      break;
  }
}

function returnEmptyKpiRequestData(
  phase: InvestmentPhase,
  req: Request,
  kpis: Kpis[]
) {
  switch (phase) {
    case InvestmentPhase.Seed:
      (req.phase = phase),
        (req.kpis = {
          numberOfEmployees: -1,
          cashFlowRate: -1,
          liquidity: -1,
        });
      toPeriodDataKpis(kpis, req);
      break;
    case InvestmentPhase.Startup:
      req.kpis = {
        numberOfEmployees: -1,
        cashFlowRate: -1,
        liquidity: -1,
      };
      toPeriodDataKpis(kpis, req);
      break;
    case InvestmentPhase.FirstStage:
      req.kpis = {
        numberOfEmployees: -1,
        cashFlowRate: -1,
        liquidity: -1,
      };
      toPeriodDataKpis(kpis, req);
      break;
    case InvestmentPhase.SecondStage:
      req.kpis = {
        numberOfEmployees: -1,
        cashFlowRate: -1,
        liquidity: -1,
      };
      toPeriodDataKpis(kpis, req);
      break;
    case InvestmentPhase.ThirdStage:
      req.kpis = {
        numberOfEmployees: -1,
        cashFlowRate: -1,
        liquidity: -1,
      };
      toPeriodDataKpis(kpis, req);
      break;
    case InvestmentPhase.Final:
      req.kpis = {
        numberOfEmployees: -1,
        cashFlowRate: -1,
        liquidity: -1,
      };
      toPeriodDataKpis(kpis, req);
      break;
  }

  const numberOfEmployeesTs: TimeSeriesKpis = {
    months: [],
    periodData: [],
  };

  const cashFlowRateTs: TimeSeriesKpis = {
    months: [],
    periodData: [],
  };

  const liquidityTs: TimeSeriesKpis = {
    months: [],
    periodData: [],
  };

  req.session.numberOfEmployeesTs = numberOfEmployeesTs;
  req.session.cashFlowRateTs = cashFlowRateTs;
  req.session.liquidityTs = liquidityTs;
}

function toPeriodDataKpis(kpis: Kpis[], req: Request) {
  const months: string[] = [];
  const numberOfEmployees: number[] = [];
  const cashFlowRate: number[] = [];
  const liquidity: number[] = [];

  kpis.forEach((i) => {
    months.push(i.date);
    numberOfEmployees.push(i.numberOfEmployees);
    cashFlowRate.push(i.cashFlowRate);
    liquidity.push(i.liquidity);
  });

  const numberOfEmployeesTs: TimeSeriesKpis = {
    months: months,
    periodData: numberOfEmployees,
  };

  const cashFlowRateTs: TimeSeriesKpis = {
    months: months,
    periodData: cashFlowRate,
  };

  const liquidityTs: TimeSeriesKpis = {
    months: months,
    periodData: liquidity,
  };

  req.session.numberOfEmployeesTs = numberOfEmployeesTs;
  req.session.cashFlowRateTs = cashFlowRateTs;
  req.session.liquidityTs = liquidityTs;
}

router.get("/chart/noe", (req, res) => {
  res.status(200).json(req.session.numberOfEmployeesTs);
});

router.get("/chart/cfr", (req, res) => {
  res.status(200).json(req.session.cashFlowRateTs);
});

router.get("/chart/liq", (req, res) => {
  res.status(200).json(req.session.liquidityTs);
});

router.get("/chart/gantt", async (req, res) => {
  try {
    const milestones: Milestone[] = await getMilestones(req.session.startupId);
    res.status(200).json(milestones);
  } catch (error) {
    res.status(200).json([]);
  }
});

router.put("/gantt/period", async (req, res) => {
  const {taskId, start, end} = req.body;

  try {
    await updateMilestoneDuration(taskId, start, end);
  } catch (error) {
    console.error(`Failed to update Milestone duration due to ${error}.`)
  }
});

router.put("/gantt/progress", async (req, res) => {
  const {taskId, progress} = req.body;

  try {
    await updateMilestoneProgress(taskId, progress);
  } catch (error) {
    console.error(`Failed to update Milestone progress due to ${error}.`)
  }
});

export default router;
