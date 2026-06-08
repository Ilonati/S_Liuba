const faqRepository = require("../repository/faqRepository");

async function getPublicFaqs(req, res) {
    try {
        const faqs = await faqRepository.getPublicFaqs();
        res.json(faqs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function getAdminFaqs(req, res) {
    try {
        const faqs = await faqRepository.getAdminFaqs();
        res.json(faqs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function createFaq(req, res) {
    try {
        const data = req.body;

        if (!data.question || !data.answer) {
            return res.status(400).json({
                message: "Question et réponse obligatoires"
            });
        }

        const id = await faqRepository.createFaq(data);

        res.status(201).json({
            message: "FAQ créée",
            id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function updateFaq(req, res) {
    try {
        const data = req.body;

        if (!data.question || !data.answer) {
            return res.status(400).json({
                message: "Question et réponse obligatoires"
            });
        }

        await faqRepository.updateFaq(req.params.id, data);

        res.json({
            message: "FAQ modifiée"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function toggleFaq(req, res) {
    try {
        const { is_active } = req.body;

        if (typeof is_active !== "boolean") {
            return res.status(400).json({
                message: "is_active doit être true ou false"
            });
        }

        await faqRepository.toggleFaq(req.params.id, is_active);

        res.json({
            message: is_active ? "FAQ affichée" : "FAQ masquée"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function deleteFaq(req, res) {
    try {
        await faqRepository.deleteFaq(req.params.id);

        res.json({
            message: "FAQ supprimée"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

module.exports = {
    getPublicFaqs,
    getAdminFaqs,
    createFaq,
    updateFaq,
    toggleFaq,
    deleteFaq
};