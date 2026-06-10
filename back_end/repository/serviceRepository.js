const db = require("../db");

async function getAllServices() {
    const [rows] = await db.query(
        "SELECT * FROM services ORDER BY sort_order ASC, id DESC"
    );
    return rows;
}

async function getActiveServices() {
    const [rows] = await db.query(
        "SELECT * FROM services WHERE is_active = true ORDER BY sort_order ASC, id DESC"
    );
    return rows;
}

async function getServiceById(id) {
    const [rows] = await db.query(
        "SELECT * FROM services WHERE id = ? LIMIT 1",
        [id]
    );
    return rows[0];
}

async function createService(data) {
    const [result] = await db.query(
        `INSERT INTO services 
    (title, slug, short_description, full_description, duration_minutes, price, image_url, category, is_popular, is_active, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            data.title,
            data.slug,
            data.short_description,
            data.full_description,
            data.duration_minutes,
            data.price,
            data.image_url,
            data.category,
            data.is_popular || false,
            data.is_active !== false,
            data.sort_order || 0
        ]
    );

    return result.insertId;
}

async function updateService(id, data) {
    await db.query(
        `UPDATE services SET
      title = ?,
      slug = ?,
      short_description = ?,
      full_description = ?,
      duration_minutes = ?,
      price = ?,
      image_url = ?,
      category = ?,
      is_popular = ?,
      is_active = ?,
      sort_order = ?
    WHERE id = ?`,
        [
            data.title,
            data.slug,
            data.short_description,
            data.full_description,
            data.duration_minutes,
            data.price,
            data.image_url,
            data.category,
            data.is_popular || false,
            data.is_active !== false,
            data.sort_order || 0,
            id
        ]
    );
}

async function deleteService(id) {
    await db.query("DELETE FROM services WHERE id = ?", [id]);
}

module.exports = {
    getAllServices,
    getActiveServices,
    getServiceById,
    createService,
    updateService,
    deleteService
};


async function toggleServiceStatus(id, isActive) {
    await db.query(
        `UPDATE services
     SET is_active = ?
     WHERE id = ?`,
        [isActive, id]
    );
}

async function getServiceBySlug(slug) {
    const [rows] = await db.query(
        "SELECT * FROM services WHERE slug = ? AND is_active = true LIMIT 1",
        [slug]
    );

    return rows[0];
}
module.exports = {
    getAllServices,
    getActiveServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
    toggleServiceStatus,
    getServiceBySlug
};