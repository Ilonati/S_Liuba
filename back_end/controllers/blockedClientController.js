const blockedClientRepository =
    require("../repository/blockedClientRepository");

async function getAdminBlockedClients(req, res) {
    try {
        const clients =
            await blockedClientRepository.getAllBlockedClients();

        res.json(clients);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function createBlockedClient(req, res) {
    try {
        const data = req.body;

        if (!data.client_email && !data.client_phone) {
            return res.status(400).json({
                message: "Email ou téléphone obligatoire"
            });
        }

        data.created_by_admin_id = req.admin.id;

        const id =
            await blockedClientRepository.createBlockedClient(data);

        res.status(201).json({
            message: "Client bloqué",
            id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function toggleBlockedClient(req, res) {
    try {
        const { is_active } = req.body;

        if (typeof is_active !== "boolean") {
            return res.status(400).json({
                message: "is_active doit être true ou false"
            });
        }

        const updatedRows =
            await blockedClientRepository.toggleBlockedClient(
                req.params.id,
                is_active
            );

        if (updatedRows === 0) {
            return res.status(404).json({
                message: "Client bloqué introuvable"
            });
        }

        res.json({
            message: is_active
                ? "Client bloqué activé"
                : "Client débloqué"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function deleteBlockedClient(req, res) {
    try {
        const deletedRows =
            await blockedClientRepository.deleteBlockedClient(req.params.id);

        if (deletedRows === 0) {
            return res.status(404).json({
                message: "Client bloqué introuvable"
            });
        }

        res.json({
            message: "Client supprimé de la liste noire"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

module.exports = {
    getAdminBlockedClients,
    createBlockedClient,
    toggleBlockedClient,
    deleteBlockedClient
};