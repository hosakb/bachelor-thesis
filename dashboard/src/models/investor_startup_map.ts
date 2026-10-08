import pool from "../config/db";

import { StartupTableRow, getStartupTableRowById } from "./startup";

const getStartupsForInvestor = async (
  fundId: string
): Promise<StartupTableRow[]> => {
  const client = await pool.connect();
  let result;
  try {
    result = await client.query(
      `SELECT startup_id, rating FROM investor_startup_map WHERE fund_id=$1`,
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

    for (const row of result.rows) {
      const startup = await getStartupTableRowById(row.startup_id);
      const rating = row.rating;
      startups.push({
        ...startup,
        rating,
      });
    }

    return startups;
  } catch (err) {
    throw new Error(
      `Failed to query startups for fund with id ${fundId} with the following error: ${err}`
    );
  }
};

const getStartupIdsForInvestor = async (fundId: string): Promise<string[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT startup_id FROM investor_startup_map WHERE fund_id=$1`,
      [fundId]
    );

    return result.rows.map((row) => {
      return row.startup_id;
    });
  } catch (err) {
    throw new Error(
      `Failed to query startup ids fund with id ${fundId}. Error: ${err}`
    );
  } finally {
    client.release();
  }
};

const insertInvestorStartupRelation = async (
  fundId: string,
  startupId: string
) => {
  const client = await pool.connect();
  try {
    await client.query(
      "INSERT INTO investor_startup_map (fund_id, startup_id) VALUES ($1, $2);",
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

const updateInvestorStartups = async (fundId: string, startups: string[]) => {
  const client = await pool.connect();
  try {
    await client.query("DELETE FROM investor_startup_map WHERE fund_id = $1;", [
      fundId,
    ]);

    for (const startupId of startups) {
      await client.query(
        "INSERT INTO investor_startup_map (fund_id, startup_id) VALUES ($1, $2);",
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
      "UPDATE investor_startup_map SET rating = $1 WHERE fund_id = $2 AND startup_id = $3;",
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
  getStartupsForInvestor,
  insertInvestorStartupRelation,
  updateInvestorStartups,
  updateRatingTotal,
  getStartupIdsForInvestor,
};
