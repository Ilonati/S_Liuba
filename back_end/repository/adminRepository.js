const db = require("../db");

async function findAdminByEmail(email) {
    const [rows] = await db.query(
        "SELECT * FROM admins WHERE email = ? LIMIT 1",
        [email]
    );

    return rows[0];
}

async function createAdmin({ name, email, passwordHash, role = "admin" }) {
    const [result] = await db.query(
        `INSERT INTO admins (name, email, password_hash, role)
     VALUES (?, ?, ?, ?)`,
        [name, email, passwordHash, role]
    );

    return result.insertId;
}

module.exports = {
    findAdminByEmail,
    createAdmin
};
