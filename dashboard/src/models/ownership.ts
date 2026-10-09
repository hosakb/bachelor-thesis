import pool from "../config/db";

// Tables whose rows belong to exactly one startup via a startup_id column.
// The table name is never taken from user input.
type StartupOwnedTable = "trl" | "milestones" | "investors" | "patents";

const isIntegerId = (id: unknown): boolean =>
  /^\d+$/.test(String(id ?? "").trim());

const belongsToStartup = async (
  table: StartupOwnedTable,
  id: unknown,
  startupId: string | undefined
): Promise<boolean> => {
  if (!isIntegerId(id) || !isIntegerId(startupId)) {
    return false;
  }

  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT 1 FROM ${table} WHERE id = $1 AND startup_id = $2;`,
      [String(id).trim(), startupId]
    );
    return result.rows.length > 0;
  } finally {
    client.release();
  }
};

const startupInFundPortfolio = async (
  fundId: string | undefined,
  startupId: unknown
): Promise<boolean> => {
  if (!isIntegerId(fundId) || !isIntegerId(startupId)) {
    return false;
  }

  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT 1 FROM investor_startup_map WHERE fund_id = $1 AND startup_id = $2;",
      [fundId, String(startupId).trim()]
    );
    return result.rows.length > 0;
  } finally {
    client.release();
  }
};

export { StartupOwnedTable, belongsToStartup, startupInFundPortfolio };
