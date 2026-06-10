const express = require("express");
const router = express.Router();

const settingsController = require("../controllers/settingsController");
const authMiddleware = require("../middleware/auth");

router.get("/", settingsController.getPublicSettings);

router.get(
    "/admin",
    authMiddleware,
    settingsController.getAdminSettings
);

router.post(
    "/",
    authMiddleware,
    settingsController.upsertSetting
);

router.delete(
    "/:key",
    authMiddleware,
    settingsController.deleteSetting
);

module.exports = router;