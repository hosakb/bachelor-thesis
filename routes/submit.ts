import express, { Request, Response } from "express";
import multer, {
  FileFilterCallback,
  DiskStorageOptions,
  StorageEngine,
} from "multer";
import readXlsxFile from "read-excel-file/node";
import fs from "fs";

const router = express.Router();

router.get("/:startupId", (req: Request, res: Response) => {
  let page = "submit";
  res.render("submit/index", { page,  erp: false, showData: false });
});

router.get("/", (req, res) => {
  res.redirect("/submit/01041536-a76f-43a5-a3e1-c0e76f8acefa") // TODO: dynamic ID
});

const storage: StorageEngine = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req: Request, file, cb) {
    cb(null, filename);
  },
});

const fileFilter = (
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

let upload = multer({ storage: storage, fileFilter: fileFilter });
router.post("/", upload.single("kpis"), uploadFiles);


const date = new Date();
const filename =
  "kpis-" +
  date.getFullYear() +
  "-" +
  date.getMonth() +
  "-" +
  date.getDate() +
  ".xlsx";

function uploadFiles(req: Request, res: Response) {
  const schema = {
    NetProfitMargin: {
      prop: "netProfitMargin",
      type: Number,
    },
    CashFlowRate: {
      prop: "cashFlowRate",
      type: Number,
    },
    Liquidity: {
      prop: "liquidity",
      type: Number,
    },
  };

  readXlsxFile(fs.createReadStream("./public/uploads/" + filename), {
    schema,
  }).then(({ rows, errors }) => {
    rows.forEach((element) => {
      console.log(element);
    });
  });

  res.render("submit/index", { success: "success" });
}

module.exports = router;
