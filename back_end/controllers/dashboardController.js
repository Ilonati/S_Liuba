const dashboardRepository =
    require("../repository/dashboardRepository");

async function getDashboard(req, res) {
    try {
        const stats =
            await dashboardRepository.getDashboardStats();

        res.json(stats);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Erreur serveur"
        });
    }
}

module.exports = {
    getDashboard
};