const express = require("express");
const router = express.Router();

const galleryController = require("../controllers/galleryController");
const authMiddleware = require("../middleware/auth");

router.get("/categories", galleryController.getCategories);
router.post("/categories", authMiddleware, galleryController.createCategory);

router.get("/", galleryController.getItems);
router.post("/", authMiddleware, galleryController.createItem);

router.put("/:id", authMiddleware, galleryController.updateItem);

router.patch("/:id/toggle", authMiddleware, galleryController.toggleItem);

router.delete("/:id", authMiddleware, galleryController.deleteItem);
router.put("/categories/:id", authMiddleware, galleryController.updateCategory);

router.delete("/categories/:id", authMiddleware, galleryController.deleteCategory);

module.exports = router;