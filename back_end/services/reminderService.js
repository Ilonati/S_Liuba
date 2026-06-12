const cron = require("node-cron");
const appointmentRepository = require("../repository/appointmentRepository");
const mailService = require("./mailService");

function startAppointmentReminderCron() {
    cron.schedule("0 9 * * *", async () => {
        try {
            console.log("Vérification des rappels RDV...");

            const appointments =
                await appointmentRepository.getTomorrowAppointments();

            for (const appointment of appointments) {
                await mailService.sendAppointmentReminderEmail(appointment);
            }

            console.log(`Rappels envoyés: ${appointments.length}`);
        } catch (error) {
            console.error("Erreur rappel RDV:", error);
        }
    }, {
        timezone: "Europe/Paris"
    });
}

module.exports = {
    startAppointmentReminderCron
};