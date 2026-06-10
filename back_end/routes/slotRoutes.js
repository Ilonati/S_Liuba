const express = require("express");
const router = express.Router();

const slotController = require("../controllers/slotController");

router.get("/", slotController.getAvailableSlots);

module.exports = router;