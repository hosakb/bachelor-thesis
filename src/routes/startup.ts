import express, { Router, Request } from "express";
// import { fetchBusinessCentralData } from "../api/business-central";
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

router.get("/", async (req, res) => {
  const startupId = req.user?.startup;

  if (startupId === undefined) {
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
    try {
      // await fetchBusinessCentralData();
      await getStartupKpiRequestData(req, startupId);

      res.render("dashboard/startup/index", {
        layout: "../views/layouts/startup.ejs",
        phase: await getInvestmentPhase(startupId),
        kpis: req.kpis,
        page: "dashboard",
        title: req.startupName,
        name: req.user?.firstName + " " + req.user?.lastName,
      });
    } catch (error) {
      console.log(
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

export default router;
// [{"date":"2022-09-04T13:33:03.969Z","liquidity":50,"cashFlowRate":60,"numberOfEmployees":70},{"date":"2022-10-04T13:33:03.969Z","liquidity":50,"cashFlowRate":60,"numberOfEmployees":70},{"date":"2022-11-04T13:33:03.969Z","liquidity":50,"cashFlowRate":60,"numberOfEmployees":70},{"date":"2022-12-04T13:33:03.969Z","liquidity":60,"cashFlowRate":60,"numberOfEmployees":90},{"date":"2022-01-04T13:33:03.969Z","liquidity":40,"cashFlowRate":40,"numberOfEmployees":70},{"date":"2022-02-04T13:33:03.969Z","liquidity":50,"cashFlowRate":20,"numberOfEmployees":90},{"date":"2022-03-04T13:33:03.969Z","liquidity":50,"cashFlowRate":60,"numberOfEmployees":70}, {"date":"2022-04-04T13:33:03.969Z","liquidity":50,"cashFlowRate":60,"numberOfEmployees":70},{"date":"2022-05-04T13:33:03.969Z","liquidity":60,"cashFlowRate":60,"numberOfEmployees":90},{"date":"2022-06-04T13:33:03.969Z","liquidity":40,"cashFlowRate":40,"numberOfEmployees":70},{"date":"2022-07-04T13:33:03.969Z","liquidity":50,"cashFlowRate":20,"numberOfEmployees":90},{"date":"2022-08-04T13:33:03.969Z","liquidity":50,"cashFlowRate":60,"numberOfEmployees":70}]
