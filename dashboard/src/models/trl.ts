import pool from "../config/db";
import { calcTrlProd } from "../util/calc/trl";

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

export {
  TrlData,
  deleteTrl,
  getTrl,
  getTrlAvailable,
  persistTrlData,
  updateTrl,
};
