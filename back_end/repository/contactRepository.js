const db = require("../db");

async function createMessage(data) {
    const [result] = await db.query(
        `INSERT INTO contact_messages
     (name, email, phone, subject, message, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
        [
            data.name,
            data.email,
            data.phone || null,
            data.subject || null,
            data.message,
            "new"
        ]
    );

    return result.insertId;
}

async function getAllMessages() {
    const [rows] = await db.query(
        `SELECT *
     FROM contact_messages
     ORDER BY created_at DESC`
    );

    return rows;
}

async function updateStatus(id, status) {
    const [result] = await db.query(
        `UPDATE contact_messages
     SET status = ?
     WHERE id = ?`,
        [status, id]
    );

    return result.affectedRows;
}

async function deleteMessage(id) {
    const [result] = await db.query(
        `DELETE FROM contact_messages
     WHERE id = ?`,
        [id]
    );

    return result.affectedRows;
}

module.exports = {
    createMessage,
    getAllMessages,
    updateStatus,
    deleteMessage
};