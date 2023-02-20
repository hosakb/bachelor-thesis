import pool from "../config/db";

interface Milestone {
  id: string;
  index: number;
  name: string;
  start: string;
  end: string;
  progress: number;
}

interface NewMilestone {
  index: number;
  name: string;
  start: string;
  end: string;
  progress: number;
}

interface UnIndexedMilestone {
  name: string;
  start: string;
  end: string;
  progress: number;
}
const persistMilestones = async (
  milestones: NewMilestone[],
  startupId: string
) => {
  const client = await pool.connect();
  try {
    await client.query("DELETE FROM milestones WHERE startup_id = $1;", [
      startupId,
    ]);

    for (const milestone of milestones) {
      await client.query(
        "INSERT INTO milestones (start_date, end_date, progress, startup_id, name, index) VALUES ($1, $2, $3, $4, $5, $6)",
        [
          milestone.start,
          milestone.end,
          milestone.progress,
          startupId,
          milestone.name,
          milestone.index,
        ]
      );
    }
  } catch (err) {
    throw new Error(
      `Failed to insert startup milestones for startup id ${startupId}. Error: ${err}`
    );
  } finally {
    client.release();
  }
};

const persistMilestonesWithId = async (
  milestones: Milestone[],
  startupId: string
) => {
  const client = await pool.connect();
  try {
    await client.query("DELETE FROM milestones WHERE startup_id = $1;", [
      startupId,
    ]);

    for (const milestone of milestones) {
      await client.query(
        "INSERT INTO milestones (id, start_date, end_date, progress, startup_id, name, index) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [
          milestone.id,
          milestone.start,
          milestone.end,
          milestone.progress,
          startupId,
          milestone.name,
          milestone.index,
        ]
      );
    }
  } catch (err) {
    throw new Error(
      `Failed to insert startup milestones for startup id ${startupId}. Error: ${err}`
    );
  } finally {
    client.release();
  }
};

const getMilestones = async (startupId: string): Promise<Milestone[]> => {
  const client = await pool.connect();
  let result;
  try {
    result = await client.query(
      "SELECT id, name, start_date, end_date, progress, index FROM milestones WHERE startup_id = $1",
      [startupId]
    );
  } catch (err) {
    throw new Error(
      `Failed to query milestones for startup id ${startupId}. Error: ${err}`
    );
  } finally {
    client.release();
  }

  const milestones: Milestone[] = result.rows.map((row) => {
    return {
      id: row.id,
      index: row.index,
      name: row.name,
      start: row.start_date,
      end: row.end_date,
      progress: row.progress,
    };
  });

  return milestones;
};

const updateMilestoneProgress = async (taskId: string, progress: number) => {
  const client = await pool.connect();
  try {
    await client.query("UPDATE milestones SET progress = $1 WHERE id = $2", [
      progress,
      taskId,
    ]);
  } catch (err) {
    throw new Error(
      `Failed to update milestones progress with id ${taskId}. Error: ${err}`
    );
  } finally {
    client.release();
  }
};

const updateMilestoneDuration = async (
  taskId: string,
  start: string,
  end: string
) => {
  const client = await pool.connect();
  try {
    await client.query(
      "UPDATE milestones SET start_date = $1, end_date = $2 WHERE id = $3",
      [start, end, taskId]
    );
  } catch (err) {
    throw new Error(
      `Failed to update milestone with id ${taskId}. Error: ${err}`
    );
  } finally {
    client.release();
  }
};

export {
  Milestone,
  NewMilestone,
  UnIndexedMilestone,
  getMilestones,
  persistMilestones,
  persistMilestonesWithId,
  updateMilestoneDuration,
  updateMilestoneProgress,
};
