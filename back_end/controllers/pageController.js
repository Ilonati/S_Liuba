const pageRepository = require("../repository/pageRepository");

async function getAdminPages(req, res) {
    try {
        const pages = await pageRepository.getAllPages();
        res.json(pages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function getPublicPage(req, res) {
    try {
        const page = await pageRepository.getPageBySlug(req.params.slug);

        if (!page || !page.is_active) {
            return res.status(404).json({
                message: "Page introuvable"
            });
        }

        res.json(page);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function createPage(req, res) {
    try {
        const data = req.body || {};

        if (!data.slug || !data.title) {
            return res.status(400).json({
                message: "Slug et titre obligatoires"
            });
        }

        const id = await pageRepository.createPage(data);

        res.status(201).json({
            message: "Page créée",
            id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function updatePage(req, res) {
    try {
        const updatedRows = await pageRepository.updatePage(
            req.params.id,
            req.body
        );

        if (updatedRows === 0) {
            return res.status(404).json({
                message: "Page introuvable"
            });
        }

        res.json({
            message: "Page modifiée"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function deletePage(req, res) {
    try {
        const deletedRows = await pageRepository.deletePage(req.params.id);

        if (deletedRows === 0) {
            return res.status(404).json({
                message: "Page introuvable"
            });
        }

        res.json({
            message: "Page supprimée"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

module.exports = {
    getAdminPages,
    getPublicPage,
    createPage,
    updatePage,
    deletePage
};