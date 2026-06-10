const blockRepository = require("../repository/blockRepository");

async function getAdminBlocks(req, res) {
    try {
        const blocks = await blockRepository.getAllBlocks();
        res.json(blocks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function createBlock(req, res) {
    try {
        const data = req.body;

        if (!data.block_date) {
            return res.status(400).json({
                message: "Date obligatoire"
            });
        }

        data.created_by_admin_id = req.admin.id;

        const id = await blockRepository.createBlock(data);

        res.status(201).json({
            message: "Blocage créé",
            id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function deleteBlock(req, res) {
    try {
        const deletedRows = await blockRepository.deleteBlock(req.params.id);

        if (deletedRows === 0) {
            return res.status(404).json({
                message: "Blocage introuvable"
            });
        }

        res.json({
            message: "Blocage supprimé"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

module.exports = {
    getAdminBlocks,
    createBlock,
    deleteBlock
};