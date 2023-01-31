"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCapTable =
  exports.uploadCapTable =
  exports.deleteSpreadsheets =
  exports.uploadKpis =
  exports.multerUpload =
    void 0;
const multer_1 = __importDefault(require("multer"));
const node_1 = __importDefault(require("read-excel-file/node"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const date_1 = __importDefault(require("./date"));
const FILENAME_KPIS =
  "kpis-" + (0, date_1.default)() + Math.round(Math.random() * 1e9) + ".xlsx";
const FILENAME_CAP_TABLE =
  "cap-table-" +
  (0, date_1.default)() +
  Math.round(Math.random() * 1e9) +
  ".xlsx";
const UPLOAD_PATH = path_1.default.join(__dirname, "..", "public", "uploads");
const multerStorage = multer_1.default.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/public/uploads");
  },
  filename: function (req, file, cb) {
    if (req.url == "/") {
      cb(null, FILENAME_KPIS);
    } else {
      cb(null, FILENAME_CAP_TABLE);
    }
  },
});
const FILE_FILTER = (req, file, cb) => {
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
const multerUpload = (0, multer_1.default)({
  storage: multerStorage,
  fileFilter: FILE_FILTER,
});
exports.multerUpload = multerUpload;
const KPI_SCHEMA = {
  Date: {
    prop: "date",
    type: Date,
  },
  "Number of Employees": {
    prop: "numberOfEmployees",
    type: Number,
  },
  "Cash Flow Rate": {
    prop: "cashFlowRate",
    type: Number,
  },
  Liquidity: {
    prop: "liquidity",
    type: Number,
  },
};
const uploadKpis = () =>
  __awaiter(void 0, void 0, void 0, function* () {
    const filePath = path_1.default.join(UPLOAD_PATH, FILENAME_KPIS);
    const { rows, errors } = yield (0, node_1.default)(
      fs_1.default.createReadStream(filePath),
      {
        schema: KPI_SCHEMA,
      }
    );
    if (errors.length === 0) {
      return rows;
    }
    throw new Error(`Failed during excel file stream due to: ${errors}`);
  });
exports.uploadKpis = uploadKpis;
const uploadCapTable = () =>
  __awaiter(void 0, void 0, void 0, function* () {
    const filePath = path_1.default.join(UPLOAD_PATH, FILENAME_CAP_TABLE);
    return yield (0, node_1.default)(fs_1.default.createReadStream(filePath), {
      dateFormat: "mm/dd/yyyy",
    });
  });
exports.uploadCapTable = uploadCapTable;
const deleteSpreadsheets = () => {
  fs_1.default.readdir(UPLOAD_PATH, (err, files) => {
    if (err)
      throw new Error(
        `Failed to read spreadsheet directory at ${UPLOAD_PATH} after submission of kpis with the following error ${err}`
      );
    for (const file of files) {
      fs_1.default.unlink(path_1.default.join(UPLOAD_PATH, file), (err) => {
        if (err)
          throw new Error(
            `Failed to delete spreadsheet ${file} in directory ${UPLOAD_PATH} with the following error ${err}`
          );
      });
    }
  });
};
exports.deleteSpreadsheets = deleteSpreadsheets;
const formatCapTable = (rows) => {
  const columns = rows.reduce(
    (previousRow, currentRow) => (
      currentRow.forEach(
        (cell, i) => (previousRow[i] = previousRow[i] || cell)
      ),
      previousRow
    ),
    []
  );
  const capTable = rows
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
exports.formatCapTable = formatCapTable;
