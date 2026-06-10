const db = require("../db");

async function getBlocksByPageSlug(slug, onlyActive = true) {
    let query = `
    SELECT cb.*
    FROM content_blocks cb
    JOIN pages p ON cb.page_id = p.id
    WHERE p.slug = ?
  `;

    const params = [slug];

    if (onlyActive) {
        query += " AND cb.is_active = true";
    }

    query += " ORDER BY cb.sort_order ASC, cb.id ASC";

    const [rows] = await db.query(query, params);
    return rows;
}

async function getAllBlocks() {
    const [rows] = await db.query(
        `SELECT cb.*, p.slug AS page_slug, p.title AS page_title
     FROM content_blocks cb
     JOIN pages p ON cb.page_id = p.id
     ORDER BY p.id ASC, cb.sort_order ASC`
    );

    return rows;
}

async function createBlock(data) {
    const [result] = await db.query(
        `INSERT INTO content_blocks
     (page_id, block_key, type, title, subtitle, content, image_url, button_text, button_link, sort_order, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            data.page_id,
            data.block_key || null,
            data.type || "text",
            data.title || null,
            data.subtitle || null,
            data.content || null,
            data.image_url || null,
            data.button_text || null,
            data.button_link || null,
            data.sort_order || 0,
            data.is_active !== false
        ]
    );

    return result.insertId;
}

async function updateBlock(id, data) {
    const [result] = await db.query(
        `UPDATE content_blocks
     SET page_id = ?,
         block_key = ?,
         type = ?,
         title = ?,
         subtitle = ?,
         content = ?,
         image_url = ?,
         button_text = ?,
         button_link = ?,
         sort_order = ?,
         is_active = ?
     WHERE id = ?`,
        [
            data.page_id,
            data.block_key || null,
            data.type || "text",
            data.title || null,
            data.subtitle || null,
            data.content || null,
            data.image_url || null,
            data.button_text || null,
            data.button_link || null,
            data.sort_order || 0,
            data.is_active !== false,
            id
        ]
    );

    return result.affectedRows;
}

async function toggleBlock(id, isActive) {
    const [result] = await db.query(
        `UPDATE content_blocks
     SET is_active = ?
     WHERE id = ?`,
        [isActive, id]
    );

    return result.affectedRows;
}

async function deleteBlock(id) {
    const [result] = await db.query(
        "DELETE FROM content_blocks WHERE id = ?",
        [id]
    );

    return result.affectedRows;
}

module.exports = {
    getBlocksByPageSlug,
    getAllBlocks,
    createBlock,
    updateBlock,
    toggleBlock,
    deleteBlock
};