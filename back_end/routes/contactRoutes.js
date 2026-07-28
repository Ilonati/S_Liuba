const express = require("express");
const router = express.Router();

const contactController = require("../controllers/contactController");
const authMiddleware = require("../middleware/auth");

router.get("/status", (req, res) => {
    res.json({
        status: "ok",
        contactFlow: "async-mail-v2",
        bookingDurationFlow: "total-duration-v3",
        mailFlow: "awaited-delivery-v5",
        adminHistoryFlow: "bulk-deletable-v2"
    });
});

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
