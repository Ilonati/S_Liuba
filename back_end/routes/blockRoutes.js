const express = require("express");
const router = express.Router();

const blockController = require("../controllers/blockController");
const authMiddleware = require("../middleware/auth");

router.get(
    "/admin",
    authMiddleware,
    blockController.getAdminBlocks
);

router.post(
    "/",
    authMiddleware,
    blockController.createBlock
);

router.delete(
    "/:id",
    authMiddleware,
    blockController.deleteBlock
);

module.exports = router;