import pool from "../config/db";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
  startup?: string;
  fund?: string;
}

interface LoginUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  created_at: string;
  updated_at: string;
  startup?: string;
  fund?: string;
}
interface UserRole {
  id: string;
  role: Role;
}

enum Role {
  Admin = "Admin",
  Startup = "Startup",
  Fund = "Fund",
}

interface PreviousVenture {
  ventureName: string;
  foundingDate: string;
  coFounders: number;
  lastValuation: number;
  inBusiness: boolean;
}

interface TrackRecord {
  expertise: number;
  ventures: PreviousVenture[];
}

const getUserRole = async (email: string): Promise<UserRole> => {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT id, role, fund, startup FROM users
      WHERE email = $1`,
      [email]
    );

    if (result.rowCount > 1) {
      throw new Error("To many users with email: " + email);
    }

    if (result.rowCount === 0) {
      throw new Error("No user found for email: " + email);
    }

    const role: Role = result.rows[0].role as Role;

    if (role === Role.Startup) {
      return {
        id: result.rows[0].startup,
        role: Role.Startup,
      };
    } else if (role === Role.Fund) {
      return {
        id: result.rows[0].fund,
        role: Role.Fund,
      };
    } else {
      return {
        id: result.rows[0].id,
        role: Role.Admin,
      };
    }
  } catch (err) {
    throw new Error(
      `  "Failed query the users role after login for user with email: ${email}. Error:  ${err}`
    );
  } finally {
    client.release();
  }
};

const getFirstLoginByEmail = async (email: string): Promise<boolean> => {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT first_login FROM users
      WHERE email = $1`,
      [email]
    );

    if (result.rowCount === 0) {
      throw new Error("No user found for email: " + email);
    }

    return result.rows[0].id;
  } catch (err) {
    throw new Error(
      `  "Failed query the users role after login for user with email: ${email}. Error:  ${err}`
    );
  } finally {
    client.release();
  }
};

const getLoginUserByEmail = async (email: string) => {
  const client = await pool.connect();

  try {
    const result = await client.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);

    if (result.rowCount === 0) {
      throw new Error("No user found for email: " + email);
    }

    const user: LoginUser = result.rows[0];

    return user;
  } catch (err) {
    throw new Error(`Failed query user with email: ${email}. Error:  ${err}`);
  } finally {
    client.release();
  }
};

const getLoginUserById = async (id: string) => {
  const client = await pool.connect();

  try {
    const result = await client.query(`SELECT * FROM users WHERE id = $1`, [
      id,
    ]);

    if (result.rowCount === 0) {
      throw new Error("No user found for id: " + id);
    }

    const user: LoginUser = {
      id: result.rows[0].id,
      firstName: result.rows[0].first_name,
      lastName: result.rows[0].last_name,
      email: result.rows[0].email,
      password: result.rows[0].password,
      role: result.rows[0].role,
      created_at: result.rows[0].created_at,
      updated_at: result.rows[0].updated_at,
      startup: result.rows[0].startup,
      fund: result.rows[0].fund,
    };

    return user;
  } catch (err) {
    throw new Error(`Failed query user with id: ${id}. Error:  ${err}`);
  } finally {
    client.release();
  }
};

const emailRegistered = async (email: string) => {
  const client = await pool.connect();

  try {
    const result = await client.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);

    if (result.rowCount === 0) {
      return false;
    }

    return true;
  } catch (err) {
    throw new Error(
      `Failed to check if ${email} is associated to a user. Error: ${err}`
    );
  } finally {
    client.release();
  }
};

const insertUser = async (
  firstName: string,
  lastName: string,
  email: string,
  hashedPassword: string
) => {
  const client = await pool.connect();

  try {
    await client.query(
      `INSERT INTO users (first_name, last_name, email, password, role) VALUES ($1, $2, $3, $4, $5)`,
      [firstName, lastName, email, hashedPassword, ""]
    );
  } catch (err) {
    throw new Error(
      "Failed to create new user due to the following error: " + err
    );
  } finally {
    client.release();
  }
};

const insertTrackRecord = async (
  userId: string,
  expertise: string,
  ventures: PreviousVenture[]
) => {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `INSERT INTO track_record (expertise, ventures) VALUES ($1, $2) RETURNING id`,
      [expertise, JSON.stringify(ventures)]
    );

    const id = result.rows[0].id;

    await client.query(
      `UPDATE users SET track_record = $1, first_login = $2 WHERE id = $3`,
      [id, false, userId]
    );

  } catch (err) {
    throw new Error(
      `Failed to add track record user with id ${userId}. Error: ${err}`
    );
  } finally {
    client.release();
  }
};

export {
  LoginUser,
  User,
  Role,
  UserRole,
  PreviousVenture,
  getUserRole,
  getLoginUserByEmail,
  getLoginUserById,
  emailRegistered,
  insertUser,
  insertTrackRecord,
  getFirstLoginByEmail,
};
