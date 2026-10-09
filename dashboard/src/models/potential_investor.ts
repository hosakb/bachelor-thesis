import pool from "../config/db";

interface Investor {
  id: string;
  name: string;
  type: string;
  email: string;
  number: string | undefined;
  url: string | undefined;
  country: string;
  notes: string | undefined;
  contactDate: Date;
  status: string;
}

interface NewInvestor {
  name: string;
  type: string;
  email: string;
  number: string | undefined;
  url: string | undefined;
  country: string;
  notes: string | undefined;
  contactDate: Date;
  startupId: string;
}

interface UpdatedInvestor {
  id: string;
  email: string;
  number: string | undefined;
  url: string | undefined;
  notes: string | undefined;
}

const insertInvestor = async (investor: NewInvestor) => {
  const client = await pool.connect();
  try {
    await client.query(
      "INSERT INTO investors (name, type, email, number, url, country, notes, contact_date, startup_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
      [
        investor.name,
        investor.type,
        investor.email,
        investor.number,
        investor.url,
        investor.country,
        investor.notes,
        investor.contactDate,
        investor.startupId,
      ]
    );
  } catch (err) {
    throw new Error(
      `Failed to persist contacted investor startup with id ${investor.startupId}. Error: ${err}`
    );
  } finally {
    client.release();
  }
};

const getInvestors = async (startupId: string): Promise<Investor[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT id, name, type, email, number, url, country, notes, contact_date, startup_id, status FROM investors WHERE startup_id = $1 ORDER BY contact_date, id;",
      [startupId]
    );

    const investors: Investor[] = result.rows.map((row) => {
      return {
        id: row.id,
        name: row.name,
        type: row.type,
        email: row.email,
        number: row.number,
        url: row.url,
        country: row.country,
        notes: row.notes,
        contactDate: row.contact_date,
        status: row.status,
      };
    });

    return investors;
  } catch (err) {
    throw new Error(
      `Failed to contacted investors for startup with id ${startupId}. Error: ${err}`
    );
  } finally {
    client.release();
  }
};

const updateInvestor = async (updatedInvestor: UpdatedInvestor) => {
  const client = await pool.connect();
  try {
    await client.query(
      "UPDATE investors SET email = $1, number = $2, url = $3, notes = $4  WHERE id = $5;",
      [
        updatedInvestor.email,
        updatedInvestor.notes,
        updatedInvestor.url,
        updatedInvestor.notes,
        updatedInvestor.id,
      ]
    );
  } catch (err) {
    throw new Error(
      `Failed to update contacted investors for with id ${updatedInvestor.id}. Error: ${err}`
    );
  } finally {
    client.release();
  }
};

const updateInvestorStatus = async (status: string, id: string) => {
  const client = await pool.connect();
  try {
    await client.query("UPDATE investors SET status = $1 WHERE id = $2;", [
      status,
      id,
    ]);
  } catch (err) {
    throw new Error(
      `Failed to update contacted investors status with id ${id}. Error: ${err}`
    );
  } finally {
    client.release();
  }
};

export {
  Investor,
  NewInvestor,
  getInvestors,
  insertInvestor,
  updateInvestor,
  updateInvestorStatus,
};
