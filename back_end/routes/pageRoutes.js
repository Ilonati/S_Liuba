const express = require("express");
const router = express.Router();

const pageController = require("../controllers/pageController");
const authMiddleware = require("../middleware/auth");

router.get("/admin", authMiddleware, pageController.getAdminPages);

router.get("/:slug", pageController.getPublicPage);

router.post("/", authMiddleware, pageController.createPage);

router.put("/:id", authMiddleware, pageController.updatePage);

router.delete("/:id", authMiddleware, pageController.deletePage);

module.exports = router;