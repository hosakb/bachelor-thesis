import pool from "../config/db";
import { calcTrlProd } from "../util/calc/trl";

interface Startup {
  id: string;
  name: string;
  stage?: string;
  totalInvestment?: number;
  share?: number;
  sector?: string;
}

type Kpis =
  | SeedKpis
  | StartupKpis
  | FirstStageKpis
  | SecondStageKpis
  | ThirdStageKpis
  | FinalKpis;

interface InvestmentPhaseKpis {
  phase: InvestmentPhase;
  kpis: Kpis[];
}

interface SeedKpis {
  date: string;
  numberOfEmployees: number;
  cashFlowRate: number;
  liquidity: number;
}

interface StartupKpis {
  date: string;
  numberOfEmployees: number;
  cashFlowRate: number;
  liquidity: number;
}

interface FirstStageKpis {
  date: string;
  numberOfEmployees: number;
  cashFlowRate: number;
  liquidity: number;
}

interface SecondStageKpis {
  date: string;
  numberOfEmployees: number;
  cashFlowRate: number;
  liquidity: number;
}

interface ThirdStageKpis {
  date: string;
  numberOfEmployees: number;
  cashFlowRate: number;
  liquidity: number;
}

interface FinalKpis {
  date: string;
  numberOfEmployees: number;
  cashFlowRate: number;
  liquidity: number;
}

interface TimeSeriesKpis {
  months: string[];
  periodData: number[];
}

enum InvestmentPhase {
  Seed = "seed",
  Startup = "startup",
  FirstStage = "first_stage",
  SecondStage = "second_stage",
  ThirdStage = "third_stage",
  Final = "final",
}

interface StartupInfo {
  phase: string;
  sector: string;
  timeToMarket: number;
  productToMarket: string;
  startDatePhase: string;
  dueDatePhase: string;
  progress: number;
}

interface Milestone {
  id: string;
  name: string;
  start: string;
  end: string;
  progress: number;
}

interface Trl {
  product: string;
  trlProd: number;
  trlData: TrlData[];
}

interface TrlData {
  technology: string;
  trl: number;
  criticality: number;
}

const getFirstStartupLoginById = async (startUpId: string) => {
  const client = await pool.connect();
  let result;
  try {
    result = await client.query(
      `SELECT info FROM startup
      WHERE id = $1`,
      [startUpId]
    );

    if (result.rowCount === 0) {
      throw new Error("No startup found for id: " + startUpId);
    }
  } catch (err) {
    throw new Error(
      `  "Failed query for first login for startup with email: ${startUpId}. Error:  ${err}`
    );
  } finally {
    client.release();
  }

  if (result.rows[0].info == undefined) {
    return true;
  } else {
    return false;
  }
};

const getNewStartupById = async (startupId: string) => {
  const client = await pool.connect();
  let result;
  try {
    result = await client.query("SELECT id, name FROM startup WHERE id=$1", [
      startupId,
    ]);
  } catch (err) {
    throw new Error(
      `Failed to query startup infos with the following error: ${err}`
    );
  } finally {
    client.release();
  }

  const { id, name } = result.rows[0];

  const s: Startup = {
    id,
    name: name,
    stage: undefined,
    share: undefined,
    sector: undefined,
    totalInvestment: undefined,
  };

  return s;
};

const getStartupById = async (startupId: string) => {
  const client = await pool.connect();
  let result;
  try {
    result = await client.query(
      "SELECT id, name, stage, info FROM startup WHERE id=$1",
      [startupId]
    );
  } catch (err) {
    throw new Error(
      `Failed to query startup infos with the following error: ${err}`
    );
  } finally {
    client.release();
  }

  const { id, name, stage, info } = result.rows[0];

  const share = info[0] === undefined ? "Not available" : info[0].share; //TODO: Fallback?
  const sector = info[0] === undefined ? "Not available" : info[0].sector; //TODO: Fallback?
  const totalInvestment =
    info[0] === undefined ? "Not available" : info[0].totalInvestment; //TODO: Fallback?

  const s: Startup = {
    id,
    name: name,
    stage: stage,
    share: share,
    sector: sector,
    totalInvestment: totalInvestment,
  };

  return s;
};

const getStartups = async () => {
  const client = await pool.connect();
  let result;

  try {
    result = await client.query("SELECT name, stage FROM startup");
  } catch (err) {
    throw new Error(
      `Failed to fetch all startups due to the following error: ${err}`
    );
  } finally {
    client.release();
  }

  if (result.rowCount === 0) {
    throw new Error(`No startups found found in db.`);
  }

  const startups: Startup[] = result.rows.map((row) => {
    return { id: row.id, name: row.name, stage: row.stage };
  });

  return startups;
};

