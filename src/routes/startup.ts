import express, { Router, Request } from "express";
import {
  getKpis,
  getStartupNameById,
  InvestmentPhaseKpis,
  Kpis,
  TimeSeriesKpis,
  InvestmentPhase,
  getInvestmentPhase,
} from "../models/startup";

const router: Router = express.Router();

router.get("/", (req, res) => {
  console.log("fund: " + req.session.fundId);
  console.log("startup: " + req.session.startupId);
  if (req.session.fundId !== undefined) {
    res.redirect("/fund/" + req.session.fundId);
  } else if (req.session.startupId !== undefined) {
    res.redirect("/startup/" + req.session.startupId);
  } else {
    res.redirect("/");
  }
});

router.get("/:startupId/", (req, res) => {
  res.render("dashboard/startup/index", {
    layout: "../views/layouts/startup.ejs",
    phase: req.phase,
    kpis: req.kpis,
    page: "dashboard",
    title: req.startupName,
    name: req.user?.firstName + " " + req.user?.lastName,
  });
});

router.param("startupId", async (req, res, next, startupId) => {
  try {
    await getStartupKpiRequestData(req, startupId);
    req.session.phase = await getInvestmentPhase(startupId);
  } catch (error) {
    throw new Error(
      `Failed to fetch startup kpi request data for startup with id ${startupId}`
    );
  }

  next();
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
          netProfitMargin: kpis[kpis.length - 1].netProfitMargin,
          cashFlowRate: kpis[kpis.length - 1].cashFlowRate,
          liquidity: kpis[kpis.length - 1].liquidity,
        });
      toPeriodDataKpis(kpis, req);
      break;
    case InvestmentPhase.Startup:
      (req.phase = phase),
        (req.kpis = {
          netProfitMargin: kpis[kpis.length - 1].netProfitMargin,
          cashFlowRate: kpis[kpis.length - 1].cashFlowRate,
          liquidity: kpis[kpis.length - 1].liquidity,
        });
      toPeriodDataKpis(kpis, req);
      break;
    case InvestmentPhase.FirstStage:
      (req.phase = phase),
        (req.kpis = {
          netProfitMargin: kpis[kpis.length - 1].netProfitMargin,
          cashFlowRate: kpis[kpis.length - 1].cashFlowRate,
          liquidity: kpis[kpis.length - 1].liquidity,
        });
      toPeriodDataKpis(kpis, req);
      break;
    case InvestmentPhase.SecondStage:
      (req.phase = phase),
        (req.kpis = {
          netProfitMargin: kpis[kpis.length - 1].netProfitMargin,
          cashFlowRate: kpis[kpis.length - 1].cashFlowRate,
          liquidity: kpis[kpis.length - 1].liquidity,
        });
      toPeriodDataKpis(kpis, req);
      break;
    case InvestmentPhase.ThirdStage:
      (req.phase = phase),
        (req.kpis = {
          netProfitMargin: kpis[kpis.length - 1].netProfitMargin,
          cashFlowRate: kpis[kpis.length - 1].cashFlowRate,
          liquidity: kpis[kpis.length - 1].liquidity,
        });
      toPeriodDataKpis(kpis, req);
      break;
    case InvestmentPhase.Final:
      (req.phase = phase),
        (req.kpis = {
          netProfitMargin: kpis[kpis.length - 1].netProfitMargin,
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
          netProfitMargin: -1,
          cashFlowRate: -1,
          liquidity: -1,
        });
      toPeriodDataKpis(kpis, req);
      break;
    case InvestmentPhase.Startup:
      req.kpis = {
        netProfitMargin: -1,
        cashFlowRate: -1,
        liquidity: -1,
      };
      toPeriodDataKpis(kpis, req);
      break;
    case InvestmentPhase.FirstStage:
      req.kpis = {
        netProfitMargin: -1,
        cashFlowRate: -1,
        liquidity: -1,
      };
      toPeriodDataKpis(kpis, req);
      break;
    case InvestmentPhase.SecondStage:
      req.kpis = {
        netProfitMargin: -1,
        cashFlowRate: -1,
        liquidity: -1,
      };
      toPeriodDataKpis(kpis, req);
      break;
    case InvestmentPhase.ThirdStage:
      req.kpis = {
        netProfitMargin: -1,
        cashFlowRate: -1,
        liquidity: -1,
      };
      toPeriodDataKpis(kpis, req);
      break;
    case InvestmentPhase.Final:
      req.kpis = {
        netProfitMargin: -1,
        cashFlowRate: -1,
        liquidity: -1,
      };
      toPeriodDataKpis(kpis, req);
      break;
  }

  const netProfitMarginTs: TimeSeriesKpis = {
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

  req.session.netProfitMarginTs = netProfitMarginTs;
  req.session.cashFlowRateTs = cashFlowRateTs;
  req.session.liquidityTs = liquidityTs;
}

