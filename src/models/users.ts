import pool from "../config/db";

interface User {
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

const getUserRole = async (email: string): Promise<UserRole> => {
  let client = await pool.connect();

  try {
    let result = await client.query(
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

const getUserByEmail = async (email: string) => {
  let client = await pool.connect();

  try {
    let result = await client.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);

    if (result.rowCount === 0) {
      throw new Error("No user found for email: " + email);
    }

    const user: User = result.rows[0];

    return user;
  } catch (err) {
    throw new Error(`Failed query user with email: ${email}. Error:  ${err}`);
  } finally {
    client.release();
  }
};

const getUserById = async (id: string) => {
  let client = await pool.connect();

  try {
    let result = await client.query(`SELECT * FROM users WHERE id = $1`, [id]);

    if (result.rowCount === 0) {
      throw new Error("No user found for id: " + id);
    }

    const user: User = result.rows[0];

    return user;
  } catch (err) {
    throw new Error(`Failed query user with id: ${id}. Error:  ${err}`);
  } finally {
    client.release();
  }
};

const emailRegistered = async (email: string) => {
  let client = await pool.connect();

  try {
    let result = await client.query(`SELECT * FROM users WHERE email = $1`, [
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
  let client = await pool.connect();

  try {
    let result = await client.query(
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

export {
  User,
  Role,
  UserRole,
  getUserRole,
  getUserByEmail,
  getUserById,
  emailRegistered,
  insertUser,
};
