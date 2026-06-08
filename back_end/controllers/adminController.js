const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const adminRepository = require("../repository/adminRepository");

async function login(req, res) {
    try {
        const { email, password } = req.body;

        const admin = await adminRepository.findAdminByEmail(email);

        if (!admin) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect" });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect" });
        }

        const token = jwt.sign(
            {
                id: admin.id,
                email: admin.email,
                role: admin.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            message: "Connexion réussie",
            token,
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function me(req, res) {
    res.json({
        admin: req.admin
    });
}

module.exports = {
    login,
    me
};
async function changePassword(req, res) {
    try {

        const { oldPassword, newPassword } = req.body;

        const admin = await adminRepository.findAdminByEmail(
            req.admin.email
        );

        const isValid = await bcrypt.compare(
            oldPassword,
            admin.password_hash
        );

        if (!isValid) {
            return res.status(400).json({
                message: "Ancien mot de passe incorrect"
            });
        }

        const newHash = await bcrypt.hash(
            newPassword,
            10
        );

        const db = require("../db");

        await db.query(
            `UPDATE admins
       SET password_hash = ?
       WHERE id = ?`,
            [newHash, admin.id]
        );

        res.json({
            message: "Mot de passe modifié"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Erreur serveur"
        });

    }
}
module.exports = {
    login,
    me,
    changePassword
};