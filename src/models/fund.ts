import pool from "../config/db";

interface Weights {
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

interface Fund {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const getFunds = async (): Promise<Fund[]> => {
  const client = await pool.connect();

  try {
    const result = await client.query(
      "SELECT id, name, created_at, updated_at FROM fund",
      []
    );

    return result.rows.map((fund) => {
      return {
        id: fund.id,
        name: fund.name,
        createdAt: fund.created_at,
        updatedAt: fund.updated_at,
      };
    });
  } catch (err) {
    throw new Error(`Failed to query funds due to the following error: ${err}`);
  } finally {
    client.release();
  }
};

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

const updateWeights = async (fundId: string, weights: Weights) => {
  const client = await pool.connect();
  try {
    await client.query("UPDATE fund SET weights = $1 WHERE id = $2;", [
      JSON.stringify(weights),
      fundId,
    ]);
  } catch (err) {
    throw new Error(
      `Failed to update weighting for fund with id ${fundId} with the following error: ${err}`
    );
  } finally {
    client.release();
  }
};

const getWeights = async (fundId: string): Promise<Weights> => {
  const client = await pool.connect();
  let result;
  try {
    result = await client.query("SELECT weights FROM fund WHERE id = $1;", [
      fundId,
    ]);
  } catch (err) {
    throw new Error(
      `Failed to query weighting for fund with id ${fundId} with the following error: ${err}`
    );
  } finally {
    client.release();
  }
  return result.rows[0].weights;
};

export { Weights, getFunds, updateWeights, getWeights, getFundNameById };
