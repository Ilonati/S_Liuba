const db = require("../db");

async function getAllBlockedClients() {
    const [rows] = await db.query(
        `SELECT *
     FROM blocked_clients
     ORDER BY created_at DESC`
    );
    return rows;
}

async function findBlockedClient(email, phone) {
    const [rows] = await db.query(
        `SELECT *
     FROM blocked_clients
     WHERE is_active = true
       AND (
         (client_email IS NOT NULL AND client_email = ?)
         OR
         (client_phone IS NOT NULL AND client_phone = ?)
       )
     LIMIT 1`,
        [email || null, phone || null]
    );

    return rows[0];
}

async function createBlockedClient(data) {
    const [result] = await db.query(
        `INSERT INTO blocked_clients
     (client_email, client_phone, reason, is_active, created_by_admin_id)
     VALUES (?, ?, ?, ?, ?)`,
        [
            data.client_email || null,
            data.client_phone || null,
            data.reason || null,
            data.is_active !== false,
            data.created_by_admin_id || null
        ]
    );

    return result.insertId;
}

async function toggleBlockedClient(id, isActive) {
    const [result] = await db.query(
        `UPDATE blocked_clients
     SET is_active = ?
     WHERE id = ?`,
        [isActive, id]
    );

    return result.affectedRows;
}

async function deleteBlockedClient(id) {
    const [result] = await db.query(
        `DELETE FROM blocked_clients
     WHERE id = ?`,
        [id]
    );

    return result.affectedRows;
}

module.exports = {
    getAllBlockedClients,
    findBlockedClient,
    createBlockedClient,
    toggleBlockedClient,
    deleteBlockedClient
};