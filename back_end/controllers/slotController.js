const slotRepository = require("../repository/slotRepository");
const blockRepository = require("../repository/blockRepository");

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

async function getAvailableSlots(req, res) {
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
                slots: []
            });
        }

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

        const bookedTimes = bookedAppointments.map((item) =>
            item.appointment_time.toString()
        );
        const blockedTimes = blockedSlots
            .filter((block) => block.block_time !== null)
            .map((block) => block.block_time.toString());

        const availableSlots = allSlots.filter(
            (slot) =>
                !bookedTimes.includes(slot) &&
                !blockedTimes.includes(slot)
        );

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

module.exports = {
    getAvailableSlots
};