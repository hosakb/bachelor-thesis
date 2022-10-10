import express, { Request, Response, } from 'express';
import multer, {FileFilterCallback, DiskStorageOptions, StorageEngine} from 'multer';
import readXlsxFile from 'read-excel-file/node';
import fs from 'fs';

const router = express.Router();

const date = new Date();
const filename = 'kpis-' + date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate()  + '.xls';


const storage: StorageEngine = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb) {
      cb(null, 'public/uploads');
  },
  filename: function (req: Request, file, cb) {
      cb(null,filename);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if((file.mimetype).includes('xlsx') || (file.mimetype).includes('vnd.ms-excel') || (file.mimetype).includes('vnd.openxmlformats-officedocument.spreadsheetml.sheet')){
      cb(null, true);
  } else{
      cb(null, false);

  }
};

let upload = multer({ storage: storage, fileFilter: fileFilter});

router.get("/", (req: Request, res: Response) => {

  res.render("submit/index");
});

router.post("/", upload.single('kpis'), uploadFiles);

function uploadFiles(req: Request, res: Response) {

  
const schema = {
  'Burnrate': {
    // JSON object property name.
    prop: 'burnrate',
    type: Number
  }};

  readXlsxFile(fs.createReadStream('./public/uploads/' + filename), { schema }).then(({ rows, errors }) => {
    rows.forEach(element => {
      console.log(element)
    });
  })

  res.render("submit/index", {success: "success"});

}

module.exports = router;
