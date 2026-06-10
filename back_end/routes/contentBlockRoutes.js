const express = require("express");
const router = express.Router();

const contentBlockController =
    require("../controllers/contentBlockController");

const authMiddleware = require("../middleware/auth");

router.get(
    "/page/:slug",
    contentBlockController.getPublicBlocksByPage
);

router.get(
    "/admin",
    authMiddleware,
    contentBlockController.getAdminBlocks
);

router.post(
    "/",
    authMiddleware,
    contentBlockController.createBlock
);

router.put(
    "/:id",
    authMiddleware,
    contentBlockController.updateBlock
);

router.patch(
    "/:id/toggle",
    authMiddleware,
    contentBlockController.toggleBlock
);

router.delete(
    "/:id",
    authMiddleware,
    contentBlockController.deleteBlock
);

module.exports = router;