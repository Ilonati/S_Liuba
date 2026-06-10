const appointmentRepository = require("../repository/appointmentRepository");
const mailService = require("../services/mailService");
const blockedClientRepository = require("../repository/blockedClientRepository");

async function getAdminAppointments(req, res) {
    try {
        const appointments =
            await appointmentRepository.getAllAppointments();

        res.json(appointments);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Erreur serveur"
        });

    }
}

async function createAppointment(req, res) {
    try {

        const data = req.body;

        if (
            !data.client_name ||
            !data.client_email ||
            !data.service_title ||
            !data.appointment_date ||
            !data.appointment_time
        ) {
            return res.status(400).json({
                message: "Champs obligatoires manquants"
            });
        }
        if (data.source !== "admin") {
            const blockedClient =
                await blockedClientRepository.findBlockedClient(
                    data.client_email,
                    data.client_phone
                );

            if (blockedClient) {
                return res.status(403).json({
                    message:
                        "Impossible de prendre rendez-vous en ligne. Veuillez contacter l’institut."
                });
            }
        }
        const conflict =
            await appointmentRepository.checkTimeConflict({
                appointment_date: data.appointment_date,
                appointment_time: data.appointment_time
            });

        if (conflict) {
            return res.status(409).json({
                message: "Créneau déjà réservé"
            });
        }

        const appointmentId =
            await appointmentRepository.createAppointment(data);

        await appointmentRepository.createHistory(
            appointmentId,
            "created",
            null,
            data
        );
        const newAppointment =
            await appointmentRepository.getAppointmentById(appointmentId);

        await mailService.sendAppointmentCreatedEmails(newAppointment);

        res.status(201).json({
            message: "Rendez-vous créé",
            appointmentId
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Erreur serveur"
        });

    }

}

async function updateAppointment(req, res) {
    try {

        const id = req.params.id;

        const oldAppointment =
            await appointmentRepository.getAppointmentById(id);

        if (!oldAppointment) {
            return res.status(404).json({
                message: "Rendez-vous introuvable"
            });
        }

        const conflict =
            await appointmentRepository.checkTimeConflict({
                appointment_date: req.body.appointment_date,
                appointment_time: req.body.appointment_time,
                excludeId: id
            });

        if (conflict) {
            return res.status(409).json({
                message: "Créneau déjà réservé"
            });
        }

        await appointmentRepository.updateAppointment(
            id,
            req.body
        );

        await appointmentRepository.createHistory(
            id,
            "updated",
            oldAppointment,
            req.body
        );
        const updatedAppointment =
            await appointmentRepository.getAppointmentById(id);

        await mailService.sendAppointmentUpdatedEmails(updatedAppointment);

        res.json({
            message: "Rendez-vous modifié"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Erreur serveur"
        });

    }
}

async function updateStatus(req, res) {
    try {

        const id = req.params.id;

        const { status, reason } = req.body;

        const appointment =
            await appointmentRepository.getAppointmentById(id);

        if (!appointment) {
            return res.status(404).json({
                message: "Rendez-vous introuvable"
            });
        }

        await appointmentRepository.updateAppointmentStatus(
            id,
            status,
            reason || null
        );

        await appointmentRepository.createHistory(
            id,
            "status_change",
            { status: appointment.status },
            { status }
        );
        const updatedAppointment =
            await appointmentRepository.getAppointmentById(id);

        if (status === "cancelled") {
            await mailService.sendAppointmentCancelledEmails(
                updatedAppointment,
                reason
            );
        }

        res.json({
            message: "Statut modifié"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Erreur serveur"
        });

    }
}

module.exports = {
    getAdminAppointments,
    createAppointment,
    updateAppointment,
    updateStatus
};