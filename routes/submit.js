const express = require("express");
const multer  = require('multer')


const router = express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
      cb(null, Date.now() + "--" + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if((file.mimetype).includes('xlsx') || (file.mimetype).includes('vnd.ms-excel') || (file.mimetype).includes('vnd.openxmlformats-officedocument.spreadsheetml.sheet')){
      cb(null, true);
  } else{
      cb(null, false);

  }
};

let upload = multer({ storage: storage, fileFilter: fileFilter});

router.get("/", (req, res) => {
  res.render("submit/index");
});

router.post("/", upload.single('kpis'), uploadFiles);

function uploadFiles(req, res) {
  res.render("submit/index", {success: "success"});
}



module.exports = router;
