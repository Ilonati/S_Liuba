const calendarRepository = require("../repository/calendarRepository");

const WORK_START = 9;
const WORK_END = 19;

function generateDaySlots() {
    const slots = [];

    for (let hour = WORK_START; hour < WORK_END; hour++) {
        slots.push(`${String(hour).padStart(2, "0")}:00:00`);
    }

    return slots;
}

function isSunday(dateString) {
    const date = new Date(dateString);
    return date.getDay() === 0;
}

async function getAdminCalendar(req, res) {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                message: "Date obligatoire"
            });
        }

        if (isSunday(date)) {
            return res.json({
                date,
                closed: true,
                message: "Institut fermé le dimanche",
                work_start: "09:00",
                work_end: "19:00",
                day: []
            });
        }

        const appointments =
            await calendarRepository.getAppointmentsByDate(date);

        const blocks =
            await calendarRepository.getBlocksByDate(date);

        const fullDayBlock = blocks.find(
            (block) => block.block_time === null
        );

        if (fullDayBlock) {
            return res.json({
                date,
                closed: true,
                message:
                    fullDayBlock.message ||
                    fullDayBlock.reason ||
                    "Institut fermé",
                work_start: "09:00",
                work_end: "19:00",
                day: []
            });
        }

        const slots = generateDaySlots();

        const day = slots.map((slot) => {
            const appointment = appointments.find(
                (item) => item.appointment_time.toString() === slot
            );

            if (appointment) {
                return {
                    time: slot,
                    status: "booked",
                    appointment
                };
            }

            const block = blocks.find(
                (item) =>
                    item.block_time !== null &&
                    item.block_time.toString() === slot
            );

            if (block) {
                return {
                    time: slot,
                    status: "blocked",
                    reason: block.reason,
                    message: block.message
                };
            }

            return {
                time: slot,
                status: "free"
            };
        });

        res.json({
            date,
            closed: false,
            work_start: "09:00",
            work_end: "19:00",
            day
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Erreur serveur"
        });
    }
}

module.exports = {
    getAdminCalendar
};