const getStartupNameById = async (startupId: string) => {
  const client = await pool.connect();
  let result;
  try {
    result = await client.query("SELECT name FROM startup WHERE id = $1", [
      startupId,
    ]);

    if (result.rowCount === 0) {
      throw new Error(`No startups found found for id ${startupId}.`);
    }
  } catch (err) {
    throw new Error(
      `Failed to query startup with id ${startupId} due to the following error: ${err}`
    );
  } finally {
    client.release();
  }

  return result.rows[0].name;
};

const getKpis = async (startupId: string): Promise<InvestmentPhaseKpis> => {
  const client = await pool.connect();
  let investmentPhaseKpis: InvestmentPhaseKpis;

  try {
    const result = await client.query(`SELECT stage FROM startup WHERE id=$1`, [
      startupId,
    ]);

    let kpis: Kpis[];
    let kpiResult;

    switch (result.rows[0].stage) {
      case InvestmentPhase.Seed:
        kpiResult = await client.query(
          "SELECT seed_phase_kpis FROM startup WHERE id = $1",
          [startupId]
        );

        if (kpiResult.rowCount === 0) {
          throw new Error(
            `No seed phase kpis found for startup with startup id: ${startupId}.`
          );
        }

        kpis = kpiResult.rows[0].seed_phase_kpis;

        investmentPhaseKpis = {
          kpis,
          phase: InvestmentPhase.Seed,
        };

        break;
      case InvestmentPhase.Startup:
        kpiResult = await client.query(
          "SELECT startup_phase_kpis FROM startup WHERE id = $1",
          [startupId]
        );

        if (kpiResult.rowCount === 0) {
          throw new Error(
            `No startup phase kpis found for startup with startup id: ${startupId}.`
          );
        }

        kpis = kpiResult.rows[0].startup_phase_kpis;

        investmentPhaseKpis = {
          kpis,
          phase: InvestmentPhase.Startup,
        };
        break;
      case InvestmentPhase.FirstStage:
        kpiResult = await client.query(
          "SELECT first_stage_kpis FROM startup WHERE id = $1",
          [startupId]
        );

        if (kpiResult.rowCount === 0) {
          throw new Error(
            `No first stage phase kpis found for startup with startup id: ${startupId}.`
          );
        }

        kpis = kpiResult.rows[0].first_stage_kpis;

        investmentPhaseKpis = {
          kpis,
          phase: InvestmentPhase.FirstStage,
        };
        break;
      case InvestmentPhase.SecondStage:
        kpiResult = await client.query(
          "SELECT second_stage_kpis FROM startup WHERE id = $1",
          [startupId]
        );

        if (kpiResult.rowCount === 0) {
          throw new Error(
            `No second stage phase kpis found for startup with startup id: ${startupId}.`
          );
        }

        kpis = kpiResult.rows[0].second_stage_kpis;

        investmentPhaseKpis = {
          kpis,
          phase: InvestmentPhase.SecondStage,
        };
        break;
      case InvestmentPhase.ThirdStage:
        kpiResult = await client.query(
          "SELECT third_stage_kpis FROM startup WHERE id = $1",
          [startupId]
        );

        if (kpiResult.rowCount === 0) {
          throw new Error(
            `No third stage phase kpis found for startup with startup id: ${startupId}.`
          );
        }

        kpis = kpiResult.rows[0].third_stage_kpis;

        investmentPhaseKpis = {
          kpis,
          phase: InvestmentPhase.ThirdStage,
        };
        break;
      case InvestmentPhase.Final:
        kpiResult = await client.query(
          "SELECT final_phase_kpis FROM startup WHERE id = $1",
          [startupId]
        );

        if (kpiResult.rowCount === 0) {
          throw new Error(
            `No final phase kpis found for startup with startup id: ${startupId}.`
          );
        }

        kpis = kpiResult.rows[0].final_phase_kpis;

        investmentPhaseKpis = {
          kpis,
          phase: InvestmentPhase.Final,
        };
        break;
      default:
        throw new Error("Failed to match startup investment phase.");
    }
  } catch (err) {
    throw new Error(`Failed to query kpis with the following error: ${err}`);
  } finally {
    client.release();
  }
  return investmentPhaseKpis;
};

