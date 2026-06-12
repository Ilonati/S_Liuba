
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const adminRepository = require("../repository/adminRepository");
const mailService = require("../services/mailService");

async function login(req, res) {
    try {
        const { email, password } = req.body;

        const admin = await adminRepository.findAdminByEmail(email);

        if (!admin) {
            return res.status(401).json({
                message: "Email ou mot de passe incorrect"
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            admin.password_hash
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Email ou mot de passe incorrect"
            });
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

        res.status(500).json({
            message: "Erreur serveur"
        });
    }
}

async function me(req, res) {
    res.json({
        admin: req.admin
    });
}

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

        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({
                message: "Le mot de passe doit contenir au moins 8 caractères"
            });
        }

        const newHash = await bcrypt.hash(newPassword, 10);

        await adminRepository.updateAdminPassword(
            admin.id,
            newHash
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

async function forgotPassword(req, res) {
    try {
        const { email } = req.body;

        const admin = await adminRepository.findAdminByEmail(email);

        if (!admin) {
            return res.json({
                message: "Si cet email existe, un lien de réinitialisation a été envoyé."
            });
        }

        const rawToken = crypto.randomBytes(32).toString("hex");

        const tokenHash = crypto
            .createHash("sha256")
            .update(rawToken)
            .digest("hex");

        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

        await adminRepository.createPasswordResetToken(
            admin.id,
            tokenHash,
            expiresAt
        );

        const resetLink =
            `${process.env.FRONTEND_URL}/admin/reset-password.html?token=${rawToken}`;

        await mailService.sendAdminPasswordResetEmail(
            admin.email,
            resetLink
        );

        res.json({
            message: "Si cet email existe, un lien de réinitialisation a été envoyé."
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Erreur serveur"
        });
    }
}

async function resetPassword(req, res) {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                message: "Token et nouveau mot de passe obligatoires"
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                message: "Le mot de passe doit contenir au moins 8 caractères"
            });
        }

        const tokenHash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const resetToken =
            await adminRepository.findValidPasswordResetToken(tokenHash);

        if (!resetToken) {
            return res.status(400).json({
                message: "Lien invalide ou expiré"
            });
        }

        const newHash = await bcrypt.hash(newPassword, 10);

        await adminRepository.updateAdminPassword(
            resetToken.admin_id,
            newHash
        );

        await adminRepository.markPasswordResetTokenUsed(
            resetToken.id
        );

        res.json({
            message: "Mot de passe réinitialisé avec succès"
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
    changePassword,
    forgotPassword,
    resetPassword
};