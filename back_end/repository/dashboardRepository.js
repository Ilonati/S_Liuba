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
    const [[monthAppointments]] = await db.query(`
    SELECT COUNT(*) AS total
    FROM appointments
    WHERE MONTH(appointment_date) = MONTH(CURDATE())
      AND YEAR(appointment_date) = YEAR(CURDATE())
`);

    const [[completedAppointments]] = await db.query(`
    SELECT COUNT(*) AS total
    FROM appointments
    WHERE MONTH(appointment_date) = MONTH(CURDATE())
      AND YEAR(appointment_date) = YEAR(CURDATE())
      AND status = 'completed'
`);

    const [[cancelledAppointments]] = await db.query(`
    SELECT COUNT(*) AS total
    FROM appointments
    WHERE MONTH(appointment_date) = MONTH(CURDATE())
      AND YEAR(appointment_date) = YEAR(CURDATE())
      AND status = 'cancelled'
`);

    const [[uniqueClients]] = await db.query(`
    SELECT COUNT(DISTINCT client_email) AS total
    FROM appointments
    WHERE MONTH(appointment_date) = MONTH(CURDATE())
      AND YEAR(appointment_date) = YEAR(CURDATE())
`);

    const [[topService]] = await db.query(`
    SELECT service_title, COUNT(*) AS total
    FROM appointments
    WHERE MONTH(appointment_date) = MONTH(CURDATE())
      AND YEAR(appointment_date) = YEAR(CURDATE())
    GROUP BY service_title
    ORDER BY total DESC
    LIMIT 1
`);
    return {
        todayAppointments: todayAppointments.total,
        weekAppointments: weekAppointments.total,
        newMessages: newMessages.total,
        activeServices: activeServices.total,
        activeFaqs: activeFaqs.total,
        activeCertificates: activeCertificates.total,
        blockedClients: blockedClients.total,
        monthAppointments: monthAppointments.total,
        completedAppointments: completedAppointments.total,
        cancelledAppointments: cancelledAppointments.total,
        uniqueClients: uniqueClients.total,
        topService: topService?.service_title || "-",
        topServiceCount: topService?.total || 0,
        cancellationRate: monthAppointments.total
            ? Math.round((cancelledAppointments.total / monthAppointments.total) * 100)
            : 0
    };

}

module.exports = {
    getDashboardStats
};