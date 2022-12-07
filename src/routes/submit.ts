import express, { Request, Response } from "express";
import multer, { FileFilterCallback, StorageEngine } from "multer";
import readXlsxFile from "read-excel-file/node";
import fs from "fs";
import path from "path";
import { Kpis, updateKpis } from "../models/startup";
import getTodaysDate from "../util/date";
import notifyFund from "../util/mail";

const router = express.Router();

const UPLOAD_PATH = path.join(__dirname, "..", "public", "uploads");

router.get("/:startupId", (req, res) => {
  res.render("submit/index", {
    layout: "../views/layouts/startup.ejs",
    page: "submit",
    title: "Finvia", // TODO: make dynamic
    name: req.user?.firstName + " " + req.user?.lastName,
  });
});

router.get("/", (req, res) => {
  res.redirect("/submit/" + req.session.startupId);
});

const storage: StorageEngine = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb) {
    cb(null, "src/public/uploads");
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

const upload = multer({ storage: storage, fileFilter: fileFilter });
router.post("/", upload.single("kpis"), uploadFiles);

const filename = "kpis-" + getTodaysDate() + ".xlsx";

function uploadFiles(req: Request, res: Response) {
  const schema = {
    Date: {
      prop: "date",
      type: Date,
    },
    "Net Profit Margin": {
      prop: "netProfitMargin",
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

  const filePath = path.join(UPLOAD_PATH, filename);

  readXlsxFile(fs.createReadStream(filePath), {
    schema,
  }).then(({ rows, errors }) => {
    if (errors.length === 0) {
      const json = JSON.stringify(rows[rows.length - 1]);
      const kpis: Kpis = JSON.parse(json);

      kpis.date = kpis.date.substring(0, 10);
      kpis.cashFlowRate = Math.round(kpis.cashFlowRate * 100);
      kpis.netProfitMargin = Math.round(kpis.netProfitMargin * 100);
      kpis.liquidity = Math.round(kpis.liquidity * 100);

      res.render("submit/index", {
        layout: "../views/layouts/startup.ejs",
        page: "submit",
        kpis,
        title: "Finvia", // TODO: make dynamic
        name: req.user?.firstName + " " + req.user?.lastName,
      });

      return;
    }
    throw new Error(`Failed during excel file stream due to: ${errors}`);
  });
}

router.post("/reupload", (req, res) => {
  deleteSpreadsheets(UPLOAD_PATH);
  res.redirect("/submit/" + req.session.startupId);
});

router.post("/kpis", async (req, res) => {
  const { date, netProfitMargin, cashFlowRate, liquidity } = req.body.kpis;

  const kpis: Kpis = {
    date: date,
    netProfitMargin: netProfitMargin,
    cashFlowRate: cashFlowRate,
    liquidity: liquidity,
  };

  deleteSpreadsheets(UPLOAD_PATH); // TODO: error handling
  await updateKpis(kpis, req.session.startupId, req.session.phase); // TODO: error handling

  if(req.user === undefined) {
    throw new Error("Cannot access user info in session.");
  }
 
  const fundMails: string[] = await getFundsByStartupId(req.session.startupId);

  fundMails.forEach(fundMail => notifyFund(fundMail));

  res.redirect("/startup");
});

router.post("/kpi-form", async (req, res) => {
  const { netProfitMargin, cashFlowRate, liquidity } = req.body;

  const kpis: Kpis = {
    date: getTodaysDate(),
    netProfitMargin: netProfitMargin,
    cashFlowRate: cashFlowRate,
    liquidity: liquidity,
  };
  await updateKpis(kpis, req.session.startupId, req.session.phase);
 
  const fundMails: string[] = await getFundsByStartupId(req.session.startupId);

  fundMails.forEach(fundMail => notifyFund(fundMail));

  res.redirect("/startup");
});

function deleteSpreadsheets(uploadPath: string) {
  fs.readdir(uploadPath, (err, files) => {
    if (err)
      throw new Error(
        `Failed to read spreadsheet directory at ${uploadPath} after submission of kpis with the following error ${err}`
      );

    for (const file of files) {
      fs.unlink(path.join(uploadPath, file), (err) => {
        if (err)
          throw new Error(
            `Failed to delete spreadsheet ${file} in directory ${uploadPath} with the following error ${err}`
          );
      });
    }
  });
}

export default router;
