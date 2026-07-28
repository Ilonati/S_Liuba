const contactRepository = require("../repository/contactRepository");
const mailService = require("../services/mailService");

async function createMessage(req, res) {
    try {
        const data = req.body || {};

        if (!data.name || !data.email || !data.message) {
            return res.status(400).json({
                message: "Nom, email et message obligatoires"
            });
        }

        const id = await contactRepository.createMessage(data);

        res.status(201).json({
            message: "Message envoyé",
            id
        });

        // The message is safely stored, so confirm it without making the
        // visitor wait for the mail server.
        mailService.sendContactMessageToAdmin(data).catch((emailError) => {
            console.error("Contact email failed:", emailError.message);
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function getAdminMessages(req, res) {
    try {
        const messages = await contactRepository.getAllMessages();
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function updateStatus(req, res) {
    try {
        const { status } = req.body;

        const allowedStatuses = ["new", "read", "answered", "archived"];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Statut invalide"
            });
        }

        const updatedRows = await contactRepository.updateStatus(
            req.params.id,
            status
        );

        if (updatedRows === 0) {
            return res.status(404).json({
                message: "Message introuvable"
            });
        }

        res.json({
            message: "Statut modifié"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function deleteMessage(req, res) {
    try {
        const deletedRows = await contactRepository.deleteMessage(req.params.id);

        if (deletedRows === 0) {
            return res.status(404).json({
                message: "Message introuvable"
            });
        }

        res.json({
            message: "Message supprimé"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

module.exports = {
    createMessage,
    getAdminMessages,
    updateStatus,
    deleteMessage
};
