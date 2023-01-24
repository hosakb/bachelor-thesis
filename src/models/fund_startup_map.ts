import pool from "../config/db";

import { StartupTableRow, getStartupTableRowById } from "./startup";

const fundIdExists = async (fundId: string) => {
  const client = await pool.connect();

  try {
    const result = await client.query("SELECT * FROM fund WHERE id=$1", [
      fundId,
    ]);

    if (result.rowCount > 1) {
      console.error(
        `Multiple funds received for fund id: ${fundId}. Expected one.`
      );
      return false;
    } else if (result.rowCount === 0) {
      console.error(`Fund with fund id ${fundId} does not exists.`);
      return false;
    } else {
      return true;
    }
  } catch (err) {
    throw new Error(
      `Failed to validate fund with id ${fundId} with the following error: ${err}`
    );
  } finally {
    client.release();
  }
};

const getStartupsForFund = async (
  fundId: string
): Promise<StartupTableRow[]> => {
  const client = await pool.connect();
  let result;
  try {
    result = await client.query(
      `SELECT startup_id, rating FROM fund_startup_map WHERE fund_id=$1`,
      [fundId]
    );
  } catch (err) {
    throw new Error(
      `Failed to query startup ids and their ratings for fund with id ${fundId}. Error: ${err}`
    );
  } finally {
    client.release();
  }

  try {
    const startups: StartupTableRow[] = [];

    result.rows.forEach(async (row) => {
      const startup = await getStartupTableRowById(row.startup_id);
      const rating = row.rating;
      startups.push({
        ...startup,
        rating,
      });
    });

    return startups;
  } catch (err) {
    throw new Error(
      `Failed to query startups for fund with id ${fundId} with the following error: ${err}`
    );
  }
};

const insertFundStartupRelation = async (fundId: string, startupId: string) => {
  const client = await pool.connect();
  try {
    await client.query(
      "INSERT INTO fund_startup_map (fund_id, startup_id) VALUES ($1, $2);",
      [fundId, startupId]
    );
  } catch (err) {
    throw new Error(
      `Failed to insert fund startup relationship for startup with id ${startupId} and fund with id ${fundId}. Error: ${err}`
    );
  } finally {
    client.release();
  }
};

const updateFundStartups = async (fundId: string, startups: string[]) => {
  const client = await pool.connect();
  try {
    await client.query("DELETE FROM fund_startup_map WHERE fund_id = $1;", [
      fundId,
    ]);

    for (const startupId of startups) {
      await client.query(
        "INSERT INTO fund_startup_map (fund_id, startup_id) VALUES ($1, $2);",
        [fundId, startupId]
      );
    }
  } catch (err) {
    throw new Error(
      `Failed to update startup fund relationship for fund with id: ${fundId}. Error: ${err}`
    );
  } finally {
    client.release();
  }
};

const updateRatingTotal = async (
  ratingTotal: number,
  startupId: string,
  fundId: string
) => {
  const client = await pool.connect();
  try {
    await client.query(
      "UPDATE fund_startup_map SET rating = $1 WHERE fund_id = $2 AND startup_id = $3;",
      [ratingTotal, fundId, startupId]
    );
  } catch (err) {
    throw new Error(
      `Failed to update rating for startup_id: ${startupId} and fund_id: ${fundId}. Error: ${err}`
    );
  } finally {
    client.release();
  }
};

export {
  getStartupsForFund,
  fundIdExists,
  insertFundStartupRelation,
  updateFundStartups,
  updateRatingTotal,
};
