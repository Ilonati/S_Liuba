const db = require("../db");

async function getPublicCertificates() {
    const [rows] = await db.query(
        `SELECT *
     FROM certificates
     WHERE is_active = true
     ORDER BY sort_order ASC, id DESC`
    );

    return rows;
}

async function getAdminCertificates() {
    const [rows] = await db.query(
        `SELECT *
     FROM certificates
     ORDER BY sort_order ASC, id DESC`
    );

    return rows;
}

async function createCertificate(data) {
    const [result] = await db.query(
        `INSERT INTO certificates
     (title, description, file_url, file_type, sort_order, is_active)
     VALUES (?, ?, ?, ?, ?, ?)`,
        [
            data.title,
            data.description || null,
            data.file_url,
            data.file_type || null,
            data.sort_order || 0,
            data.is_active !== false
        ]
    );

    return result.insertId;
}

async function updateCertificate(id, data) {
    const [result] = await db.query(
        `UPDATE certificates
     SET title = ?,
         description = ?,
         file_url = ?,
         file_type = ?,
         sort_order = ?,
         is_active = ?
     WHERE id = ?`,
        [
            data.title,
            data.description || null,
            data.file_url,
            data.file_type || null,
            data.sort_order || 0,
            data.is_active !== false,
            id
        ]
    );

    return result.affectedRows;
}

async function toggleCertificate(id, isActive) {
    const [result] = await db.query(
        `UPDATE certificates
     SET is_active = ?
     WHERE id = ?`,
        [isActive, id]
    );

    return result.affectedRows;
}

async function deleteCertificate(id) {
    const [result] = await db.query(
        `DELETE FROM certificates
     WHERE id = ?`,
        [id]
    );

    return result.affectedRows;
}

module.exports = {
    getPublicCertificates,
    getAdminCertificates,
    createCertificate,
    updateCertificate,
    toggleCertificate,
    deleteCertificate
};