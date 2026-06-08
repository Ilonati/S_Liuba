require("dotenv").config();
const nodemailer = require("nodemailer");

async function testMail() {

    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        secure: process.env.MAIL_SECURE === "true",
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    const info = await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: process.env.MAIL_USER,
        subject: "Test S Liuba",
        text: "Backend email works correctly."
    });

    console.log(info.messageId);
}

testMail().catch(console.error);