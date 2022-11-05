import pool from "../config/db";

interface Startup {
  id: string;
  name: string;
  stage: string;
  totalInvestment?: number;
  share?: number;
  sector?: string;
  kpis?: Kpis;
}

interface Kpis {
  date: string;
  netProfitMargin: number;
  cashFlowRate: number;
  liquidity: number;
}

const getStartupById = async (startupId: string) => {
  let client = await pool.connect();

  try {
    let result = await client.query(
      "SELECT id, name, stage, info FROM startup WHERE id=$1",
      [startupId]
    );

    const { id, name, stage, info } = result.rows[0];

    let share = info[0] === undefined ? "Not available" : info[0].share; //TODO: Fallback?
    let sector = info[0] === undefined ? "Not available" : info[0].sector; //TODO: Fallback?
    let totalInvestment =
      info[0] === undefined ? "Not available" : info[0].totalInvestment; //TODO: Fallback?

    let s: Startup = {
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

const getKpis = async (startupId: string) => {
  let client = await pool.connect();

  try {
    let result = await client.query(`SELECT kpis FROM startup WHERE id=$1`, [
      startupId,
    ]);

    let kpis: Kpis[] = result.rows[0].kpis;

    return kpis;
  } catch (err) {
    throw new Error(`Failed to query kpis with the following error: ${err}`);
  } finally {
    client.release();
  }
};

const getStartups = async () => {
  let client = await pool.connect();

  try {
    let result = await client.query("SELECT name, stage FROM startup");

    if (result.rowCount === 0) {
      throw new Error(`No startups found found in db.`);
    }

    let startups: Startup[] = result.rows.map((row) => {
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

const updateKpis = async (kpis: Kpis, startupId: string) => {
  let client = await pool.connect();

  try {
    await client.query(
      `UPDATE startup SET updated_at = NOW(), kpis = kpis || $1::jsonb WHERE id = $2;`,
      [kpis, startupId]
    );
  } catch (err) {
    throw new Error(
      `Failed to update kpis ${kpis} due to the following error: ${err}`
    );
  } finally {
    client.release();
  }
};
export { Startup, Kpis, getStartupById, getStartups, getKpis, updateKpis };
