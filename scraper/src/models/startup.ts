import pool from "../config/db";

export interface Metrics {
    date: Date;
    burnRate: number;
    cashRunway: number;
    liquidity: number;
}

export const getStartupIds = async (): Promise<string[]> => {
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

export const persistMetrics = async (metrics: Metrics, startupId: string) => {
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