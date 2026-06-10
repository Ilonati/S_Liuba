const certificateRepository =
    require("../repository/certificateRepository");

async function getPublicCertificates(req, res) {
    try {
        const certificates =
            await certificateRepository.getPublicCertificates();

        res.json(certificates);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function getAdminCertificates(req, res) {
    try {
        const certificates =
            await certificateRepository.getAdminCertificates();

        res.json(certificates);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function createCertificate(req, res) {
    try {
        const data = req.body || {};

        if (!data.title || !data.file_url) {
            return res.status(400).json({
                message: "Titre et fichier obligatoires"
            });
        }

        const id = await certificateRepository.createCertificate(data);

        res.status(201).json({
            message: "Certificat créé",
            id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function updateCertificate(req, res) {
    try {
        const updatedRows =
            await certificateRepository.updateCertificate(
                req.params.id,
                req.body
            );

        if (updatedRows === 0) {
            return res.status(404).json({
                message: "Certificat introuvable"
            });
        }

        res.json({
            message: "Certificat modifié"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function toggleCertificate(req, res) {
    try {
        const { is_active } = req.body;

        if (typeof is_active !== "boolean") {
            return res.status(400).json({
                message: "is_active doit être true ou false"
            });
        }

        const updatedRows =
            await certificateRepository.toggleCertificate(
                req.params.id,
                is_active
            );

        if (updatedRows === 0) {
            return res.status(404).json({
                message: "Certificat introuvable"
            });
        }

        res.json({
            message: is_active
                ? "Certificat affiché"
                : "Certificat masqué"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function deleteCertificate(req, res) {
    try {
        const deletedRows =
            await certificateRepository.deleteCertificate(req.params.id);

        if (deletedRows === 0) {
            return res.status(404).json({
                message: "Certificat introuvable"
            });
        }

        res.json({
            message: "Certificat supprimé"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

module.exports = {
    getPublicCertificates,
    getAdminCertificates,
    createCertificate,
    updateCertificate,
    toggleCertificate,
    deleteCertificate
};