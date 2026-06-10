const express = require("express");
const router = express.Router();

const blockedClientController =
    require("../controllers/blockedClientController");

const authMiddleware = require("../middleware/auth");

router.get(
    "/admin",
    authMiddleware,
    blockedClientController.getAdminBlockedClients
);

router.post(
    "/",
    authMiddleware,
    blockedClientController.createBlockedClient
);

router.patch(
    "/:id/toggle",
    authMiddleware,
    blockedClientController.toggleBlockedClient
);

router.delete(
    "/:id",
    authMiddleware,
    blockedClientController.deleteBlockedClient
);

module.exports = router;