function toPeriodDataKpis(kpis: Kpis[], req: Request) {
  const months: string[] = [];
  const netProfitMargin: number[] = [];
  const cashFlowRate: number[] = [];
  const liquidity: number[] = [];

  kpis.forEach((i) => {
    months.push(i.date);
    netProfitMargin.push(i.netProfitMargin);
    cashFlowRate.push(i.cashFlowRate);
    liquidity.push(i.liquidity);
  });

  const netProfitMarginTs: TimeSeriesKpis = {
    months: months,
    periodData: netProfitMargin,
  };

  const cashFlowRateTs: TimeSeriesKpis = {
    months: months,
    periodData: cashFlowRate,
  };

  const liquidityTs: TimeSeriesKpis = {
    months: months,
    periodData: liquidity,
  };

  req.session.netProfitMarginTs = netProfitMarginTs;
  req.session.cashFlowRateTs = cashFlowRateTs;
  req.session.liquidityTs = liquidityTs;
}

router.get("/chart/npm", (req, res) => {
  res.status(200).json(req.session.netProfitMarginTs);
});

router.get("/chart/cfr", (req, res) => {
  res.status(200).json(req.session.cashFlowRateTs);
});

router.get("/chart/liq", (req, res) => {
  res.status(200).json(req.session.liquidityTs);
});

export default router;
// [{"date":"2022-09-04T13:33:03.969Z","liquidity":50,"cashFlowRate":60,"netProfitMargin":70},{"date":"2022-10-04T13:33:03.969Z","liquidity":50,"cashFlowRate":60,"netProfitMargin":70},{"date":"2022-11-04T13:33:03.969Z","liquidity":50,"cashFlowRate":60,"netProfitMargin":70},{"date":"2022-12-04T13:33:03.969Z","liquidity":60,"cashFlowRate":60,"netProfitMargin":90},{"date":"2022-01-04T13:33:03.969Z","liquidity":40,"cashFlowRate":40,"netProfitMargin":70},{"date":"2022-02-04T13:33:03.969Z","liquidity":50,"cashFlowRate":20,"netProfitMargin":90},{"date":"2022-03-04T13:33:03.969Z","liquidity":50,"cashFlowRate":60,"netProfitMargin":70}, {"date":"2022-04-04T13:33:03.969Z","liquidity":50,"cashFlowRate":60,"netProfitMargin":70},{"date":"2022-05-04T13:33:03.969Z","liquidity":60,"cashFlowRate":60,"netProfitMargin":90},{"date":"2022-06-04T13:33:03.969Z","liquidity":40,"cashFlowRate":40,"netProfitMargin":70},{"date":"2022-07-04T13:33:03.969Z","liquidity":50,"cashFlowRate":20,"netProfitMargin":90},{"date":"2022-08-04T13:33:03.969Z","liquidity":50,"cashFlowRate":60,"netProfitMargin":70}]
