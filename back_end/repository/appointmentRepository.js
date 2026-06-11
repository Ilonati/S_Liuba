const db = require("../db");

async function getAllAppointments() {
    const [rows] = await db.query(
        `SELECT a.*, s.title AS service_name
     FROM appointments a
     LEFT JOIN services s ON a.service_id = s.id
     ORDER BY a.appointment_date DESC, a.appointment_time DESC`
    );

    return rows;
}

async function getAppointmentById(id) {
    const [rows] = await db.query(
        `SELECT a.*, s.title AS service_name
     FROM appointments a
     LEFT JOIN services s ON a.service_id = s.id
     WHERE a.id = ?
     LIMIT 1`,
        [id]
    );

    return rows[0];
}

async function checkTimeConflict({ appointment_date, appointment_time, excludeId = null }) {
    let query = `
    SELECT id
    FROM appointments
    WHERE appointment_date = ?
      AND appointment_time = ?
      AND status NOT IN ('cancelled', 'completed', 'no_show')
  `;

    const params = [appointment_date, appointment_time];

    if (excludeId) {
        query += " AND id != ?";
        params.push(excludeId);
    }

    const [rows] = await db.query(query, params);

    return rows.length > 0;
}

async function createAppointment(data) {
    const [result] = await db.query(
        `INSERT INTO appointments
     (
       client_name,
       client_email,
       client_phone,
       service_id,
       service_title,
       appointment_date,
       appointment_time,
       duration_minutes,
       status,
       source,
       notes,
       admin_notes,
       created_by_admin_id
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            data.client_name,
            data.client_email,
            data.client_phone || null,
            data.service_id || null,
            data.service_title,
            data.appointment_date,
            data.appointment_time,
            data.duration_minutes || 60,
            data.status || "confirmed",
            data.source || "client",
            data.notes || null,
            data.admin_notes || null,
            data.created_by_admin_id || null
        ]
    );

    return result.insertId;
}

async function updateAppointment(id, data) {
    await db.query(
        `UPDATE appointments
     SET client_name = ?,
         client_email = ?,
         client_phone = ?,
         service_id = ?,
         service_title = ?,
         appointment_date = ?,
         appointment_time = ?,
         duration_minutes = ?,
         status = ?,
         source = ?,
         notes = ?,
         admin_notes = ?
     WHERE id = ?`,
        [
            data.client_name,
            data.client_email,
            data.client_phone || null,
            data.service_id || null,
            data.service_title,
            data.appointment_date,
            data.appointment_time,
            data.duration_minutes || 60,
            data.status || "confirmed",
            data.source || "client",
            data.notes || null,
            data.admin_notes || null,
            id
        ]
    );
}
async function updateAppointmentStatus(id, status, cancellationReason = null) {
    const [result] = await db.query(
        `UPDATE appointments
         SET status = ?,
             cancellation_reason = ?
         WHERE id = ?`,
        [status, cancellationReason, id]
    );

    return result.affectedRows;
}


async function createHistory(appointmentId, actionType, oldValue, newValue) {
    await db.query(
        `INSERT INTO appointment_history
     (appointment_id, action_type, old_value, new_value)
     VALUES (?, ?, ?, ?)`,
        [
            appointmentId,
            actionType,
            oldValue ? JSON.stringify(oldValue) : null,
            newValue ? JSON.stringify(newValue) : null
        ]
    );
}

module.exports = {
    getAllAppointments,
    getAppointmentById,
    checkTimeConflict,
    createAppointment,
    updateAppointment,
    updateAppointmentStatus,
    createHistory
};