const updateKpis = async (kpis: Kpis, startupId: string) => {
  const client = await pool.connect();
  let phase;
  try {
    const result = await client.query(
      `SELECT stage from startup WHERE id = $1`,
      [startupId]
    );

    if (result.rowCount != 1) {
      throw new Error(
        `Unable to identify phase for startup with id ${startupId}`
      );
    }

    phase = result.rows[0].stage;

    switch (phase) {
      case InvestmentPhase.Seed:
        await client.query(
          `UPDATE startup SET updated_at = NOW(), seed_phase_kpis = seed_phase_kpis || $1::jsonb WHERE id = $2;`,
          [kpis, startupId]
        );
        break;
      case InvestmentPhase.Startup:
        await client.query(
          `UPDATE startup SET updated_at = NOW(), startup_phase_kpis = startup_phase_kpis || $1::jsonb WHERE id = $2;`,
          [kpis, startupId]
        );
        break;
      case InvestmentPhase.FirstStage:
        await client.query(
          `UPDATE startup SET updated_at = NOW(), first_stage_kpis = first_stage_kpis || $1::jsonb WHERE id = $2;`,
          [kpis, startupId]
        );
        break;
      case InvestmentPhase.SecondStage:
        await client.query(
          `UPDATE startup SET updated_at = NOW(), second_stage_kpis = second_stage_kpis || $1::jsonb WHERE id = $2;`,
          [kpis, startupId]
        );
        break;
      case InvestmentPhase.ThirdStage:
        await client.query(
          `UPDATE startup SET updated_at = NOW(), third_stage_kpis = third_stage_kpis || $1::jsonb WHERE id = $2;`,
          [kpis, startupId]
        );
        break;
      case InvestmentPhase.Final:
        await client.query(
          `UPDATE startup SET updated_at = NOW(), final_phase_kpis = final_phase_kpis || $1::jsonb WHERE id = $2;`,
          [kpis, startupId]
        );
        break;
    }
  } catch (err) {
    throw new Error(
      `Failed to update ${phase} kpis due to the following error: ${err}`
    );
  } finally {
    client.release();
  }
};

const getInvestmentPhase = async (startupId: string) => {
  const client = await pool.connect();
  let result;
  try {
    result = await client.query("SELECT stage FROM startup WHERE id=$1", [
      startupId,
    ]);
  } catch (err) {
    throw new Error(
      `Failed to query investment phase for startup id ${startupId} with the following error: ${err}`
    );
  } finally {
    client.release();
  }

  const phase: InvestmentPhase = result.rows[0].stage;

  return phase;
};

const persistCapTable = async (capTable: string, startupId: string) => {
  const client = await pool.connect();
  try {
    await client.query("UPDATE startup SET cap_table = $1 WHERE id = $2", [
      capTable,
      startupId,
    ]);
  } catch (err) {
    throw new Error(
      `Failed to persist cap table for startup id ${startupId} with the following error: ${err}`
    );
  } finally {
    client.release();
  }
};

const getCapTable = async (startupId: string) => {
  const client = await pool.connect();
  let result;
  try {
    result = await client.query("SELECT cap_table FROM startup WHERE id = $1", [
      startupId,
    ]);
  } catch (err) {
    throw new Error(
      `Failed to fetch cap table for startup id ${startupId} with the following error: ${err}`
    );
  } finally {
    client.release();
  }

  const capTable = result.rows[0].cap_table;

  return capTable;
};

const persistInfo = async (startupInfo: StartupInfo, startupId: string) => {
  const client = await pool.connect();
  try {
    await client.query("UPDATE startup SET info = $1 WHERE id = $2", [
      JSON.stringify(startupInfo),
      startupId,
    ]);
  } catch (err) {
    throw new Error(
      `Failed to persist startup info for startup id ${startupId} with the following error: ${err}`
    );
  } finally {
    client.release();
  }
};

const getInfoByStartupId = async (startupId: string) => {
  const client = await pool.connect();
  let result;
  try {
    result = await client.query("SELECT info FROM startup WHERE id = $1", [
      startupId,
    ]);
  } catch (err) {
    throw new Error(
      `Failed to query startup info for startup id ${startupId} with the following error: ${err}`
    );
  } finally {
    client.release();
  }

  const info: StartupInfo = result.rows[0].info;
  return info;
};

const persistMilestones = async (
  milestones: Milestone[],
  startupId: string
) => {
  const client = await pool.connect();
  try {
    for (const milestone of milestones) {
      await client.query(
        "INSERT INTO milestones (name, start_date, end_date, progress, startup_id) VALUES ($1, $2, $3, $4, $5)",
        [
          milestone.name,
          milestone.start,
          milestone.end,
          milestone.progress,
          startupId,
        ]
      );
    }
  } catch (err) {
    throw new Error(
      `Failed to insert startup milestones for startup id ${startupId} with the following error: ${err}`
    );
  } finally {
    client.release();
  }
};

