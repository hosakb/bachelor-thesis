import pool from "../config/db";
import { getToday } from "../util/date";

interface NewPatent {
  invention: string;
  newInventor: string;
  patentStatus: string;
  patentConfirmationDate: Date | undefined;
  patentExaminationNoticeDate: Date | undefined;
  patentGrantDate: Date | undefined;
  patentOffice: string;
  patentDuration: number | undefined;
}

interface Patent {
  id: string;
  invention: string;
  inventor: string;
  status: string;
  confirmationDate: Date | null;
  patentOffice: string;
  updatedAt: Date;
  registrationFee: boolean;
  inventorNomination: boolean;
  annualFeeDate: Date | null;
  patentExaminationRequest: boolean;
  patentExaminationNoticeDate: Date | null;
  patentExaminationNotice: boolean;
  grantDate: Date | null;
  grantFee: boolean;
  objection: boolean;
  rejectionReason: string | null;
  patentDuration: number | undefined;
  examinationRequest: boolean;
  objectionResponse: boolean;
  rejectionDate: Date | null;
}

interface UpdatedPatentDisclosure {
  id: string;
  registrationFee: boolean;
  annualFeeDate: Date;
  inventorNomination: boolean;
  examinationRequest: boolean;
}

function isUpdatedPatentDisclosure(
  value:
    | UpdatedPatentDisclosure
    | UpdatedPatentExamination
    | UpdatedPatentObjection
): value is UpdatedPatentDisclosure {
  return (
    // eslint-disable-next-line no-prototype-builtins
    value.hasOwnProperty("registrationFee") &&
    // eslint-disable-next-line no-prototype-builtins
    value.hasOwnProperty("annualFeeDate") &&
    // eslint-disable-next-line no-prototype-builtins
    value.hasOwnProperty("inventorNomination") &&
    // eslint-disable-next-line no-prototype-builtins
    value.hasOwnProperty("examinationRequest")
  );
}

interface UpdatedPatentExamination {
  id: string;
  patentExaminationNotice: boolean;
}

function isUpdatedPatentExamination(
  value:
    | UpdatedPatentDisclosure
    | UpdatedPatentExamination
    | UpdatedPatentObjection
): value is UpdatedPatentExamination {
  // eslint-disable-next-line no-prototype-builtins
  return value.hasOwnProperty("patentExaminationNotice");
}

interface UpdatedPatentObjection {
  id: string;
  grantFee: boolean;
  objection: boolean;
  objectionResponse: boolean;
}

const insertNewPatent = async (patent: NewPatent, startupId: string) => {
  const client = await pool.connect();
  try {
    if (
      patent.patentConfirmationDate === undefined &&
      patent.patentExaminationNoticeDate === undefined &&
      patent.patentGrantDate === undefined
    ) {
      await client.query(
        "INSERT INTO patents (invention, inventor, status, patent_office, startup_id) VALUES ($1, $2, $3, $4, $5)",
        [
          patent.invention,
          patent.newInventor,
          patent.patentStatus,
          patent.patentOffice,
          startupId,
        ]
      );
    } else if (
      patent.patentConfirmationDate !== undefined &&
      patent.patentExaminationNoticeDate === undefined &&
      patent.patentGrantDate === undefined
    ) {
      const annualFeeDate = new Date(patent.patentConfirmationDate);
      annualFeeDate.setFullYear(annualFeeDate.getFullYear() + 1);

      await client.query(
        "INSERT INTO patents (invention, inventor, status, patent_office, application_confirmation_date, annual_fee_date, startup_id) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [
          patent.invention,
          patent.newInventor,
          patent.patentStatus,
          patent.patentOffice,
          patent.patentConfirmationDate,
          annualFeeDate,
          startupId,
        ]
      );
    } else if (
      patent.patentConfirmationDate === undefined &&
      patent.patentExaminationNoticeDate !== undefined &&
      patent.patentGrantDate === undefined
    ) {
      await client.query(
        "INSERT INTO patents (invention, inventor, status, patent_office, patent_examination_notice_date, startup_id) VALUES ($1, $2, $3, $4, $5, $6)",
        [
          patent.invention,
          patent.newInventor,
          patent.patentStatus,
          patent.patentOffice,
          patent.patentExaminationNoticeDate,
          startupId,
        ]
      );
    } else if (
      patent.patentConfirmationDate === undefined &&
      patent.patentExaminationNoticeDate === undefined &&
      patent.patentGrantDate !== undefined
    ) {
      await client.query(
        "INSERT INTO patents (invention, inventor, status, patent_office, grant_date, patent_duration, startup_id) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [
          patent.invention,
          patent.newInventor,
          patent.patentStatus,
          patent.patentOffice,
          patent.patentGrantDate,
          patent.patentDuration,
          startupId,
        ]
      );
    } else {
      throw new Error("Unknown Patent Status");
    }
  } catch (err) {
    throw new Error(
      `Failed to insert new patent for startup with id: ${startupId}. Error: ${err}`
    );
  } finally {
    client.release();
  }
};

