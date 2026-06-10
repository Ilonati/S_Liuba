const express = require("express");
const router = express.Router();

const calendarController = require("../controllers/calendarController");
const authMiddleware = require("../middleware/auth");

router.get(
    "/",
    authMiddleware,
    calendarController.getAdminCalendar
);

module.exports = router;