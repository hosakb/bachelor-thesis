import pool from "../config/db";

interface AdminBusinessCentralUser {
  company: string;
  username: string;
  startupId: string;
  lmHashedPassword: string;
  ntHashedPassword: string;
}
interface UpdateBusinessCentralUser {
  company: string;
  username: string;
}

const insertBusinessCentralUser = async (user: AdminBusinessCentralUser) => {
  const client = await pool.connect();
  try {
    await client.query(
      "INSERT INTO business_central (company, username, startup_id, lm_hashed_password, nt_hashed_password) VALUES ($1, $2, $3, $4, $5);",
      [
        user.company,
        user.username,
        user.startupId,
        user.lmHashedPassword,
        user.ntHashedPassword,
      ]
    );
  } catch (err) {
    throw new Error(
      `Failed to insert bc user for startup with id ${user.startupId} Error: ${err}`
    );
  } finally {
    client.release();
  }
};

const updateBusinessCentralUser = async (user: AdminBusinessCentralUser) => {
  const client = await pool.connect();
  try {
    await client.query(
      "UPDATE business_central SET company = $1, username = $2, lm_hashed_password = $3, nt_hashed_password = $4 WHERE startup_id = $5",
      [
        user.company,
        user.username,
        user.lmHashedPassword,
        user.ntHashedPassword,
        user.startupId,
      ]
    );
  } catch (err) {
    throw new Error(
      `Failed to update bc user for startup id ${user.startupId} Error: ${err}`
    );
  } finally {
    client.release();
  }
};
const deleteBusinessCentralUser = async (id: string) => {
  const client = await pool.connect();
  try {
    await client.query("DELETE FROM business_central WHERE id = $1;", [id]);
  } catch (err) {
    throw new Error(
      `Failed to delete business central user with id ${id}. Error: ${err}`
    );
  } finally {
    client.release();
  }
};

const getBusinessCentralUserByStartupId = async (
  startupId: string
): Promise<UpdateBusinessCentralUser> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT company, username FROM business_central WHERE startup_id = $1;",
      [startupId]
    );

    if (
      result.rows[0].company == undefined ||
      result.rows[0].username == undefined
    ) {
      throw new Error("No data found.");
    }

    return {
      company: result.rows[0].company,
      username: result.rows[0].username,
    };
  } catch (err) {
    throw new Error(
      `Failed to query business central user for startup id ${startupId}. Error: ${err}`
    );
  } finally {
    client.release();
  }
};

export {
  AdminBusinessCentralUser,
  UpdateBusinessCentralUser,
  insertBusinessCentralUser,
  updateBusinessCentralUser,
  deleteBusinessCentralUser,
  getBusinessCentralUserByStartupId,
};
