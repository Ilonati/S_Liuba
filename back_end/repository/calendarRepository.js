const db = require("../db");

async function getAppointmentsByDate(date) {
    const [rows] = await db.query(
        `SELECT *
     FROM appointments
     WHERE appointment_date = ?
       AND status NOT IN ('cancelled', 'completed', 'no_show')
     ORDER BY appointment_time ASC`,
        [date]
    );

    return rows;
}

async function getBlocksByDate(date) {
    const [rows] = await db.query(
        `SELECT *
     FROM blocked_slots
     WHERE block_date = ?
     ORDER BY block_time ASC`,
        [date]
    );

    return rows;
}

module.exports = {
    getAppointmentsByDate,
    getBlocksByDate
};