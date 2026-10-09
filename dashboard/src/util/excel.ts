import { NextFunction, Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import readXlsxFile, { Row } from "read-excel-file/node";
import { Readable } from "stream";

// Cap tables are parsed straight from the request's in-memory buffer. Nothing
// is written to disk, so concurrent uploads by different users cannot
// overwrite or read each other's spreadsheet, and no uploaded file is ever
// reachable through the public static directory.
const MAX_CAP_TABLE_BYTES = 5 * 1024 * 1024;

const FILE_FILTER = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (
    file.mimetype.includes("xlsx") ||
    file.mimetype.includes("vnd.ms-excel") ||
    file.mimetype.includes(
      "vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const multerUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: FILE_FILTER,
  limits: { fileSize: MAX_CAP_TABLE_BYTES, files: 1 },
});

// Accepts the "cap-table" field. Oversized or malformed uploads are dropped
// (req.file stays undefined) so the route reports a normal validation error
// instead of an unhandled multer exception.
const capTableUpload = (req: Request, res: Response, next: NextFunction) => {
  multerUpload.single("cap-table")(req, res, (err?: unknown) => {
    if (err) {
      console.error(`Rejected cap table upload: ${err}`);
      req.file = undefined;
    }
    next();
  });
};

const uploadCapTable = async (file: Express.Multer.File | undefined) => {
  if (file === undefined || file.buffer === undefined) {
    throw new Error("No valid .xlsx cap table was uploaded.");
  }

  return await readXlsxFile(Readable.from([file.buffer]), {
    dateFormat: "mm/dd/yyyy",
  });
};

// Kept for route compatibility; uploads are no longer stored on disk.
const deleteSpreadsheets = () => undefined;

const formatCapTable = (rows: Row[]) => {
  const columns = rows.reduce(
    (previousRow, currentRow) => (
      currentRow.forEach(
        (cell, i) => (previousRow[i] = previousRow[i] || cell)
      ),
      previousRow
    ),
    []
  );

  const capTable: Row[] = rows
    .filter((row) => row.join("") != "")
    .map((row) => row.filter((_, i) => columns[i]))
    .map((row) => {
      return row.map((cell) => {
        if (
          typeof cell == "number" &&
          cell % 1 !== 0 &&
          Math.floor(cell) === 0
        ) {
          return Math.round(cell * 100) + " %";
        } else if (cell instanceof Date) {
          return (
            cell.getDate() +
            ". " +
            new Intl.DateTimeFormat("en-US", { month: "long" }).format(cell) +
            " " +
            cell.getFullYear()
          );
        } else if (cell == 1) {
          return 100 + " %";
        } else {
          return cell;
        }
      });
    });

  return capTable;
};

export {
  capTableUpload,
  multerUpload,
  deleteSpreadsheets,
  uploadCapTable,
  formatCapTable,
};
