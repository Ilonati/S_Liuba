const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/auth");

router.post("/login", adminController.login);
router.get("/me", authMiddleware, adminController.me);
router.put("/change-password", authMiddleware, adminController.changePassword);

module.exports = router;