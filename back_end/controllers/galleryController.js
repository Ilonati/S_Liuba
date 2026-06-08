const galleryRepository = require("../repository/galleryRepository");

function makeSlug(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[àáâãäå]/g, "a")
        .replace(/[èéêë]/g, "e")
        .replace(/[ìíîï]/g, "i")
        .replace(/[òóôõö]/g, "o")
        .replace(/[ùúûü]/g, "u")
        .replace(/[ç]/g, "c")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

async function getCategories(req, res) {
    try {
        const categories = await galleryRepository.getCategories();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function createCategory(req, res) {
    try {
        const data = req.body;

        if (!data.name) {
            return res.status(400).json({ message: "Le nom est obligatoire" });
        }

        data.slug = data.slug || makeSlug(data.name);

        const id = await galleryRepository.createCategory(data);

        res.status(201).json({
            message: "Catégorie créée",
            id
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function getItems(req, res) {
    try {
        const items = await galleryRepository.getItems();
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function createItem(req, res) {
    try {
        const data = req.body;

        if (!data.image_url) {
            return res.status(400).json({ message: "Image obligatoire" });
        }

        const id = await galleryRepository.createItem(data);

        res.status(201).json({
            message: "Image ajoutée à la galerie",
            id
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function updateItem(req, res) {
    try {
        await galleryRepository.updateItem(req.params.id, req.body);
        res.json({ message: "Image modifiée" });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function toggleItem(req, res) {
    try {
        const { is_active } = req.body;

        if (typeof is_active !== "boolean") {
            return res.status(400).json({
                message: "is_active doit être true ou false"
            });
        }

        await galleryRepository.toggleItem(req.params.id, is_active);

        res.json({
            message: is_active ? "Image affichée" : "Image masquée"
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function deleteItem(req, res) {
    try {
        await galleryRepository.deleteItem(req.params.id);
        res.json({ message: "Image supprimée de la galerie" });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function updateCategory(req, res) {
    try {

        const data = req.body;

        data.slug =
            data.slug ||
            makeSlug(data.name);

        await galleryRepository.updateCategory(
            req.params.id,
            data
        );

        res.json({
            message: "Catégorie modifiée"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Erreur serveur"
        });

    }
}

async function deleteCategory(req, res) {
    try {

        await galleryRepository.deleteCategory(
            req.params.id
        );

        res.json({
            message: "Catégorie supprimée"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Erreur serveur"
        });

    }
}

module.exports = {
    getCategories,
    createCategory,
    getItems,
    createItem,
    updateItem,
    toggleItem,
    deleteItem,
    updateCategory,
    deleteCategory
};