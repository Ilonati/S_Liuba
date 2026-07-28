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

router.delete(
    "/:id/history",
    authMiddleware,
    appointmentController.deleteHistoricalAppointment
);

router.post(
    "/history/delete",
    authMiddleware,
    appointmentController.deleteHistoricalAppointments
);

module.exports = router;
