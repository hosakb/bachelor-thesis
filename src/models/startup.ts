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
  id: string;
  technology: string;
  trl: number;
  criticality: number;
}

interface Questionnaire {
  q1_1_1: number;
  q1_2_1: number;
  q1_2_2: number;
  q1_2_3: number;
  q1_2_4: number;
  q1_2_5: number;
  q1_2_6: number;
  q1_2_7: number;
  q1_2_8: number;
  q1_2_9: number;
  q1_2_10: number;
  q1_2_11: number;
  q1_2_12: number;
  q1_2_13: number;
  q1_2_14: number;
  q1_2_15: number;
  q1_2_16: number;
  q1_2_17: number;
  q1_2_18: number;
  q1_2_19: number;
  q1_2_20: number;
  q1_2_21: number;
  q1_2_22: number;
  q1_2_23: number;
  q1_2_24: number;
  q1_3_1: number;
  q1_3_2: number;
  q1_4_1: number;
  q1_4_2: number;
  q1_4_3: number;
  q1_4_4: number;
  q1_5_1: number;
  q1_5_2: number;
  q1_5_3: number;
  q1_5_4: number;
  q1_5_5: number;
  q1_5_6: number;
  q1_5_7: number;
  q2_1_1: number;
  q2_1_2: number;
  q2_1_3: number;
  q2_1_4: number;
  q2_1_5: number;
  q2_1_6: number;
  q2_1_7: number;
  q2_1_8: number;
  q2_1_9: number;
  q2_1_10: number;
  q2_2_1: number;
  q2_2_2: number;
  q2_2_3: number;
  q2_3_1: number;
  q2_3_2: number;
  q2_3_3: number;
  q2_3_4: number;
  q2_3_5: number;
  q2_3_6: number;
  q2_4_1: number;
  q2_4_2: number;
  q2_4_3: number;
  q2_4_4: number;
  q2_4_5: number;
  q2_4_6: number;
  q2_4_7: number;
  q2_5_1: number;
  q2_5_2: number;
  q2_5_3: number;
  q2_5_4: number;
  q2_5_5: number;
  q2_5_6: number;
  q2_5_7: number;
  q2_5_8: number;
  q3_1_1: number;
  q3_1_2: number;
  q3_1_3: number;
  q3_1_4: number;
  q3_2_1: number;
  q3_2_2: number;
  q3_2_3: number;
  q3_2_4: number;
  q4_1_1: number;
  q4_1_2: number;
  q4_2_1: number;
  q4_2_2: number;
  q4_2_3: number;
  q4_2_4: number;
  q5_1_1: number;
  q5_1_2: number;
  q5_1_3: number;
  q5_1_4: number;
  q6_1_1: number;
  q6_1_2: number;
  q6_1_3: number;
  q6_1_4: number;
  q6_1_5: number;
  q6_2_1: number;
  q6_2_2: number;
  q6_3_1: number;
  q6_3_2: number;
  q6_3_3: number;
  q6_3_4: number;
  q6_3_5: number;
  q6_4_1: number;
  q6_4_2: number;
  q6_4_3: number;
  q6_4_4: number;
  q6_5_1: number;
  q6_5_2: number;
  q6_5_3: number;
  q7_1_1: number;
  q7_1_2: number;
  q7_1_3: number;
  q7_1_4: number;
  q7_1_5: number;
  q7_2_1: number;
  q7_2_2: number;
  q7_3_1: number;
  q7_3_2: number;
  q7_3_3: number;
  q7_4_1: number;
  q7_5_1: number;
  q8_1_1: number;
  q8_1_2: number;
  q8_1_3: number;
  q8_1_4: number;
  q8_1_5: number;
  q8_1_6: number;
}

interface QuestionnaireAvg {
  h1: number;
  h1_2: number;
  q1_2_4_block_1: number;
  q1_2_block_2: number;
  q1_2_block_3: number;
  h1_3: number;
  h1_4: number;
  h1_5: number;
  h2: number;
  h2_1: number;
  h2_2: number;
  h2_3: number;
  h2_4: number;
  h2_5: number;
  h3: number;
  h3_1: number;
  h3_2: number;
  h4: number;
  h4_1: number;
  h4_2: number;
  h5: number;
  h6: number;
  h6_1: number;
  h6_2: number;
  h6_3: number;
  h6_4: number;
  h6_5: number;
  h7: number;
  h7_1: number;
  h7_2: number;
  h7_3: number;
  h7_4: number;
  h7_5: number;
  h8: number;
  sum: number;
}

interface Rating {
  h1: number;
  h1_2: number;
  h1_3: number;
  h1_4: number;
  h1_5: number;
  h2: number;
  h2_1: number;
  h2_2: number;
  h2_3: number;
  h2_4: number;
  h2_5: number;
  h3: number;
  h3_1: number;
  h3_2: number;
  h4: number;
  h4_1: number;
  h4_2: number;
  h5: number;
  h6: number;
  h6_1: number;
  h6_2: number;
  h6_3: number;
  h6_4: number;
  h6_5: number;
  h7: number;
  h7_1: number;
  h7_2: number;
  h7_3: number;
  h7_4: number;
  h7_5: number;
  h8: number;
  total: number;
}

