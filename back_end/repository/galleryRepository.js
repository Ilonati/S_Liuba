const db = require("../db");

async function getCategories() {
    const [rows] = await db.query(
        "SELECT * FROM gallery_categories ORDER BY sort_order ASC, id DESC"
    );
    return rows;
}

async function createCategory(data) {
    const [result] = await db.query(
        `INSERT INTO gallery_categories (name, slug, sort_order, is_active)
     VALUES (?, ?, ?, ?)`,
        [data.name, data.slug, data.sort_order || 0, data.is_active !== false]
    );
    return result.insertId;
}

async function getItems() {
    const [rows] = await db.query(
        `SELECT gi.*, gc.name AS category_name
     FROM gallery_items gi
     LEFT JOIN gallery_categories gc ON gi.category_id = gc.id
     ORDER BY gi.sort_order ASC, gi.id DESC`
    );
    return rows;
}

async function createItem(data) {
    const [result] = await db.query(
        `INSERT INTO gallery_items
     (category_id, title, description, image_url, sort_order, is_active)
     VALUES (?, ?, ?, ?, ?, ?)`,
        [
            data.category_id || null,
            data.title,
            data.description,
            data.image_url,
            data.sort_order || 0,
            data.is_active !== false
        ]
    );
    return result.insertId;
}

async function updateItem(id, data) {
    await db.query(
        `UPDATE gallery_items SET
      category_id = ?,
      title = ?,
      description = ?,
      image_url = ?,
      sort_order = ?,
      is_active = ?
     WHERE id = ?`,
        [
            data.category_id || null,
            data.title,
            data.description,
            data.image_url,
            data.sort_order || 0,
            data.is_active !== false,
            id
        ]
    );
}

async function toggleItem(id, isActive) {
    await db.query(
        "UPDATE gallery_items SET is_active = ? WHERE id = ?",
        [isActive, id]
    );
}

async function deleteItem(id) {
    await db.query("DELETE FROM gallery_items WHERE id = ?", [id]);
}

async function updateCategory(id, data) {
    await db.query(
        `UPDATE gallery_categories
     SET name = ?,
         slug = ?,
         sort_order = ?,
         is_active = ?
     WHERE id = ?`,
        [
            data.name,
            data.slug,
            data.sort_order || 0,
            data.is_active !== false,
            id
        ]
    );
}

async function deleteCategory(id) {
    await db.query(
        "DELETE FROM gallery_categories WHERE id = ?",
        [id]
    );
}

module.exports = {
    getCategories,
    createCategory,
    getItems,
    createItem,
    updateItem,
    toggleItem,
    deleteItem,
    updateCategory,
    deleteCategory
};

