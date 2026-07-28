const appointmentRepository = require("../repository/appointmentRepository");
const mailService = require("../services/mailService");
const blockedClientRepository = require("../repository/blockedClientRepository");
const blockRepository = require("../repository/blockRepository");

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

function isSunday(dateString) {
    const date = new Date(dateString);
    return date.getDay() === 0;
}

function isPastDateTime(dateString, timeString) {
    const appointmentDateTime = new Date(`${dateString}T${timeString}`);
    const now = new Date();

    return appointmentDateTime < now;
}

function timeToMinutes(timeString) {
    const [hours, minutes] = String(timeString).split(":").map(Number);
    return hours * 60 + minutes;
}

function hasValidWorkingHours(timeString, durationMinutes) {
    const start = timeToMinutes(timeString);
    return Number.isInteger(durationMinutes) && durationMinutes > 0 &&
        start >= 9 * 60 && start <= 19 * 60;
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
        if (isSunday(data.appointment_date)) {
            return res.status(400).json({
                message: "Institut fermé le dimanche"
            });
        }

        if (isPastDateTime(data.appointment_date, data.appointment_time)) {
            return res.status(400).json({
                message: "Impossible de réserver un créneau passé"
            });
        }

        const durationMinutes = Number(data.duration_minutes || 60);

        if (!hasValidWorkingHours(data.appointment_time, durationMinutes)) {
            return res.status(400).json({
                message: "Ce rendez-vous dépasse les horaires d’ouverture"
            });
        }

        const blockedSlots = await blockRepository.getBlocksByDate(
            data.appointment_date
        );

        const fullDayBlock = blockedSlots.find(
            (block) => block.block_time === null
        );

        if (fullDayBlock) {
            return res.status(400).json({
                message:
                    fullDayBlock.message ||
                    fullDayBlock.reason ||
                    "Institut fermé ce jour-là"
            });
        }

        const appointmentStart = timeToMinutes(data.appointment_time);
        const blockedHour = blockedSlots.find(
            (block) => block.block_time !== null &&
                appointmentStart < timeToMinutes(block.block_time) + 60 &&
                timeToMinutes(block.block_time) <
                    appointmentStart + durationMinutes
        );

        if (blockedHour) {
            return res.status(400).json({
                message:
                    blockedHour.message ||
                    blockedHour.reason ||
                    "Créneau indisponible"
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
                appointment_time: data.appointment_time,
                duration_minutes: durationMinutes
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

        const durationMinutes = Number(req.body.duration_minutes || 60);

        if (!hasValidWorkingHours(req.body.appointment_time, durationMinutes)) {
            return res.status(400).json({
                message: "Ce rendez-vous dépasse les horaires d’ouverture"
            });
        }

        const conflict =
            await appointmentRepository.checkTimeConflict({
                appointment_date: req.body.appointment_date,
                appointment_time: req.body.appointment_time,
                duration_minutes: durationMinutes,
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

        const allowedStatuses = [
            "pending",
            "confirmed",
            "cancelled",
            "completed",
            "no_show"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Statut invalide"
            });
        }

        const appointment =
            await appointmentRepository.getAppointmentById(id);

        if (!appointment) {
            return res.status(404).json({
                message: "Rendez-vous introuvable"
            });
        }

        const updatedRows =
            await appointmentRepository.updateAppointmentStatus(
                id,
                status,
                reason || null
            );

        if (updatedRows === 0) {
            return res.status(404).json({
                message: "Rendez-vous introuvable"
            });
        }

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
        if (status === "completed") {
            await mailService.sendReviewRequestEmail(updatedAppointment);
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
