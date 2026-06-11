const db = require("../db");

async function getDashboardStats() {
    const [[todayAppointments]] = await db.query(`
    SELECT COUNT(*) AS total
    FROM appointments
    WHERE appointment_date = CURDATE()
      AND status IN ('pending', 'confirmed')
`);

    const [[weekAppointments]] = await db.query(`
        SELECT COUNT(*) AS total
        FROM appointments
        WHERE YEARWEEK(appointment_date, 1)
              = YEARWEEK(CURDATE(), 1)
    `);

    const [[newMessages]] = await db.query(`
        SELECT COUNT(*) AS total
        FROM contact_messages
        WHERE status = 'new'
    `);

    const [[activeServices]] = await db.query(`
        SELECT COUNT(*) AS total
        FROM services
        WHERE is_active = true
    `);

    const [[activeFaqs]] = await db.query(`
        SELECT COUNT(*) AS total
        FROM faqs
        WHERE is_active = true
    `);

    const [[activeCertificates]] = await db.query(`
        SELECT COUNT(*) AS total
        FROM certificates
        WHERE is_active = true
    `);

    const [[blockedClients]] = await db.query(`
        SELECT COUNT(*) AS total
        FROM blocked_clients
        WHERE is_active = true
    `);

    return {
        todayAppointments: todayAppointments.total,
        weekAppointments: weekAppointments.total,
        newMessages: newMessages.total,
        activeServices: activeServices.total,
        activeFaqs: activeFaqs.total,
        activeCertificates: activeCertificates.total,
        blockedClients: blockedClients.total
    };
}

module.exports = {
    getDashboardStats
};