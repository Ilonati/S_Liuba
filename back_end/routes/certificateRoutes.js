const express = require("express");
const router = express.Router();

const certificateController =
    require("../controllers/certificateController");

const authMiddleware = require("../middleware/auth");

router.get("/", certificateController.getPublicCertificates);

router.get(
    "/admin",
    authMiddleware,
    certificateController.getAdminCertificates
);

router.post(
    "/",
    authMiddleware,
    certificateController.createCertificate
);

router.put(
    "/:id",
    authMiddleware,
    certificateController.updateCertificate
);

router.patch(
    "/:id/toggle",
    authMiddleware,
    certificateController.toggleCertificate
);

router.delete(
    "/:id",
    authMiddleware,
    certificateController.deleteCertificate
);

module.exports = router;