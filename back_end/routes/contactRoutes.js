const express = require("express");
const router = express.Router();

const contactController = require("../controllers/contactController");
const authMiddleware = require("../middleware/auth");

router.post("/", contactController.createMessage);

router.get(
    "/admin",
    authMiddleware,
    contactController.getAdminMessages
);

router.patch(
    "/:id/status",
    authMiddleware,
    contactController.updateStatus
);

router.delete(
    "/:id",
    authMiddleware,
    contactController.deleteMessage
);

module.exports = router;