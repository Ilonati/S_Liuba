const settingsRepository = require("../repository/settingsRepository");

async function getPublicSettings(req, res) {
    try {
        const settings = await settingsRepository.getSettingsObject();
        res.json(settings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function getAdminSettings(req, res) {
    try {
        const settings = await settingsRepository.getAllSettings();
        res.json(settings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function upsertSetting(req, res) {
    try {
        const { setting_key, setting_value } = req.body;

        if (!setting_key) {
            return res.status(400).json({
                message: "setting_key obligatoire"
            });
        }

        await settingsRepository.upsertSetting(
            setting_key,
            setting_value || ""
        );

        res.json({
            message: "Paramètre enregistré"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function deleteSetting(req, res) {
    try {
        const deletedRows = await settingsRepository.deleteSetting(
            req.params.key
        );

        if (deletedRows === 0) {
            return res.status(404).json({
                message: "Paramètre introuvable"
            });
        }

        res.json({
            message: "Paramètre supprimé"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

module.exports = {
    getPublicSettings,
    getAdminSettings,
    upsertSetting,
    deleteSetting
};