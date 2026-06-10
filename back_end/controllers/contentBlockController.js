const contentBlockRepository =
    require("../repository/contentBlockRepository");

async function getPublicBlocksByPage(req, res) {
    try {
        const blocks =
            await contentBlockRepository.getBlocksByPageSlug(
                req.params.slug,
                true
            );

        res.json(blocks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function getAdminBlocks(req, res) {
    try {
        const blocks = await contentBlockRepository.getAllBlocks();
        res.json(blocks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function createBlock(req, res) {
    try {
        const data = req.body || {};

        if (!data.page_id || !data.type) {
            return res.status(400).json({
                message: "page_id et type obligatoires"
            });
        }

        const id = await contentBlockRepository.createBlock(data);

        res.status(201).json({
            message: "Bloc créé",
            id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function updateBlock(req, res) {
    try {
        const updatedRows = await contentBlockRepository.updateBlock(
            req.params.id,
            req.body
        );

        if (updatedRows === 0) {
            return res.status(404).json({
                message: "Bloc introuvable"
            });
        }

        res.json({
            message: "Bloc modifié"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function toggleBlock(req, res) {
    try {
        const { is_active } = req.body;

        if (typeof is_active !== "boolean") {
            return res.status(400).json({
                message: "is_active doit être true ou false"
            });
        }

        const updatedRows = await contentBlockRepository.toggleBlock(
            req.params.id,
            is_active
        );

        if (updatedRows === 0) {
            return res.status(404).json({
                message: "Bloc introuvable"
            });
        }

        res.json({
            message: is_active ? "Bloc affiché" : "Bloc masqué"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function deleteBlock(req, res) {
    try {
        const deletedRows = await contentBlockRepository.deleteBlock(
            req.params.id
        );

        if (deletedRows === 0) {
            return res.status(404).json({
                message: "Bloc introuvable"
            });
        }

        res.json({
            message: "Bloc supprimé"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

module.exports = {
    getPublicBlocksByPage,
    getAdminBlocks,
    createBlock,
    updateBlock,
    toggleBlock,
    deleteBlock
};