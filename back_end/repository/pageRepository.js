const db = require("../db");

async function getAllPages() {
    const [rows] = await db.query(
        "SELECT * FROM pages ORDER BY id ASC"
    );
    return rows;
}

async function getPageBySlug(slug) {
    const [rows] = await db.query(
        "SELECT * FROM pages WHERE slug = ? LIMIT 1",
        [slug]
    );
    return rows[0];
}

async function createPage(data) {
    const [result] = await db.query(
        `INSERT INTO pages
     (slug, title, meta_title, meta_description, is_active)
     VALUES (?, ?, ?, ?, ?)`,
        [
            data.slug,
            data.title,
            data.meta_title || null,
            data.meta_description || null,
            data.is_active !== false
        ]
    );
    return result.insertId;
}

async function updatePage(id, data) {
    const [result] = await db.query(
        `UPDATE pages
     SET slug = ?,
         title = ?,
         meta_title = ?,
         meta_description = ?,
         is_active = ?
     WHERE id = ?`,
        [
            data.slug,
            data.title,
            data.meta_title || null,
            data.meta_description || null,
            data.is_active !== false,
            id
        ]
    );
    return result.affectedRows;
}

async function deletePage(id) {
    const [result] = await db.query(
        "DELETE FROM pages WHERE id = ?",
        [id]
    );
    return result.affectedRows;
}

module.exports = {
    getAllPages,
    getPageBySlug,
    createPage,
    updatePage,
    deletePage
};