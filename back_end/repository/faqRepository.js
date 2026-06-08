const db = require("../db");

async function getPublicFaqs() {
    const [rows] = await db.query(
        `SELECT *
     FROM faqs
     WHERE is_active = true
     ORDER BY sort_order ASC, id DESC`
    );
    return rows;
}

async function getAdminFaqs() {
    const [rows] = await db.query(
        `SELECT *
     FROM faqs
     ORDER BY sort_order ASC, id DESC`
    );
    return rows;
}

async function createFaq(data) {
    const [result] = await db.query(
        `INSERT INTO faqs
     (question, answer, category, sort_order, is_active)
     VALUES (?, ?, ?, ?, ?)`,
        [
            data.question,
            data.answer,
            data.category || null,
            data.sort_order || 0,
            data.is_active !== false
        ]
    );

    return result.insertId;
}

async function updateFaq(id, data) {
    await db.query(
        `UPDATE faqs
     SET question = ?,
         answer = ?,
         category = ?,
         sort_order = ?,
         is_active = ?
     WHERE id = ?`,
        [
            data.question,
            data.answer,
            data.category || null,
            data.sort_order || 0,
            data.is_active !== false,
            id
        ]
    );
}

async function toggleFaq(id, isActive) {
    await db.query(
        `UPDATE faqs
     SET is_active = ?
     WHERE id = ?`,
        [isActive, id]
    );
}

async function deleteFaq(id) {
    await db.query(
        "DELETE FROM faqs WHERE id = ?",
        [id]
    );
}

module.exports = {
    getPublicFaqs,
    getAdminFaqs,
    createFaq,
    updateFaq,
    toggleFaq,
    deleteFaq
};