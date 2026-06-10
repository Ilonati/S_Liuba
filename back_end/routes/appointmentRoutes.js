const express = require("express");
const router = express.Router();

const appointmentController =
    require("../controllers/appointmentController");

const authMiddleware =
    require("../middleware/auth");

router.post(
    "/",
    appointmentController.createAppointment
);

router.get(
    "/admin",
    authMiddleware,
    appointmentController.getAdminAppointments
);

router.put(
    "/:id",
    authMiddleware,
    appointmentController.updateAppointment
);

router.patch(
    "/:id/status",
    authMiddleware,
    appointmentController.updateStatus
);

module.exports = router;