// const db = require("../db");

// async function findAdminByEmail(email) {
//     const [rows] = await db.query(
//         "SELECT * FROM admins WHERE email = ? LIMIT 1",
//         [email]
//     );

//     return rows[0];
// }

// async function createAdmin({ name, email, passwordHash, role = "admin" }) {
//     const [result] = await db.query(
//         `INSERT INTO admins (name, email, password_hash, role)
//      VALUES (?, ?, ?, ?)`,
//         [name, email, passwordHash, role]
//     );

//     return result.insertId;
// }

// module.exports = {
//     findAdminByEmail,
//     createAdmin
// };
const db = require("../db");

async function findAdminByEmail(email) {
    const [rows] = await db.query(
        "SELECT * FROM admins WHERE email = ? LIMIT 1",
        [email]
    );

    return rows[0];
}

async function findAdminById(id) {
    const [rows] = await db.query(
        "SELECT * FROM admins WHERE id = ? LIMIT 1",
        [id]
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

async function createPasswordResetToken(adminId, tokenHash, expiresAt) {
    const [result] = await db.query(
        `INSERT INTO password_reset_tokens
         (admin_id, token_hash, expires_at)
         VALUES (?, ?, ?)`,
        [adminId, tokenHash, expiresAt]
    );

    return result.insertId;
}

async function findValidPasswordResetToken(tokenHash) {
    const [rows] = await db.query(
        `SELECT *
         FROM password_reset_tokens
         WHERE token_hash = ?
           AND used_at IS NULL
           AND expires_at > NOW()
         LIMIT 1`,
        [tokenHash]
    );

    return rows[0];
}

async function markPasswordResetTokenUsed(id) {
    await db.query(
        `UPDATE password_reset_tokens
         SET used_at = NOW()
         WHERE id = ?`,
        [id]
    );
}

async function updateAdminPassword(adminId, passwordHash) {
    await db.query(
        `UPDATE admins
         SET password_hash = ?
         WHERE id = ?`,
        [passwordHash, adminId]
    );
}

module.exports = {
    findAdminByEmail,
    findAdminById,
    createAdmin,
    createPasswordResetToken,
    findValidPasswordResetToken,
    markPasswordResetTokenUsed,
    updateAdminPassword
};