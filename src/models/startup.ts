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
  netProfitMargin: number;
  cashFlowRate: number;
  liquidity: number;
}

interface StartupKpis {
  date: string;
  netProfitMargin: number;
  cashFlowRate: number;
  liquidity: number;
}

interface FirstStageKpis {
  date: string;
  netProfitMargin: number;
  cashFlowRate: number;
  liquidity: number;
}

interface SecondStageKpis {
  date: string;
  netProfitMargin: number;
  cashFlowRate: number;
  liquidity: number;
}

interface ThirdStageKpis {
  date: string;
  netProfitMargin: number;
  cashFlowRate: number;
  liquidity: number;
}

interface FinalKpis {
  date: string;
  netProfitMargin: number;
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

const updateKpis = async (
  kpis: Kpis,
  startupId: string,
) => {
  const client = await pool.connect();
  let phase;
  try {

    const result = await client.query(
      `SELECT stage from startup WHERE id = $1`,
      [startupId]
    );

    if (result.rowCount != 1) {
      throw new Error(`Unable to identify phase for startup with id ${startupId}`);  
    }

    phase = result.rows[0].stage;

    console.log(`${kpis.cashFlowRate} ${startupId} ${phase}`)

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

export {
  Startup,
  Kpis,
  TimeSeriesKpis,
  InvestmentPhase,
  InvestmentPhaseKpis,
  getStartupById,
  getStartupNameById,
  getStartups,
  getKpis,
  updateKpis,
  getInvestmentPhase,
};
