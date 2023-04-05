import pool from "../config/db";

interface StartupTableRow {
  id: string;
  name: string;
  stage?: string;
  totalInvestment?: number;
  sector?: string;
  rating?: number;
}

interface Startup {
  id: string;
  name: string;
  stage?: string;
  totalInvestment?: number;
  share?: number;
  sector?: string;
}

interface NewStartup {
  id: string;
  name: string;
}
interface AdminStartup {
  id: string;
  name: string;
  stage: string;
  createdAt: Date;
  updatedAt: Date;
}

interface StartupInfo {
  phase: string;
  sector: string;
  timeToMarket: number;
  productToMarket: boolean;
  investedCapital: number;
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
  q1_3_3: number;
  q1_3_4: number;
  q1_4_1: number;
  q1_4_2: number;
  q1_4_3: number;
  q1_4_4: number;
  q1_4_5: number;
  q1_4_6: number;
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
  q3_1_1: number;
  q3_1_2: number;
  q3_1_3: number;
  q3_1_4: number;
  q4_1_1: number;
  q4_1_2: number;
  q5_1_1: number;
  q5_1_2: number;
  q5_1_3: number;
  q6_1_1: number;
  q6_1_2: number;
  q6_2_1: number;
  q6_2_2: number;
  q6_2_3: number;
  q6_2_4: number;
  q6_2_5: number;
  q6_3_1: number;
  q6_3_2: number;
  q6_3_3: number;
  q6_3_4: number;
  q6_4_1: number;
  q6_4_2: number;
  q6_4_3: number;
  q7_1_1: number;
  q7_1_2: number;
  q7_1_3: number;
  q7_1_4: number;
  q7_1_5: number;
  q7_1_6: number;
  q7_2_1: number;
  q7_2_2: number;
  q8_1_1: number;
  q8_1_2: number;
}

interface QuestionnaireAvg {
  h1: number;
  h1_1: number;
  h1_2: number;
  q1_2_4_block_1: number;
  q1_2_block_2: number;
  q1_2_block_3: number;
  h1_3: number;
  h1_4: number;
  h2: number;
  h2_1: number;
  h2_2: number;
  h2_3: number;
  h2_4: number;
  h2_5: number;
  h3: number;
  h4: number;
  h5: number;
  h6: number;
  h6_1: number;
  h6_2: number;
  h6_3: number;
  h6_4: number;
  h7: number;
  h7_1: number;
  h7_2: number;
  h8: number;
  sum: number;
}

interface Rating {
  h1: number;
  h1_2: number;
  h1_3: number;
  h1_4: number;
  h2: number;
  h2_1: number;
  h2_2: number;
  h2_3: number;
  h2_4: number;
  h2_5: number;
  h3: number;
  h4: number;
  h5: number;
  h6: number;
  h6_1: number;
  h6_2: number;
  h6_3: number;
  h6_4: number;
  h7: number;
  h7_1: number;
  h7_2: number;
  h8: number;
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

const insertNewStartup = async (startupName: string): Promise<string> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO startup (name) VALUES ($1) RETURNING id;`,
      [startupName]
    );
    if (result.rows[0].id == undefined || result.rows[0].id == null) {
      throw new Error(
        `Expected value for id after inserting. Received ${result.rows[0].id}.`
      );
    }
    return result.rows[0].id;
  } catch (err) {
    throw new Error(`Failed insert new startup. Error: ${err}`);
  } finally {
    client.release();
  }
};

const getStartupIds = async (): Promise<string[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT id FROM startup`, []);

    return result.rows.map((row) => {
      return row.id;
    });
  } catch (err) {
    throw new Error(`Failed query Startup Ids. Error: ${err}`);
  } finally {
    client.release();
  }
};