interface Weights {
  h1: number;
  h2: number;
  h3: number;
  h4: number;
  h5: number;
  h6: number;
  h7: number;
  h8: number;
  sum: number;
}

interface WeightedPoints {
  h1: number;
  h2: number;
  h3: number;
  h4: number;
  h5: number;
  h6: number;
  h7: number;
  h8: number;
  sum: number;
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
      "SELECT startup.product, trl.id, trl.technology, trl.trl, trl.criticality FROM trl JOIN startup ON trl.startup_id = startup.id WHERE startup.id = $1;",
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
      id: trl.id,
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

const updateTrl = async (trlData: TrlData) => {
  const client = await pool.connect();
  try {
    await client.query(
      "UPDATE trl SET technology = $1, trl = $2, criticality = $3 WHERE id = $4;",
      [trlData.technology, trlData.trl, trlData.criticality, trlData.id]
    );
  } catch (err) {
    throw new Error(`${err}`);
  } finally {
    client.release();
  }
};

const deleteTrl = async (id: string) => {
  const client = await pool.connect();
  try {
    await client.query("DELETE FROM trl WHERE id = $1;", [id]);
  } catch (err) {
    throw new Error(`${err}`);
  } finally {
    client.release();
  }
};

const persistQuestionnaire = async (
  startupId: string,
  questionnaire: Questionnaire
) => {
  const client = await pool.connect();
  try {
    await client.query("UPDATE startup SET questionnaire = $1 WHERE id = $2;", [
      JSON.stringify(questionnaire),
      startupId,
    ]);
  } catch (err) {
    throw new Error(
      `Failed to persist questionnaire data for startup with id with id ${startupId} with the following error: ${err}`
    );
  } finally {
    client.release();
  }
};

const getQuestionnaire = async (startupId: string): Promise<Questionnaire> => {
  const client = await pool.connect();
  let result;
  try {
    result = await client.query(
      "SELECT questionnaire FROM startup WHERE id = $1;",
      [startupId]
    );
  } catch (err) {
    throw new Error(
      `Failed to query questionnaire data for startup with id with id ${startupId} with the following error: ${err}`
    );
  } finally {
    client.release();
  }
  return result.rows[0].questionnaire;
};

const updateWeights = async (startupId: string, weights: Weights) => {
  const client = await pool.connect();
  try {
    await client.query("UPDATE startup SET weights = $1 WHERE id = $2;", [
      JSON.stringify(weights),
      startupId,
    ]);
  } catch (err) {
    throw new Error(
      `Failed to update weights data for startup with id ${startupId} with the following error: ${err}`
    );
  } finally {
    client.release();
  }
};

const getWeights = async (startupId: string): Promise<Weights> => {
  const client = await pool.connect();
  let result;
  try {
    result = await client.query("SELECT weights FROM startup WHERE id = $1;", [
      startupId,
    ]);
  } catch (err) {
    throw new Error(
      `Failed to query questionnaire data for startup with id with id ${startupId} with the following error: ${err}`
    );
  } finally {
    client.release();
  }
  return result.rows[0].weights;
};

const getQuestionnaireFilledOut = async (startupId: string) => {
  const client = await pool.connect();
  let result;
  try {
    result = await client.query(
      "SELECT questionnaire FROM startup WHERE id = $1;",
      [startupId]
    );
  } catch (err) {
    throw new Error(
      `Failed to query questionnaire data for startup with id with id ${startupId} with the following error: ${err}`
    );
  } finally {
    client.release();
  }
  if (result.rows[0].questionnaire == undefined) {
    return false;
  } else {
    return true;
  }
};

export {
  InvestmentPhase,
  InvestmentPhaseKpis,
  Kpis,
  Milestone,
  Startup,
  Rating,
  StartupInfo,
  QuestionnaireAvg,
  TimeSeriesKpis,
  TrlData,
  Questionnaire,
  Weights,
  WeightedPoints,
  getCapTable,
  getFirstStartupLoginById,
  getInfoByStartupId,
  getInvestmentPhase,
  getKpis,
  getMilestones,
  persistQuestionnaire,
  getNewStartupById,
  getQuestionnaireFilledOut,
  getQuestionnaire,
  getStartupById,
  getStartupNameById,
  getStartups,
  updateWeights,
  getTrlAvailable,
  persistCapTable,
  persistInfo,
  getWeights,
  persistTrlData,
  persistMilestones,
  persistCoreTechnology,
  updateKpis,
  updateTrl,
  updateMilestoneDuration,
  updateMilestoneProgress,
  getTrl,
  deleteTrl,
};
