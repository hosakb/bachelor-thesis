import pool from "../config/db";

interface Startup {
  id: string;
  name: string;
  stage: string;
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
  revenue: string;
  productToMarket: string;
  timeToMarket: number;
  sector: string;
}

const getFirstStartupLoginById = async (startUpId: string) => {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT info FROM startup
      WHERE id = $1`,
      [startUpId]
    );

    if (result.rowCount === 0) {
      throw new Error("No startup found for id: " + startUpId);
    }

    const infoJson = result.rows[0].info;
    const info: StartupInfo[] = JSON.parse(JSON.stringify(infoJson));

    if (info.length == 0) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    throw new Error(
      `  "Failed query for first login for startup with email: ${startUpId}. Error:  ${err}`
    );
  } finally {
    client.release();
  }
};

const getStartupById = async (startupId: string) => {
  const client = await pool.connect();

  try {
    const result = await client.query(
      "SELECT id, name, stage, info FROM startup WHERE id=$1",
      [startupId]
    );

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
  } catch (err) {
    throw new Error(
      `Failed to query startup infos with the following error: ${err}`
    );
  } finally {
    client.release();
  }
};

const getStartups = async () => {
  const client = await pool.connect();

  try {
    const result = await client.query("SELECT name, stage FROM startup");

    if (result.rowCount === 0) {
      throw new Error(`No startups found found in db.`);
    }

    const startups: Startup[] = result.rows.map((row) => {
      return { id: row.id, name: row.name, stage: row.stage };
    });

    return startups;
  } catch (err) {
    throw new Error(
      `Failed to fetch all startups due to the following error: ${err}`
    );
  } finally {
    client.release();
  }
};

const getStartupNameById = async (startupId: string) => {
  const client = await pool.connect();

  try {
    const result = await client.query(
      "SELECT name FROM startup WHERE id = $1",
      [startupId]
    );

    if (result.rowCount === 0) {
      throw new Error(`No startups found found for id ${startupId}.`);
    }

    return result.rows[0].name;
  } catch (err) {
    throw new Error(
      `Failed to query startup with id ${startupId} due to the following error: ${err}`
    );
  } finally {
    client.release();
  }
};

const getKpis = async (startupId: string): Promise<InvestmentPhaseKpis> => {
  const client = await pool.connect();

  try {
    const result = await client.query(`SELECT stage FROM startup WHERE id=$1`, [
      startupId,
    ]);

    let investmentPhaseKpis: InvestmentPhaseKpis;
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

    return investmentPhaseKpis;
  } catch (err) {
    throw new Error(`Failed to query kpis with the following error: ${err}`);
  } finally {
    client.release();
  }
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
  try {
    const result = await client.query("SELECT stage FROM startup WHERE id=$1", [
      startupId,
    ]);

    const phase: InvestmentPhase = result.rows[0].stage;

    return phase;
  } catch (err) {
    throw new Error(
      `Failed to query investment phase for startup id ${startupId} with the following error: ${err}`
    );
  } finally {
    client.release();
  }
};

const persistCapTable = async (capTable: string, startupId: string) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "UPDATE startup SET cap_table = $1 WHERE id = $2",
      [capTable, startupId]
    );
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
  try {
    const result = await client.query(
      "SELECT cap_table FROM startup WHERE id = $1",
      [startupId]
    );

    return JSON.parse(result.rows[0].cap_table);
  } catch (err) {
    throw new Error(
      `Failed to fetch cap table for startup id ${startupId} with the following error: ${err}`
    );
  } finally {
    client.release();
  }
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

export {
  Startup,
  Kpis,
  TimeSeriesKpis,
  InvestmentPhase,
  InvestmentPhaseKpis,
  StartupInfo,
  getFirstStartupLoginById,
  getStartupById,
  getStartupNameById,
  getStartups,
  getKpis,
  updateKpis,
  getInvestmentPhase,
  persistCapTable,
  getCapTable,
  persistInfo,
};
