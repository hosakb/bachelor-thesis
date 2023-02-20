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

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
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

interface NewUser {
  firstName: string;
  lastName: string;
  email: string;
  hashedPassword: string;
  role: string;
  startup?: string;
  fund?: string;
}

interface UpdatedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  hashedPassword: string;
}

enum Role {
  Admin = "admin",
  Startup = "startup",
  Fund = "fund",
  Stakeholder = "stakeholder",
}

interface Founder {
  id: string;
  firstName: string;
  lastName: string;
}

const getUsers = async (): Promise<AdminUser[]> => {
  const client = await pool.connect();

  try {
    const result = await client.query(
      "SELECT id, first_name, last_name, email, role, created_at, updated_at, startup, fund FROM users",
      []
    );

    const users: AdminUser[] = [];

    for (const user of result.rows) {
      if (user.startup !== null) {
        try {
          const result = await client.query(
            "SELECT name FROM startup WHERE id = $1;",
            [user.startup]
          );
          const startup = result.rows[0].name;
          users.push({
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            role: user.role,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
            startup,
            fund: user.fund,
          });
        } catch (error) {
          throw new Error(
            `Failed to query startup name for startup id user.startup. Error: ${error}`
          );
        }
      } else if (user.fund !== null) {
        try {
          const result = await client.query(
            "SELECT name FROM investor WHERE id = $1;",
            [user.fund]
          );
          const fund = result.rows[0].name;
          users.push({
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            role: user.role,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
            startup: user.startup,
            fund,
          });
        } catch (error) {
          throw new Error(
            `Failed to query startup name for startup id user.startup. Error: ${error}`
          );
        }
      } else {
        users.push({
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          role: user.role,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
          startup: user.startup,
          fund: user.fund,
        });
      }
    }

    return users;
  } catch (err) {
    throw new Error(`Failed query the users. Error: ${err}`);
  } finally {
    client.release();
  }
};

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
    } else if (role === Role.Stakeholder) {
      return {
        id: result.rows[0].fund,
        role: Role.Stakeholder,
      };
    } else if (role === Role.Admin) {
      return {
        id: result.rows[0].id,
        role: Role.Admin,
      };
    } else {
      throw new Error(`Unknown role found for user with email: ${email}.`);
    }
  } catch (err) {
    throw new Error(
      `Failed query the users role after login for user with email: ${email}. Error:  ${err}`
    );
  } finally {
    client.release();
  }
};

const getFirstUserLoginByEmail = async (email: string): Promise<boolean> => {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT track_record FROM users
      WHERE email = $1`,
      [email]
    );

    if (result.rowCount === 0) {
      throw new Error("No user found for email: " + email);
    }

    if (result.rows[0].track_record == null) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    throw new Error(
      `  "Failed query for first login for user with email: ${email}. Error:  ${err}`
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

const insertUser = async (user: NewUser) => {
  const client = await pool.connect();

  try {
    if (user.fund !== null) {
      await client.query(
        `INSERT INTO users (first_name, last_name, email, password, role, fund) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          user.firstName,
          user.lastName,
          user.email,
          user.hashedPassword,
          user.role,
          user.fund,
        ]
      );
    } else {
      await client.query(
        `INSERT INTO users (first_name, last_name, email, password, role, startup) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          user.firstName,
          user.lastName,
          user.email,
          user.hashedPassword,
          user.role,
          user.startup,
        ]
      );
    }
  } catch (err) {
    throw new Error("Failed to create new user due to: " + err);
  } finally {
    client.release();
  }
};

const updateUser = async (updatedUser: UpdatedUser) => {
  const client = await pool.connect();

  try {
    await client.query(
      `UPDATE users SET first_name = $1, last_name = $2, email = $3, password = $4, updated_at = NOW() WHERE id = $5`,
      [
        updatedUser.firstName,
        updatedUser.lastName,
        updatedUser.email,
        updatedUser.hashedPassword,
        updatedUser.id,
      ]
    );
  } catch (err) {
    throw new Error(`Failed to update user with id: ${updatedUser.id}` + err);
  } finally {
    client.release();
  }
};

const deleteUser = async (id: string) => {
  const client = await pool.connect();

  try {
    await client.query(`DELETE FROM users WHERE id = $1`, [id]);
  } catch (err) {
    throw new Error(`Failed to delete user with id: ${id}` + err);
  } finally {
    client.release();
  }
};

const getFounders = async (): Promise<Founder[]> => {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT id, first_name, last_name from users WHERE startup IS NOT NULL;`,
      []
    );

    return result.rows.map((founder) => {
      return {
        id: founder.id,
        firstName: founder.first_name,
        lastName: founder.last_name,
      };
    });
  } catch (err) {
    throw new Error(`Failed to query founders. Error:` + err);
  } finally {
    client.release();
  }
};

export {
  LoginUser,
  User,
  Role,
  UserRole,
  NewUser,
  UpdatedUser,
  getUsers,
  getUserRole,
  getLoginUserByEmail,
  getLoginUserById,
  emailRegistered,
  insertUser,
  getFirstUserLoginByEmail,
  updateUser,
  deleteUser,
  getFounders,
};
