const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const authMiddleware = require("../middleware/auth");
const uploadController = require("../controllers/uploadController");

router.post(
    "/single",
    authMiddleware,
    upload.single("file"),
    uploadController.uploadSingleFile
);
router.delete(
    "/:filename",
    authMiddleware,
    uploadController.deleteFile
);


module.exports = router;