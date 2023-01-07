import pool from "../config/db";

interface BusinessCentralUser {
  company: string;
  username: string;
  startupId: string;
  lmHashedPassword: string;
  ntHashedPassword: string;
}

interface FinancialData {
  balance: number;
  shortTermLiabilities: number;
  startupId: string;
  evaluatedAt: Date;
}

const getBcUsers = async (
  startups: string[]
): Promise<BusinessCentralUser[]> => {
  const client = await pool.connect();
  try {
    const users: BusinessCentralUser[] = [];

    for (const id of startups) {
      const result = await client.query(
        `SELECT company, username, lm_hashed_password, nt_hashed_password FROM business_central WHERE startup_id = $1;`,
        [id]
      );

      if (
        result.rows[0].company != undefined &&
        result.rows[0].username != undefined &&
        result.rows[0].lm_hashed_password != undefined &&
        result.rows[0].nt_hashed_password != undefined
      ) {
        users.push({
          company: result.rows[0].company,
          username: result.rows[0].username,
          startupId: id,
          lmHashedPassword: result.rows[0].lm_hashed_password,
          ntHashedPassword: result.rows[0].nt_hashed_password,
        });
      } else {
        console.error(
          `Failed to query Business Central user for startupId ${id}`
        );
      }
    }

    return users;
  } catch (err) {
    throw new Error(`Failed query Business Central Users. Error: ${err}`);
  } finally {
    client.release();
  }
};

const insertFinancialData = async (
  balance: number,
  shortTermLiabilities: number,
  startupId: string
) => {
  const client = await pool.connect();
  try {
    await client.query(
      "INSERT INTO business_central_finance (balance, short_term_liabilities, startup_id) VALUES ($1, $2, $3);",
      [balance, shortTermLiabilities, startupId]
    );
  } catch (err) {
    throw new Error(
      `Failed to insert financial data for startup with id ${startupId} with the following error: ${err}`
    );
  } finally {
    client.release();
  }
};

const getFinancialData = async (
  startupId: string
): Promise<FinancialData[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT balance, short_term_liabilities, startup_id, evaluated_at FROM business_central_finance WHERE startup_id = $1 ORDER BY evaluated_at DESC LIMIT 30;",
      [startupId]
    );

    const financialData: FinancialData[] = result.rows.map((row) => {
      return {
        balance: row.balance,
        shortTermLiabilities: row.short_term_liabilities,
        startupId: row.startup_id,
        evaluatedAt: row.evaluated_at,
      };
    });

    return financialData;
  } catch (err) {
    throw new Error(
      `Failed to query financial data for startup with id ${startupId} with the following error: ${err}`
    );
  } finally {
    client.release();
  }
};

export {
  BusinessCentralUser,
  FinancialData,
  getBcUsers,
  insertFinancialData,
  getFinancialData,
};
