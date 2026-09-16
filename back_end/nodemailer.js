require("dotenv").config();
const nodemailer = require("nodemailer");
// const transporter = nodemailer.createTransport({
//     host: process.env.MAIL_HOST,
//     port: Number(process.env.MAIL_PORT),
//     secure: process.env.MAIL_SECURE === "true",
//     auth: {
//         user: process.env.MAIL_USER,
//         pass: process.env.MAIL_PASS
//     }
// });
const transporter = nodemailer.createTransport({
    host: mailHost,
    port: isGmailSmtp ? 465 : Number(process.env.MAIL_PORT),
    secure: isGmailSmtp ? true : process.env.MAIL_SECURE === "true",
    family: 4,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});