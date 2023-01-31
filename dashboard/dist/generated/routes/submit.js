"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const node_1 = __importDefault(require("read-excel-file/node"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
const date = new Date();
const filename =
  "kpis-" +
  date.getFullYear() +
  "-" +
  date.getMonth() +
  "-" +
  date.getDate() +
  ".xlsx";
const storage = multer_1.default.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, filename);
  },
});
const fileFilter = (req, file, cb) => {
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
let upload = (0, multer_1.default)({
  storage: storage,
  fileFilter: fileFilter,
});
router.get("/", (req, res) => {
  res.render("submit/index");
});
router.post("/", upload.single("kpis"), uploadFiles);
function uploadFiles(req, res) {
  const schema = {
    Burnrate: {
      // JSON object property name.
      prop: "burnrate",
      type: Number,
    },
  };
  (0, node_1.default)(
    fs_1.default.createReadStream("./public/uploads/" + filename),
    {
      schema,
    }
  ).then(({ rows, errors }) => {
    rows.forEach((element) => {
      console.log(element);
    });
  });
  res.render("submit/index", { success: "success" });
}
module.exports = router;
