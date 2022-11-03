import pool from "../config/db";

import { Startup, getStartup } from "./startup";

const fundIdExists = async (fundId: string) => {
  let client = await pool.connect();

  try {
    let result = await client.query("SELECT * FROM fund WHERE id=$1", [fundId]);

    if (result.rowCount > 1) {
      console.log(
        `Multiple funds received for fund id: ${fundId}. Expected one.`
      );
      return false;
    } else if (result.rowCount === 0) {
      console.log(`Fund with fund id ${fundId} does not exists.`);
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

const getStartupsForFund = async (fundId: string): Promise<Startup[]> => {
  let client = await pool.connect();
  try {
    let result = await client.query(
      `SELECT startup_id FROM fund_startup_map WHERE fund_id=$1`,
      [fundId]
    );

    let startups = [];

    for (const startup of result.rows) {
      startups.push(await getStartup(startup.startup_id));
    }

    return startups;
  } catch (err) {
    throw new Error(
      `Failed to query startups for fund with id ${fundId} with the following error: ${err}`
    );
  } finally {
    client.release();
  }
};

export { getStartupsForFund, fundIdExists };
