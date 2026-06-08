require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("./db");

async function createAdmin() {
    try {
        const name = "Admin S Liuba";
        const email = "institut.s.liuba@gmail.com";
        const password = "ChangeMe123!";
        const role = "super_admin";

        const passwordHash = await bcrypt.hash(password, 10);

        const [existingAdmin] = await db.query(
            "SELECT id FROM admins WHERE email = ? LIMIT 1",
            [email]
        );

        if (existingAdmin.length > 0) {
            console.log("Admin already exists");
            process.exit(0);
        }

        await db.query(
            `INSERT INTO admins (name, email, password_hash, role)
       VALUES (?, ?, ?, ?)`,
            [name, email, passwordHash, role]
        );

        console.log("Admin created successfully");
        console.log("Email:", email);
        console.log("Password:", password);

        process.exit(0);
    } catch (error) {
        console.error("Error creating admin:", error);
        process.exit(1);
    }
}

createAdmin();

