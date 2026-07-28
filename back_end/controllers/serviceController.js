const serviceRepository = require("../repository/serviceRepository");

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

async function getPublicServices(req, res) {
    try {
        const services = await serviceRepository.getActiveServices();
        res.json(services);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function getAdminServices(req, res) {
    try {
        const services = await serviceRepository.getAllServices();
        res.json(services);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function createService(req, res) {
    try {
        const data = req.body;

        if (!data.title) {
            return res.status(400).json({ message: "Le titre est obligatoire" });
        }

        data.slug = data.slug || makeSlug(data.title);
        // A service created by the administrator must immediately be bookable.
        data.is_active = true;

        const id = await serviceRepository.createService(data);

        res.status(201).json({
            message: "Service créé",
            id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function updateService(req, res) {
    try {
        const { id } = req.params;
        const data = req.body;

        if (!data.title) {
            return res.status(400).json({ message: "Le titre est obligatoire" });
        }

        data.slug = data.slug || makeSlug(data.title);

        await serviceRepository.updateService(id, data);

        res.json({ message: "Service modifié" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function deleteService(req, res) {
    try {
        const { id } = req.params;

        await serviceRepository.deleteService(id);

        res.json({ message: "Service supprimé" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

module.exports = {
    getPublicServices,
    getAdminServices,
    createService,
    updateService,
    deleteService
};

async function toggleServiceStatus(req, res) {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        if (typeof is_active !== "boolean") {
            return res.status(400).json({
                message: "is_active doit être true ou false"
            });
        }

        await serviceRepository.toggleServiceStatus(id, is_active);

        res.json({
            message: is_active
                ? "Service affiché sur le site"
                : "Service masqué du site"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function getPublicServiceBySlug(req, res) {
    try {
        const service = await serviceRepository.getServiceBySlug(req.params.slug);

        if (!service) {
            return res.status(404).json({
                message: "Service introuvable"
            });
        }

        res.json(service);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

module.exports = {
    getPublicServices,
    getAdminServices,
    createService,
    updateService,
    deleteService,
    toggleServiceStatus,
    getPublicServiceBySlug
};
