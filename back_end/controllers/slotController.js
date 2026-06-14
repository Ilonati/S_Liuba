const slotRepository = require("../repository/slotRepository");
const blockRepository = require("../repository/blockRepository");

const WORK_START = 9;
const WORK_END = 19;

function generateDaySlots() {
    const slots = [];

    for (let hour = WORK_START; hour <= WORK_END; hour++) {
        slots.push(`${String(hour).padStart(2, "0")}:00:00`);
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

function getBookedTimesFromAppointments(appointments) {
    const bookedTimes = [];

    appointments.forEach((appointment) => {
        const startMinutes = timeToMinutes(appointment.appointment_time);
        const duration = Number(appointment.duration_minutes || 60);
        const slotsToBlock = Math.ceil(duration / 60);

        for (let i = 0; i < slotsToBlock; i++) {
            bookedTimes.push(minutesToTime(startMinutes + i * 60));
        }
    });

    return bookedTimes;
}

function removeSlotsThatDoNotFitDuration(slots, selectedDuration = 60) {
    const workEndMinutes = WORK_END * 60;
    const duration = Number(selectedDuration || 60);

    return slots.filter((slot) => {
        const startMinutes = timeToMinutes(slot);
        return startMinutes + duration <= workEndMinutes;
    });
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
        const allSlots = generateDaySlots();

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

        const bookedTimes =
            getBookedTimesFromAppointments(bookedAppointments);

        const blockedTimes = blockedSlots
            .filter((block) => block.block_time !== null)
            .map((block) => block.block_time.toString());

        let unavailableTimes = [
            ...bookedTimes,
            ...blockedTimes
        ];

        let availableSlots = allSlots.filter(
            (slot) => !unavailableTimes.includes(slot)
        );

        availableSlots = removeSlotsThatDoNotFitDuration(
            availableSlots,
            selectedDuration
        );

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