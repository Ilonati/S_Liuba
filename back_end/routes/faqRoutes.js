const express = require("express");
const router = express.Router();

const faqController = require("../controllers/faqController");
const authMiddleware = require("../middleware/auth");

router.get("/", faqController.getPublicFaqs);

router.get("/admin", authMiddleware, faqController.getAdminFaqs);

router.post("/", authMiddleware, faqController.createFaq);

router.put("/:id", authMiddleware, faqController.updateFaq);

router.patch("/:id/toggle", authMiddleware, faqController.toggleFaq);

router.delete("/:id", authMiddleware, faqController.deleteFaq);

module.exports = router;