const getMilestones = async (startupId: string) => {
  const client = await pool.connect();
  let result;
  try {
    result = await client.query(
      "SELECT id, name, start_date, end_date, progress FROM milestones WHERE startup_id = $1",
      [startupId]
    );
  } catch (err) {
    throw new Error(
      `Failed to query milestones for startup id ${startupId} with the following error: ${err}`
    );
  } finally {
    client.release();
  }

  const milestones: Milestone[] = result.rows.map((row) => {
    return {
      id: row.id,
      name: row.name,
      start: row.start_date,
      end: row.end_date,
      progress: row.progress,
    };
  });

  return milestones;
};

const updateMilestoneProgress = async (taskId: string, progress: number) => {
  const client = await pool.connect();
  try {
    await client.query("UPDATE milestones SET progress = $1 WHERE id = $2", [
      progress,
      taskId,
    ]);
  } catch (err) {
    throw new Error(
      `Failed to update milestones progress with id ${taskId} with the following error: ${err}`
    );
  } finally {
    client.release();
  }
};

const updateMilestoneDuration = async (
  taskId: string,
  start: string,
  end: string
) => {
  const client = await pool.connect();
  try {
    await client.query(
      "UPDATE milestones SET start_date = $1, end_date = $2 WHERE id = $3",
      [start, end, taskId]
    );
  } catch (err) {
    throw new Error(
      `Failed to update milestone with id ${taskId} with the following error: ${err}`
    );
  } finally {
    client.release();
  }
};

const getTrlAvailable = async (startupId: string) => {
  const client = await pool.connect();
  let result;
  try {
    result = await client.query("SELECT id FROM trl WHERE startup_id = $1;", [
      startupId,
    ]);
  } catch (err) {
    throw new Error(
      `Failed to query availability of trl data for startup with id ${startupId} with the following error: ${err}`
    );
  } finally {
    client.release();
  }
  if (result.rowCount == 0) {
    return false;
  }

  return true;
};

const getTrl = async (startupId: string) => {
  const client = await pool.connect();
  let result;
  try {
    result = await client.query(
      "SELECT startup.product, trl.technology, trl.trl, trl.criticality FROM trl JOIN startup ON trl.startup_id = startup.id WHERE startup.id = $1;",
      [startupId]
    );
  } catch (err) {
    throw new Error(
      `Failed to query trl data for startup with id ${startupId} with the following error: ${err}`
    );
  } finally {
    client.release();
  }

  const trlData: TrlData[] = result.rows.map((trl) => {
    return {
      technology: trl.technology,
      trl: trl.trl,
      criticality: trl.criticality,
    };
  });

  const trl: Trl = {
    product: result.rows[0].product,
    trlProd: calcTrlProd(trlData),
    trlData: trlData,
  };

  return trl;
};

const persistTrlData = async (startupId: string, trlData: TrlData[]) => {
  const client = await pool.connect();
  try {
    for (const trl of trlData) {
      await client.query(
        "INSERT INTO trl (technology, trl, criticality, startup_id) VALUES ($1, $2, $3, $4);",
        [trl.technology, trl.trl, trl.criticality, startupId]
      );
    }
  } catch (err) {
    throw new Error(
      `Failed to persist trl data for startup with id with id ${startupId} with the following error: ${err}`
    );
  } finally {
    client.release();
  }
};

const persistCoreTechnology = async (startupId: string, product: string) => {
  const client = await pool.connect();
  try {
    await client.query("UPDATE startup SET product = $1 WHERE id = $2;", [
      product,
      startupId,
    ]);
  } catch (err) {
    throw new Error(
      `Failed to persist product for startup with id with id ${startupId} with the following error: ${err}`
    );
  } finally {
    client.release();
  }
};

export {
  InvestmentPhase,
  InvestmentPhaseKpis,
  Kpis,
  Milestone,
  Startup,
  StartupInfo,
  TimeSeriesKpis,
  TrlData,
  getCapTable,
  getFirstStartupLoginById,
  getInfoByStartupId,
  getInvestmentPhase,
  getKpis,
  getMilestones,
  getNewStartupById,
  getStartupById,
  getStartupNameById,
  getStartups,
  getTrlAvailable,
  persistCapTable,
  persistInfo,
  persistTrlData,
  persistMilestones,
  persistCoreTechnology,
  updateKpis,
  updateMilestoneDuration,
  updateMilestoneProgress,
  getTrl,
};
