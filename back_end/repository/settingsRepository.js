const db = require("../db");

async function getAllSettings() {
    const [rows] = await db.query(
        "SELECT * FROM site_settings ORDER BY setting_key ASC"
    );

    return rows;
}

async function getSettingsObject() {
    const [rows] = await db.query(
        "SELECT setting_key, setting_value FROM site_settings"
    );

    const settings = {};

    rows.forEach((item) => {
        settings[item.setting_key] = item.setting_value;
    });

    return settings;
}

async function upsertSetting(key, value) {
    await db.query(
        `INSERT INTO site_settings (setting_key, setting_value)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [key, value]
    );
}

async function deleteSetting(key) {
    const [result] = await db.query(
        "DELETE FROM site_settings WHERE setting_key = ?",
        [key]
    );

    return result.affectedRows;
}

module.exports = {
    getAllSettings,
    getSettingsObject,
    upsertSetting,
    deleteSetting
};