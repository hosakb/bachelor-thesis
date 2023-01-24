import { Request } from "express";
import multer, { FileFilterCallback, StorageEngine } from "multer";
import readXlsxFile, { Row } from "read-excel-file/node";
import fs from "fs";
import path from "path";
import { getTodaysDate } from "./date";
const FILENAME_CAP_TABLE =
  "cap-table-" + getTodaysDate() + Math.round(Math.random() * 1e9) + ".xlsx";

const UPLOAD_PATH = path.join(__dirname, "..", "..", "public", "uploads");

const multerStorage: StorageEngine = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req: Request, file, cb) {
    cb(null, FILENAME_CAP_TABLE);
  },
});

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
  storage: multerStorage,
  fileFilter: FILE_FILTER,
});

const uploadCapTable = async () => {
  const filePath = path.join(UPLOAD_PATH, FILENAME_CAP_TABLE);

  return await readXlsxFile(fs.createReadStream(filePath), {
    dateFormat: "mm/dd/yyyy",
  });
};

const deleteSpreadsheets = () => {
  fs.readdir(UPLOAD_PATH, (err, files) => {
    if (err)
      throw new Error(
        `Failed to read spreadsheet directory at ${UPLOAD_PATH} after submission of kpis with the following error ${err}`
      );

    for (const file of files) {
      fs.unlink(path.join(UPLOAD_PATH, file), (err) => {
        if (err)
          throw new Error(
            `Failed to delete spreadsheet ${file} in directory ${UPLOAD_PATH} with the following error ${err}`
          );
      });
    }
  });
};

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

export { multerUpload, deleteSpreadsheets, uploadCapTable, formatCapTable };
