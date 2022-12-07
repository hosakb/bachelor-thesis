import pool from "../config/db";

interface Founder {
    firstName: string;
    lastName: string;
    age: number;
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
    lastValuation: number;
    inBusiness: boolean;
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

  const getFoundersByStartupId = async (startupId: string): Promise<Founder[]> => {
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT users.first_name, users.last_name, track_record.expertise, track_record.ventures FROM users JOIN track_record on users.track_record = track_record.id WHERE users.startup=$1", 
      [startupId]);

      const founders: Founder[] = result.rows.map((founder) => {
        const ventures: PreviousVenture[] = founder.ventures;
        const startupFounder: Founder = {
            firstName: founder.first_name,
            lastName: founder.last_name,
            age: 1,
            trackRecord: {
              expertise: founder.expertise,
              ventures: ventures,
           },
        }
        console.log(startupFounder.lastName)
        return startupFounder
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

export {
  Founder,
  PreviousVenture,
  insertTrackRecord,
  getFoundersByStartupId,
};