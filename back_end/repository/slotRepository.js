const db = require("../db");
const blockRepository = require("./blockRepository");

async function getBookedAppointmentsByDate(date) {
    const [rows] = await db.query(
        `SELECT appointment_time
     FROM appointments
     WHERE appointment_date = ?
       AND status NOT IN ('cancelled', 'completed', 'no_show')`,
        [date]
    );

    return rows;
}

module.exports = {
    getBookedAppointmentsByDate
};