const getAllPatents = async (startupId: string): Promise<Patent[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT * FROM patents WHERE startup_id = $1 ORDER BY id;",
      [startupId]
    );

    return result.rows.map((row) => {
      return {
        id: row.id,
        invention: row.invention,
        inventor: row.inventor,
        status: row.status,
        confirmationDate:
          row.application_confirmation_date !== null
            ? new Date(row.application_confirmation_date)
            : null,
        patentOffice: row.patent_office,
        updatedAt: row.updated_at,
        registrationFee: row.registration_fee,
        inventorNomination: row.inventor_nomination,
        annualFeeDate:
          row.annual_fee_date !== null ? new Date(row.annual_fee_date) : null,
        patentExaminationRequest: row.patent_examination_request,
        patentExaminationNoticeDate:
          row.patent_examination_notice_date !== null
            ? new Date(row.patent_examination_notice_date)
            : null,
        patentExaminationNotice: row.patent_examination_notice,
        grantDate: row.grant_date !== null ? new Date(row.grant_date) : null,
        grantFee: row.grant_fee,
        objection: row.objection,
        rejectionReason: row.rejection_reason,
        patentDuration: row.patent_duration,
        examinationRequest: row.examination_request,
        objectionResponse: row.objection_response,
        rejectionDate: row.rejection_date,
      };
    });
  } catch (err) {
    throw new Error(
      `Failed query patents for startup with id: ${startupId}. Error: ${err}`
    );
  } finally {
    client.release();
  }
};

const updatePatent = async (
  patentUpdate:
    | UpdatedPatentDisclosure
    | UpdatedPatentExamination
    | UpdatedPatentObjection
) => {
  const client = await pool.connect();
  try {
    if (isUpdatedPatentDisclosure(patentUpdate)) {
      await client.query(
        "UPDATE patents SET registration_fee = $1, annual_fee_date = $2, inventor_nomination = $3, examination_request = $4, updated_at = $5 WHERE id = $6;",
        [
          patentUpdate.registrationFee,
          patentUpdate.annualFeeDate,
          patentUpdate.inventorNomination,
          patentUpdate.examinationRequest,
          getToday(),
          patentUpdate.id,
        ]
      );
    } else if (isUpdatedPatentExamination(patentUpdate)) {
      await client.query(
        "UPDATE patents SET patent_examination_notice = $1, updated_at = $2 WHERE id = $3;",
        [patentUpdate.patentExaminationNotice, getToday(), patentUpdate.id]
      );
    } else {
      await client.query(
        "UPDATE patents SET grant_fee = $1, objection = $2, objection_response = $3, updated_at = $4 WHERE id = $5;",
        [
          patentUpdate.grantFee,
          patentUpdate.objection,
          patentUpdate.objectionResponse,
          getToday(),
          patentUpdate.id,
        ]
      );
    }
  } catch (err) {
    throw new Error(
      `Failed to update patent with id ${patentUpdate.id} due to: ${err}`
    );
  } finally {
    client.release();
  }
};

const updatePatentPhaseStatus = async (
  id: string,
  currentStatus: string,
  date: Date,
  grantDuration: number
) => {
  const client = await pool.connect();

  try {
    if (currentStatus === "disclosure-phase") {
      await client.query(
        "UPDATE patents SET status = $1, patent_examination_notice_date = $2, updated_at = $3 WHERE id = $4;",
        ["examination-phase", date, getToday(), id]
      );
    } else if (currentStatus === "examination-phase") {
      if (grantDuration === undefined) {
        throw new Error("Grant duration is undefined.");
      }
      if (date === undefined) {
        throw new Error("Grant date is undefined.");
      }
      await client.query(
        "UPDATE patents SET status = $1, patent_duration = $2, grant_date = $3, updated_at = $4 WHERE id = $5;",
        ["objection-phase", grantDuration, date, getToday(), id]
      );
    } else if (currentStatus === "objection-phase") {
      await client.query(
        "UPDATE patents SET status = $1, updated_at = $2 WHERE id = $3;",
        ["granted", getToday(), id]
      );
    } else {
      throw new Error("Failed to identify phase.");
    }
  } catch (err) {
    throw new Error(
      `Failed to update patent phase status with patent id ${id} due to: ${err}`
    );
  } finally {
    client.release();
  }
};

const persistPatentConfirmationDate = async (id: string, date: Date) => {
  const client = await pool.connect();
  try {
    const newAnnualFeeDate = new Date(date);
    newAnnualFeeDate.setFullYear(date.getFullYear() + 1);

    await client.query(
      "UPDATE patents SET application_confirmation_date = $1, status = 'disclosure-phase', updated_at = $2, annual_fee_date = $3 WHERE id = $4;",
      [date, getToday(), newAnnualFeeDate, id]
    );
  } catch (err) {
    throw new Error(
      `Failed to update patent application confirmation date with id ${id} due to: ${err}`
    );
  } finally {
    client.release();
  }
};

const updateCancelPatent = async (
  id: string,
  reason: string,
  status: string,
  date: Date
) => {
  const client = await pool.connect();
  try {
    await client.query(
      "UPDATE patents SET rejection_reason = $1, status = $2, rejection_date = $3, updated_at = $4 WHERE id = $5;",
      [reason, status, date, getToday(), id]
    );
  } catch (err) {
    throw new Error(
      `Failed to set patent as canceled with patent id ${id} due to: ${err}`
    );
  } finally {
    client.release();
  }
};

const getPatentAnnualFeeDateById = async (id: string): Promise<Date> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT annual_fee_date FROM patents WHERE id = $1;",
      [id]
    );

    return new Date(result.rows[0].annual_fee_date);
  } catch (err) {
    throw new Error(
      `Failed query annual fee date for patent with id: ${id}. ${err}`
    );
  } finally {
    client.release();
  }
};

export {
  NewPatent,
  UpdatedPatentDisclosure,
  UpdatedPatentExamination,
  UpdatedPatentObjection,
  getAllPatents,
  getPatentAnnualFeeDateById,
  insertNewPatent,
  persistPatentConfirmationDate,
  updatePatent,
  updatePatentPhaseStatus,
  updateCancelPatent,
};
