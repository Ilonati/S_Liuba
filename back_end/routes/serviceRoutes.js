const express = require("express");
const router = express.Router();

const serviceController = require("../controllers/serviceController");
const authMiddleware = require("../middleware/auth");

router.get("/", serviceController.getPublicServices);
router.get("/slug/:slug", serviceController.getPublicServiceBySlug);

router.get("/admin", authMiddleware, serviceController.getAdminServices);


router.post("/", authMiddleware, serviceController.createService);
router.patch("/:id/toggle", authMiddleware, serviceController.toggleServiceStatus);

router.put("/:id", authMiddleware, serviceController.updateService);


router.delete("/:id", authMiddleware, serviceController.deleteService);

module.exports = router;