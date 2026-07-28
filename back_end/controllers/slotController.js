const slotRepository = require("../repository/slotRepository");
const blockRepository = require("../repository/blockRepository");

const WORK_START_MINUTES = 9 * 60;
const WORK_END_MINUTES = 19 * 60;
const SLOT_STEP_MINUTES = 30;

function generateDaySlots(durationMinutes) {
    const slots = [];

    for (
        let start = WORK_START_MINUTES;
        start <= WORK_END_MINUTES;
        start += SLOT_STEP_MINUTES
    ) {
        if (start === WORK_END_MINUTES && durationMinutes > 60) {
            continue;
        }

        slots.push(minutesToTime(start));
    }

    return slots;
}

function isSunday(dateString) {
    const date = new Date(dateString);
    return date.getDay() === 0;
}

function timeToMinutes(time) {
    const [hours, minutes] = time.toString().split(":").map(Number);
    return hours * 60 + minutes;
}

function minutesToTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
}

function intervalsOverlap(startA, durationA, startB, durationB) {
    return startA < startB + durationB && startB < startA + durationA;
}

function isValidDuration(value) {
    return Number.isInteger(value) && value > 0 && value <= WORK_END_MINUTES - WORK_START_MINUTES;
}

async function getAvailableSlots(req, res) {
    try {
        const { date, duration } = req.query;

        if (!date) {
            return res.status(400).json({
                message: "Date obligatoire"
            });
        }

        if (isSunday(date)) {
            return res.json({
                date,
                closed: true,
                slots: []
            });
        }

        const selectedDuration = Number(duration || 60);

        if (!isValidDuration(selectedDuration)) {
            return res.status(400).json({ message: "Durée invalide" });
        }

        const allSlots = generateDaySlots(selectedDuration);

        const bookedAppointments =
            await slotRepository.getBookedAppointmentsByDate(date);

        const blockedSlots =
            await blockRepository.getBlocksByDate(date);

        const fullDayBlock = blockedSlots.find(
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
                slots: []
            });
        }

        const blockedTimes = blockedSlots
            .filter((block) => block.block_time !== null)
            .map((block) => timeToMinutes(block.block_time));

        let availableSlots = allSlots.filter((slot) => {
            const candidateStart = timeToMinutes(slot);

            const overlapsAppointment = bookedAppointments.some((appointment) =>
                intervalsOverlap(
                    candidateStart,
                    selectedDuration,
                    timeToMinutes(appointment.appointment_time),
                    Number(appointment.duration_minutes || 60)
                )
            );

            // An hourly admin block makes that complete hour unavailable.
            const overlapsBlock = blockedTimes.some((blockStart) =>
                intervalsOverlap(
                    candidateStart,
                    selectedDuration,
                    blockStart,
                    60
                )
            );

            return !overlapsAppointment && !overlapsBlock;
        });

        availableSlots = removePastSlotsForToday(date, availableSlots);

        res.json({
            date,
            closed: false,
            work_start: "09:00",
            work_end: "19:00",
            slots: availableSlots
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Erreur serveur"
        });
    }
}

function removePastSlotsForToday(dateString, slots) {
    const today = new Date();
    const selectedDate = new Date(dateString);

    const isToday =
        today.getFullYear() === selectedDate.getFullYear() &&
        today.getMonth() === selectedDate.getMonth() &&
        today.getDate() === selectedDate.getDate();

    if (!isToday) {
        return slots;
    }

    const currentHour = today.getHours();
    const currentMinutes = today.getMinutes();

    return slots.filter((slot) => {
        const [slotHour, slotMinutes] = slot.split(":").map(Number);

        if (slotHour > currentHour) return true;

        if (slotHour === currentHour && slotMinutes > currentMinutes) {
            return true;
        }

        return false;
    });
}

module.exports = {
    getAvailableSlots
};
