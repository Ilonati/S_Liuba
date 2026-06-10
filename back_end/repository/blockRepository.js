const db = require("../db");

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

async function getAllBlocks() {
    const [rows] = await db.query(
        `SELECT *
     FROM blocked_slots
     ORDER BY block_date DESC, block_time ASC`
    );

    return rows;
}

async function createBlock(data) {
    const [result] = await db.query(
        `INSERT INTO blocked_slots
     (block_date, block_time, reason, message, created_by_admin_id)
     VALUES (?, ?, ?, ?, ?)`,
        [
            data.block_date,
            data.block_time || null,
            data.reason || null,
            data.message || null,
            data.created_by_admin_id || null
        ]
    );

    return result.insertId;
}

async function deleteBlock(id) {
    const [result] = await db.query(
        "DELETE FROM blocked_slots WHERE id = ?",
        [id]
    );

    return result.affectedRows;
}

module.exports = {
    getBlocksByDate,
    getAllBlocks,
    createBlock,
    deleteBlock
};