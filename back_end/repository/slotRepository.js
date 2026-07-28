const db = require("../db");
const blockRepository = require("./blockRepository");

async function getBookedAppointmentsByDate(date) {
    const [rows] = await db.query(
        `SELECT
           a.appointment_time,
           COALESCE(
             (SELECT s.duration_minutes
                FROM services s
               WHERE s.id = a.service_id
                  OR (a.service_id IS NULL AND LOWER(TRIM(s.title)) = LOWER(TRIM(a.service_title)))
               ORDER BY (s.id = a.service_id) DESC, s.id DESC
               LIMIT 1),
             a.duration_minutes,
             60
           ) AS duration_minutes
     FROM appointments a
     WHERE a.appointment_date = ?
       AND a.status NOT IN ('cancelled', 'completed', 'no_show')`,
        [date]
    );

    return rows;
}

module.exports = {
    getBookedAppointmentsByDate
};
