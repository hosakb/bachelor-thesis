const express = require("express");
const multer  = require('multer')


const router = express.Router();
const upload = multer({ dest: 'public/uploads/' })

router.get("/", (req, res) => {
  res.render("submit/index");
});

router.post("/", upload.array("kpis"), uploadFiles);

function uploadFiles(req, res) {
  console.log(req.body);
  console.log(req.files);
  res.json({ message: "Successfully uploaded files" });
}



module.exports = router;