const getFirstStartupLoginById = async (startUpId: string) => {
  const client = await pool.connect();
  let result;
  try {
    result = await client.query(
      `SELECT cap_table FROM startup
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

  if (result.rows[0].cap_table == null) {
    return true;
  } else {
    return false;
  }
};

const getNewStartupById = async (startupId: string): Promise<NewStartup> => {
  const client = await pool.connect();
  let result;
  try {
    result = await client.query("SELECT id, name FROM startup WHERE id=$1", [
      startupId,
    ]);
  } catch (err) {
    throw new Error(`Failed to query new Startup. Error: ${err}`);
  } finally {
    client.release();
  }

  const { id, name } = result.rows[0];

  const s: NewStartup = {
    id,
    name: name,
  };

  return s;
};

const getStartupTableRowById = async (
  startupId: string
): Promise<StartupTableRow> => {
  const client = await pool.connect();
  let result;
  try {
    result = await client.query(
      "SELECT id, name, stage, invested_capital, sector FROM startup WHERE id=$1",
      [startupId]
    );
  } catch (err) {
    throw new Error(`Failed to query startup infos. Error: ${err}`);
  } finally {
    client.release();
  }

  const { id, name, stage, invested_capital, sector } = result.rows[0];

  const s: StartupTableRow = {
    id,
    name: name,
    stage: stage,
    sector: sector,
    totalInvestment: invested_capital,
  };

  return s;
};

const getStartups = async (): Promise<Startup[]> => {
  const client = await pool.connect();
  let result;

  try {
    result = await client.query("SELECT id, name, stage FROM startup");
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

const getAllStartups = async (): Promise<AdminStartup[]> => {
  const client = await pool.connect();

  try {
    const result = await client.query(
      "SELECT id, name, stage, created_at, updated_at  FROM startup"
    );

    return result.rows.map((startup) => {
      return {
        id: startup.id,
        name: startup.name,
        stage: startup.stage,
        createdAt: startup.created_at,
        updatedAt: startup.updated_at,
      };
    });
  } catch (err) {
    throw new Error(
      `Failed to fetch all startups due to the following error: ${err}`
    );
  } finally {
    client.release();
  }
};

const getStartupNameById = async (startupId: string): Promise<string> => {
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

const getInvestmentPhase = async (startupId: string) => {
  const client = await pool.connect();
  let result;
  try {
    result = await client.query("SELECT stage FROM startup WHERE id=$1", [
      startupId,
    ]);
  } catch (err) {
    throw new Error(
      `Failed to query investment phase for startup id ${startupId}. Error: ${err}`
    );
  } finally {
    client.release();
  }

  const phase: string = result.rows[0].stage;

  return phase;
};

const updateInvestmentPhase = async (
  startupId: string,
  investmentPhase: string
) => {
  const client = await pool.connect();
  try {
    await client.query(
      "UPDATE startup set stage = $1, updated_at = NOW() where id = $2",
      [investmentPhase, startupId]
    );
  } catch (err) {
    throw new Error(
      `Failed to update investment phase for startup id ${startupId}. Error: ${err}`
    );
  } finally {
    client.release();
  }
};

const updateInvestedCapital = async (
  startupId: string,
  investedCapital: number
) => {
  const client = await pool.connect();
  try {
    await client.query(
      "UPDATE startup set invested_capital = $1, updated_at = NOW() where id = $2",
      [investedCapital, startupId]
    );
  } catch (err) {
    throw new Error(
      `Failed to update invested capital for startup id ${startupId}. Error: ${err}`
    );
  } finally {
    client.release();
  }
};

const persistCapTable = async (capTable: string, startupId: string) => {
  const client = await pool.connect();
  try {
    await client.query(
      "UPDATE startup SET cap_table = $1, updated_at = NOW() WHERE id = $2",
      [capTable, startupId]
    );
  } catch (err) {
    throw new Error(
      `Failed to persist cap table for startup id ${startupId}. Error: ${err}`
    );
  } finally {
    client.release();
  }
};

const updateStartupName = async (name: string, startupId: string) => {
  const client = await pool.connect();
  try {
    await client.query(
      "UPDATE startup SET name = $1, updated_at = NOW() WHERE id = $2",
      [name, startupId]
    );
  } catch (err) {
    throw new Error(
      `Failed to update startup name for startup id ${startupId}. Error: ${err}`
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
      `Failed to fetch cap table for startup id ${startupId}. Error: ${err}`
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
    await client.query(
      "UPDATE startup SET stage = $1, invested_capital = $2, sector = $3, has_product = $4 , est_time_to_market = $5, updated_at = NOW() WHERE id = $6",
      [
        startupInfo.phase,
        startupInfo.investedCapital,
        startupInfo.sector,
        startupInfo.productToMarket,
        startupInfo.timeToMarket,
        startupId,
      ]
    );
  } catch (err) {
    throw new Error(
      `Failed to persist startup info for startup id ${startupId}. Error: ${err}`
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
      `Failed to query startup info for startup id ${startupId}. Error: ${err}`
    );
  } finally {
    client.release();
  }

  const info: StartupInfo = result.rows[0].info;
  return info;
};

const persistCoreTechnology = async (startupId: string, product: string) => {
  const client = await pool.connect();
  try {
    await client.query(
      "UPDATE startup SET product = $1, updated_at = NOW() WHERE id = $2;",
      [product, startupId]
    );
  } catch (err) {
    throw new Error(
      `Failed to persist product for startup with id ${startupId}. Error: ${err}`
    );
  } finally {
    client.release();
  }
};

const deleteStartup = async (id: string) => {
  const client = await pool.connect();
  try {
    await client.query("DELETE FROM startup WHERE id = $1;", [id]);
  } catch (err) {
    throw new Error(`Failed to delete startup with id ${id}. Error: ${err}`);
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
    await client.query(
      "UPDATE startup SET questionnaire = $1, updated_at = NOW() WHERE id = $2;",
      [JSON.stringify(questionnaire), startupId]
    );
  } catch (err) {
    throw new Error(
      `Failed to persist questionnaire data for startup with id ${startupId}. Error: ${err}`
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
      `Failed to query questionnaire data for startup with id ${startupId}. Error: ${err}`
    );
  } finally {
    client.release();
  }
  return result.rows[0].questionnaire;
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
      `Failed to query questionnaire data for startup with id ${startupId}. Error: ${err}`
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
  Questionnaire,
  QuestionnaireAvg,
  Rating,
  Startup,
  StartupInfo,
  StartupTableRow,
  WeightedPoints,
  deleteStartup,
  getAllStartups,
  getCapTable,
  getFirstStartupLoginById,
  getInfoByStartupId,
  getInvestmentPhase,
  getNewStartupById,
  getQuestionnaire,
  getQuestionnaireFilledOut,
  getStartupIds,
  getStartupNameById,
  getStartups,
  getStartupTableRowById,
  insertNewStartup,
  persistCapTable,
  persistCoreTechnology,
  persistInfo,
  persistQuestionnaire,
  updateInvestedCapital,
  updateInvestmentPhase,
  updateStartupName,
};
