import pool from "../config/db";
interface Metrics {
  date: Date;
  burnRate: number;
  cashRunway: number;
  liquidity: number;
}
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

export { Metrics, getMetrics };
