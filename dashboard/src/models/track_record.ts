import pool from "../config/db";

interface Founder {
  firstName: string;
  lastName: string;
  trackRecord: TrackRecord;
}

interface TrackRecord {
  expertise: number;
  ventures: PreviousVenture[];
}

interface PreviousVenture {
  name: string;
  foundingDate: string;
  coFounders: number;
  inBusiness: boolean;
  lastValuation: number;
  reasonForFailure: string;
}

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

    await client.query(`UPDATE users SET track_record = $1 WHERE id = $2`, [
      id,
      userId,
    ]);
  } catch (err) {
    throw new Error(
      `Failed to add track record user with id ${userId}. Error: ${err}`
    );
  } finally {
    client.release();
  }
};

const getFoundersByStartupId = async (
  startupId: string
): Promise<Founder[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT users.first_name, users.last_name, track_record.expertise, track_record.ventures FROM users JOIN track_record on users.track_record = track_record.id WHERE users.startup=$1",
      [startupId]
    );

    const founders: Founder[] = result.rows.map((founder) => {
      const ventures: PreviousVenture[] = founder.ventures;
      const startupFounder: Founder = {
        firstName: founder.first_name,
        lastName: founder.last_name,
        trackRecord: {
          expertise: founder.expertise,
          ventures: ventures,
        },
      };
      return startupFounder;
    });

    return founders;
  } catch (err) {
    throw new Error(
      `Failed to query founders for startup id ${startupId} due to: ${err}`
    );
  } finally {
    client.release();
  }
};

const getExpertiseByStartup = async (startupId: string): Promise<string[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT track_record.expertise FROM users JOIN track_record on users.track_record = track_record.id WHERE users.startup=$1",
      [startupId]
    );

    return result.rows.map((row) => {
      return String(row.expertise);
    });
  } catch (err) {
    throw new Error(
      `Failed to query expertise of owners for startup id ${startupId} due to: ${err}`
    );
  } finally {
    client.release();
  }
};

export {
  Founder,
  PreviousVenture,
  insertTrackRecord,
  getFoundersByStartupId,
  getExpertiseByStartup,
};
