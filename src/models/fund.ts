import pool from "../config/db";

const getFundNameById = async (fundId: string) => {
  const client = await pool.connect();

  try {
    const result = await client.query("SELECT name FROM fund WHERE id = $1", [
      fundId,
    ]);

    if (result.rowCount === 0) {
      throw new Error(`No fund found found for id ${fundId}.`);
    }

    return result.rows[0].name;
  } catch (err) {
    throw new Error(
      `Failed to query fund name for id ${fundId} due to the following error: ${err}`
    );
  } finally {
    client.release();
  }
};

export { getFundNameById };
