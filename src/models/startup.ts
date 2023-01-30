import pool from "../config/db";
import { calcTrlProd } from "../util/calc/trl";

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
  productToMarket: boolean;
  investedCapital: number
}

interface Milestone {
  id: string;
  index: number;
  name: string;
  start: string;
  end: string;
  progress: number;
}

interface NewMilestone {
  index: number;
  name: string;
  start: string;
  end: string;
  progress: number;
}

interface UnIndexedMilestone {
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

interface Metrics {
  date: Date;
  burnRate: number;
  cashRunway: number;
  liquidity: number;
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

interface NewInvestor {
  name: string;
  type: string;
  email: string;
  number: string | undefined;
  url: string | undefined;
  country: string;
  notes: string | undefined;
  contactDate: Date;
  startupId: string;
}

interface Investor {
  id: string;
  name: string;
  type: string;
  email: string;
  number: string | undefined;
  url: string | undefined;
  country: string;
  notes: string | undefined;
  contactDate: Date;
  status: string;
}

interface UpdatedInvestor {
  id: string;
  email: string;
  number: string | undefined;
  url: string | undefined;
  notes: string | undefined;
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

const getStartups = async () => {
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
    await client.query("UPDATE startup set stage = $1 where id = $2", [
      investmentPhase,
      startupId,
    ]);
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
      "UPDATE startup set invested_capital = $1 where id = $2",
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
    await client.query("UPDATE startup SET cap_table = $1 WHERE id = $2", [
      capTable,
      startupId,
    ]);
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
    await client.query("UPDATE startup SET name = $1 WHERE id = $2", [
      name,
      startupId,
    ]);
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
    await client.query("UPDATE startup SET stage = $1, invested_capital = $2, sector = $3, has_product = $4 , est_time_to_market = $5 WHERE id = $6", [
     startupInfo.phase,
     startupInfo.investedCapital,
     startupInfo.sector,
     startupInfo.productToMarket,
     startupInfo.timeToMarket,
      startupId,
    ]);
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

const persistMilestones = async (
  milestones: NewMilestone[],
  startupId: string
) => {
  const client = await pool.connect();
  try {
    await client.query("DELETE FROM milestones WHERE startup_id = $1;", [
      startupId,
    ]);

    for (const milestone of milestones) {
      await client.query(
        "INSERT INTO milestones (start_date, end_date, progress, startup_id, name, index) VALUES ($1, $2, $3, $4, $5, $6)",
        [
          milestone.start,
          milestone.end,
          milestone.progress,
          startupId,
          milestone.name,
          milestone.index,
        ]
      );
    }
  } catch (err) {
    throw new Error(
      `Failed to insert startup milestones for startup id ${startupId}. Error: ${err}`
    );
  } finally {
    client.release();
  }
};

const persistMilestonesWithId = async (
  milestones: Milestone[],
  startupId: string
) => {
  const client = await pool.connect();
  try {
    await client.query("DELETE FROM milestones WHERE startup_id = $1;", [
      startupId,
    ]);

    for (const milestone of milestones) {
      await client.query(
        "INSERT INTO milestones (id, start_date, end_date, progress, startup_id, name, index) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [
          milestone.id,
          milestone.start,
          milestone.end,
          milestone.progress,
          startupId,
          milestone.name,
          milestone.index,
        ]
      );
    }
  } catch (err) {
    throw new Error(
      `Failed to insert startup milestones for startup id ${startupId}. Error: ${err}`
    );
  } finally {
    client.release();
  }
};

const getMilestones = async (startupId: string): Promise<Milestone[]> => {
  const client = await pool.connect();
  let result;
  try {
    result = await client.query(
      "SELECT id, name, start_date, end_date, progress, index FROM milestones WHERE startup_id = $1",
      [startupId]
    );
  } catch (err) {
    throw new Error(
      `Failed to query milestones for startup id ${startupId}. Error: ${err}`
    );
  } finally {
    client.release();
  }

  const milestones: Milestone[] = result.rows.map((row) => {
    return {
      id: row.id,
      index: row.index,
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
      `Failed to update milestones progress with id ${taskId}. Error: ${err}`
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
      `Failed to update milestone with id ${taskId}. Error: ${err}`
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
      `Failed to query availability of trl data for startup with id ${startupId}. Error: ${err}`
    );
  } finally {
    client.release();
  }
  if (result.rowCount == 0) {
    return false;
  }

  return true;
};

const getTrl = async (startupId: string): Promise<Trl> => {
  const client = await pool.connect();
  let result;
  try {
    result = await client.query(
      "SELECT startup.product, trl.id, trl.technology, trl.trl, trl.criticality FROM trl JOIN startup ON trl.startup_id = startup.id WHERE startup.id = $1;",
      [startupId]
    );
  } catch (err) {
    throw new Error(
      `Failed to query trl data for startup with id ${startupId}. Error: ${err}`
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
      `Failed to persist trl data for startup with id ${startupId}. Error: ${err}`
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
      `Failed to persist product for startup with id ${startupId}. Error: ${err}`
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
    throw new Error(`Failed to delete trl with id ${id}. Error: ${err}`);
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
    await client.query("UPDATE startup SET questionnaire = $1 WHERE id = $2;", [
      JSON.stringify(questionnaire),
      startupId,
    ]);
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

const getMetrics = async (startupId: string): Promise<Metrics[]> => {
  const client = await pool.connect();
  let result;
  try {
    result = await client.query(
      "SELECT date, burn_rate, cash_runway, liquidity FROM metrics WHERE startup = $1;",
      [startupId]
    );
  } catch (err) {
    throw new Error(
      `Failed to query metrics data for startup with id ${startupId}. Error: ${err}`
    );
  } finally {
    client.release();
  }

  const metrics: Metrics[] = result.rows.map((row) => {
    return {
      date: row.date,
      burnRate: row.burn_rate,
      cashRunway: row.cash_runway,
      liquidity: row.liquidity,
    };
  });

  return metrics;
};

const persistMetrics = async (metrics: Metrics, startupId: string) => {
  const client = await pool.connect();
  try {
    await client.query(
      "INSERT INTO metrics (date, burn_rate, cash_runway, liquidity, startup) VALUES ($1, $2, $3, $4, $5)",
      [
        metrics.date,
        metrics.burnRate,
        metrics.cashRunway,
        metrics.liquidity,
        startupId,
      ]
    );
  } catch (err) {
    throw new Error(
      `Failed to persist metrics data for startup with id ${startupId}. Error: ${err}`
    );
  } finally {
    client.release();
  }
};

const insertInvestor = async (investor: NewInvestor) => {
  const client = await pool.connect();
  try {
    await client.query(
      "INSERT INTO investors (name, type, email, number, url, country, notes, contact_date, startup_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
      [
        investor.name,
        investor.type,
        investor.email,
        investor.number,
        investor.url,
        investor.country,
        investor.notes,
        investor.contactDate,
        investor.startupId,
      ]
    );
  } catch (err) {
    throw new Error(
      `Failed to persist contacted investor startup with id ${investor.startupId}. Error: ${err}`
    );
  } finally {
    client.release();
  }
};

const getInvestors = async (startupId: string): Promise<Investor[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT id, name, type, email, number, url, country, notes, contact_date, startup_id, status FROM investors WHERE startup_id = $1;",
      [startupId]
    );

    const investors: Investor[] = result.rows.map((row) => {
      return {
        id: row.id,
        name: row.name,
        type: row.type,
        email: row.email,
        number: row.number,
        url: row.url,
        country: row.country,
        notes: row.notes,
        contactDate: row.contact_date,
        status: row.status,
      };
    });

    return investors;
  } catch (err) {
    throw new Error(
      `Failed to contacted investors for startup with id ${startupId}. Error: ${err}`
    );
  } finally {
    client.release();
  }
};

const updateInvestor = async (updatedInvestor: UpdatedInvestor) => {
  const client = await pool.connect();
  try {
    await client.query(
      "UPDATE investors SET email = $1, number = $2, url = $3, notes = $4  WHERE id = $5;",
      [
        updatedInvestor.email,
        updatedInvestor.notes,
        updatedInvestor.url,
        updatedInvestor.notes,
        updatedInvestor.id,
      ]
    );
  } catch (err) {
    throw new Error(
      `Failed to update contacted investors for with id ${updatedInvestor.id}. Error: ${err}`
    );
  } finally {
    client.release();
  }
};

const updateInvestorStatus = async (status: string, id: string) => {
  const client = await pool.connect();
  try {
    await client.query("UPDATE investors SET status = $1 WHERE id = $2;", [
      status,
      id,
    ]);
  } catch (err) {
    throw new Error(
      `Failed to update contacted investors status with id ${id}. Error: ${err}`
    );
  } finally {
    client.release();
  }
};

export {
  InvestmentPhase,
  Metrics,
  Milestone,
  StartupTableRow,
  Startup,
  Rating,
  StartupInfo,
  QuestionnaireAvg,
  TrlData,
  Questionnaire,
  WeightedPoints,
  NewMilestone,
  Investor,
  NewInvestor,
  UnIndexedMilestone,
  insertNewStartup,
  getStartupIds,
  getCapTable,
  getFirstStartupLoginById,
  getInfoByStartupId,
  getInvestmentPhase,
  getMetrics,
  getMilestones,
  persistQuestionnaire,
  getNewStartupById,
  getQuestionnaireFilledOut,
  getQuestionnaire,
  getStartupTableRowById,
  getStartupNameById,
  getStartups,
  persistMetrics,
  getTrlAvailable,
  persistCapTable,
  getAllStartups,
  persistInfo,
  persistTrlData,
  persistMilestones,
  persistCoreTechnology,
  updateTrl,
  updateMilestoneDuration,
  updateInvestedCapital,
  updateMilestoneProgress,
  updateStartupName,
  getTrl,
  deleteTrl,
  deleteStartup,
  updateInvestmentPhase,
  insertInvestor,
  updateInvestor,
  persistMilestonesWithId,
  updateInvestorStatus,
  getInvestors,
};
