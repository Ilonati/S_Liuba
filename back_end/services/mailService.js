require("dotenv").config();
const nodemailer = require("nodemailer");
const db = require("../db");

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: process.env.MAIL_SECURE === "true",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

async function logEmail(recipientEmail, subject, status, errorMessage = null) {
    await db.query(
        `INSERT INTO email_logs
     (recipient_email, subject, status)
     VALUES (?, ?, ?)`,
        [
            recipientEmail,
            subject,
            errorMessage ? `${status}: ${errorMessage}` : status
        ]
    );
}

function formatFrenchDate(dateValue) {
    const date = new Date(dateValue);

    return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

function formatFrenchTime(timeValue) {
    if (!timeValue) return "-";
    return timeValue.toString().slice(0, 5).replace(":", "h");
}

function formatAppointmentDetails(appointment) {
    const formattedDate = formatFrenchDate(appointment.appointment_date);
    const formattedTime = formatFrenchTime(appointment.appointment_time);
    const duration = Number(appointment.duration_minutes || 60);

    let durationText = "";

    if (duration >= 60) {
        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;

        durationText =
            minutes > 0
                ? `${hours} h ${minutes}`
                : `${hours} h`;
    } else {
        durationText = `${duration} min`;
    }

    return `
Nom: ${appointment.client_name}
Email: ${appointment.client_email}
Téléphone: ${appointment.client_phone || "-"}
Prestation: ${appointment.service_title}
Date: ${formattedDate} à ${formattedTime}
Durée: ${durationText}
Notes: ${appointment.notes || "-"}
`;
}

function appointmentHtmlTemplate({ title, intro, appointment, reason = null }) {
    const formattedDate = formatFrenchDate(appointment.appointment_date);
    const formattedTime = formatFrenchTime(appointment.appointment_time);
    const duration = Number(appointment.duration_minutes || 60);

    let durationText = "";

    if (duration >= 60) {
        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;

        durationText =
            minutes > 0
                ? `${hours} h ${minutes}`
                : `${hours} h`;
    } else {
        durationText = `${duration} min`;
    }

    return `
        <div style="font-family:Arial,sans-serif;background:#f7f3ef;padding:30px;">
            <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,0.08);">

                <div style="background:#b68c5a;color:#ffffff;padding:24px;text-align:center;">
                    <img
                        src="https://s-liuba.onrender.com/images/Logo_S_Luba.png"
                        alt="S.Liuba Institut Beauté"
                        style="display:block;margin:0 auto 15px auto;max-width:120px;height:auto;"
                    >

                    <h1 style="margin:0;color:#ffffff;font-size:26px;">
                        Institut S Liuba
                    </h1>
                </div>

                <div style="padding:28px;color:#333333;">
                    <h2 style="color:#2c2c2c;margin-top:0;">
                        ${title}
                    </h2>

                    <p style="font-size:16px;color:#444444;">
                        Bonjour ${appointment.client_name},
                    </p>

                    <p style="font-size:16px;color:#444444;">
                        ${intro}
                    </p>

                    ${reason
            ? `<p style="background:#fff3cd;padding:12px;border-radius:8px;color:#856404;">
                                <strong>Raison:</strong> ${reason}
                               </p>`
            : ""
        }

                    <div style="background:#f7f3ef;padding:18px;border-radius:12px;margin:22px 0;color:#333333;">
                        <p style="margin:8px 0;color:#333333;"><strong>Prestation:</strong> ${appointment.service_title}</p>
                        <p style="margin:8px 0;color:#333333;"><strong>Date:</strong> ${formattedDate}</p>
                        <p style="margin:8px 0;color:#333333;"><strong>Heure:</strong> ${formattedTime}</p>
                        <p style="margin:8px 0;color:#333333;">
    <strong>Durée:</strong>
    ${durationText}
</p>
                        <p style="margin:8px 0;color:#333333;"><strong>Téléphone:</strong> ${appointment.client_phone || "-"}</p>
                        <p style="margin:8px 0;color:#333333;"><strong>Notes:</strong> ${appointment.notes || "-"}</p>
                    </div>

                    <p style="font-size:15px;color:#555555;">
                        Merci,<br>
                        <strong>Institut S Liuba</strong>
                    </p>
                </div>

                <div style="background:#eeeeee;padding:16px;text-align:center;color:#777777;font-size:13px;">
                    Cet email a été envoyé automatiquement.
                </div>

            </div>
        </div>
    `;
}

async function sendMail({ to, subject, text, html }) {
    try {
        await transporter.sendMail({
            from: `"Institut S Liuba" <${process.env.MAIL_USER}>`,
            to,
            subject,
            text,
            html
        });

        await logEmail(to, subject, "sent");
    } catch (error) {
        console.error("Email error:", error.message);
        await logEmail(to, subject, "failed", error.message);
    }
}

async function sendAppointmentCreatedEmails(appointment) {
    const clientSubject = "Confirmation de votre rendez-vous - Institut S Liuba";
    const adminSubject = "Nouveau rendez-vous réservé";

    const details = formatAppointmentDetails(appointment);

    await sendMail({
        to: appointment.client_email,
        subject: clientSubject,
        text: `Bonjour ${appointment.client_name},

Votre rendez-vous est bien confirmé.

${details}

Merci,
Institut S Liuba`,
        html: appointmentHtmlTemplate({
            title: "Votre rendez-vous est confirmé",
            intro: "Votre rendez-vous est bien confirmé.",
            appointment
        })
    });

    await sendMail({
        to: process.env.ADMIN_EMAIL,
        subject: adminSubject,
        text: `Un nouveau rendez-vous a été réservé.

${details}`,
        html: adminAppointmentTemplate(appointment)
    });
}

async function sendAppointmentUpdatedEmails(appointment) {
    const subject = "Modification de votre rendez-vous - Institut S Liuba";
    const details = formatAppointmentDetails(appointment);

    await sendMail({
        to: appointment.client_email,
        subject,
        text: `Bonjour ${appointment.client_name},

Votre rendez-vous a été modifié.

${details}

Merci,
Institut S Liuba`,
        html: appointmentHtmlTemplate({
            title: "Votre rendez-vous a été modifié",
            intro: "Votre rendez-vous a été modifié.",
            appointment
        })
    });

    await sendMail({
        to: process.env.ADMIN_EMAIL,
        subject: "Rendez-vous modifié",
        text: `Un rendez-vous a été modifié.

${details}`,
        html: appointmentHtmlTemplate({
            title: "Rendez-vous modifié",
            intro: "Un rendez-vous a été modifié.",
            appointment
        })
    });
}

async function sendAppointmentCancelledEmails(appointment, reason) {
    const details = formatAppointmentDetails(appointment);

    await sendMail({
        to: appointment.client_email,
        subject: "Annulation de votre rendez-vous - Institut S Liuba",
        text: `Bonjour ${appointment.client_name},

Votre rendez-vous a été annulé.

Raison: ${reason || "-"}

${details}

Merci,
Institut S Liuba`,
        html: appointmentHtmlTemplate({
            title: "Votre rendez-vous a été annulé",
            intro: "Votre rendez-vous a été annulé.",
            appointment,
            reason
        })
    });

    await sendMail({
        to: process.env.ADMIN_EMAIL,
        subject: "Rendez-vous annulé",
        text: `Un rendez-vous a été annulé.

Raison: ${reason || "-"}

${details}`,
        html: appointmentHtmlTemplate({
            title: "Rendez-vous annulé",
            intro: "Un rendez-vous a été annulé.",
            appointment,
            reason
        })
    });
}

async function sendContactMessageToAdmin(data) {
    const subject = data.subject || "Nouveau message de contact";

    const text = `
Nouveau message reçu depuis le site.

Nom: ${data.name}
Email: ${data.email}
Téléphone: ${data.phone || "-"}
Sujet: ${data.subject || "-"}
Message:
${data.message}
`;

    const html = `
  <div style="font-family: Arial, sans-serif; background:#f7f3ef; padding:30px;">
    <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:14px; overflow:hidden;">
      <div style="background:#b68c5a; color:#ffffff; padding:24px; text-align:center;">
        <h1 style="margin:0;">Institut S Liuba</h1>
        <p style="margin:8px 0 0;">Nouveau message de contact</p>
      </div>

      <div style="padding:28px;">
        <p><strong>Nom:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Téléphone:</strong> ${data.phone || "-"}</p>
        <p><strong>Sujet:</strong> ${data.subject || "-"}</p>

        <div style="background:#f7f3ef; padding:18px; border-radius:12px; margin-top:20px;">
          <strong>Message:</strong>
          <p>${data.message}</p>
        </div>
      </div>
    </div>
  </div>
  `;

    await sendMail({
        to: process.env.ADMIN_EMAIL,
        subject,
        text,
        html
    });
}
async function sendReviewRequestEmail(appointment) {
    const reviewUrl = process.env.GOOGLE_REVIEW_URL;

    if (!reviewUrl) {
        console.log("GOOGLE_REVIEW_URL manquant");
        return;
    }

    await sendMail({
        to: appointment.client_email,
        subject: "Merci pour votre visite - Institut S Liuba",
        text: `Bonjour ${appointment.client_name},

Merci pour votre visite à l'Institut S Liuba.

Si vous avez apprécié votre expérience, vous pouvez laisser un avis Google ici :
${reviewUrl}

Votre avis compte beaucoup pour nous.

Merci,
Institut S Liuba`,
        html: `
            <div style="font-family:Arial,sans-serif;background:#f7f3ef;padding:30px;">
                <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:14px;overflow:hidden;">

                    <div style="background:#b68c5a;color:#ffffff;padding:24px;text-align:center;">
                        <img
                            src="https://s-liuba.onrender.com/images/Logo_S_Luba.png"
                            alt="S.Liuba Institut Beauté"
                            style="display:block;margin:0 auto 15px auto;max-width:120px;height:auto;"
                        >

                        <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;">
                            Merci pour votre visite
                        </h1>
                    </div>

                    <div style="padding:28px;color:#333;">
                        <p>Bonjour ${appointment.client_name},</p>

                        <p>Merci pour votre visite à l'Institut S.Liuba.</p>

                        <p>
                            Si vous avez apprécié votre expérience,
                            votre avis Google nous aiderait énormément.
                        </p>

                        <div style="text-align:center;margin:30px 0;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0"
                                   style="margin:0 auto;width:100%;max-width:280px;">
                                <tr>
                                    <td align="center" style="background:#b68c5a;border-radius:999px;">
                                        <a href="${reviewUrl}"
                                           target="_blank"
                                           style="
                                                display:block;
                                                width:100%;
                                                box-sizing:border-box;
                                                padding:16px 20px;
                                                color:#ffffff;
                                                text-decoration:none;
                                                font-weight:700;
                                                font-size:16px;
                                                line-height:20px;
                                                text-align:center;
                                                border-radius:999px;
                                                font-family:Arial,sans-serif;
                                           ">
                                            ⭐ Laisser un avis Google
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </div>

                        <p>Merci beaucoup pour votre confiance.</p>

                        <p>
                            À bientôt,<br>
                            <strong>S.Liuba Institut Beauté</strong>
                        </p>
                    </div>

                </div>
            </div>
        `
    });
}

async function sendAdminPasswordResetEmail(email, resetLink) {
    await sendMail({
        to: email,
        subject: "Réinitialisation du mot de passe - Institut S Liuba",
        text: `Bonjour,

Vous avez demandé la réinitialisation de votre mot de passe administrateur.

Cliquez sur ce lien pour créer un nouveau mot de passe :
${resetLink}

Ce lien est valable pendant 30 minutes.

Si vous n'avez pas demandé cette action, ignorez cet email.

Institut S Liuba`,
        html: `
            <div style="font-family:Arial,sans-serif;background:#f7f3ef;padding:30px;">
                <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:14px;overflow:hidden;">
                    <div style="background:#b68c5a;color:#ffffff;padding:24px;text-align:center;">
                        <img
                            src="https://s-liuba.onrender.com/images/Logo_S_Luba.png"
                            alt="S.Liuba Institut Beauté"
                            style="display:block;margin:0 auto 15px auto;max-width:120px;height:auto;"
                        >
                        <h1 style="margin:0;color:#ffffff;">
                            Réinitialisation du mot de passe
                        </h1>
                    </div>

                    <div style="padding:28px;color:#333333;">
                        <p>Bonjour,</p>

                        <p>
                            Vous avez demandé la réinitialisation de votre mot de passe administrateur.
                        </p>

                        <div style="text-align:center;margin:30px 0;">
                            <a href="${resetLink}"
                               target="_blank"
                               style="
                                    display:inline-block;
                                    padding:14px 22px;
                                    background:#b68c5a;
                                    color:#ffffff;
                                    text-decoration:none;
                                    border-radius:999px;
                                    font-weight:bold;
                               ">
                                Créer un nouveau mot de passe
                            </a>
                        </div>

                        <p>
                            Ce lien est valable pendant 30 minutes.
                        </p>

                        <p>
                            Si vous n'avez pas demandé cette action,
                            vous pouvez ignorer cet email.
                        </p>

                        <p>
                            Merci,<br>
                            <strong>Institut S Liuba</strong>
                        </p>
                    </div>
                </div>
            </div>
        `
    });
}

async function sendAppointmentReminderEmail(appointment) {
    const formattedDate = formatFrenchDate(appointment.appointment_date);
    const formattedTime = formatFrenchTime(appointment.appointment_time);

    await sendMail({
        to: appointment.client_email,
        subject: "Rappel de votre rendez-vous - Institut S Liuba",
        text: `Bonjour ${appointment.client_name},

Nous vous rappelons votre rendez-vous prévu demain.

Prestation: ${appointment.service_title}
Date: ${formattedDate}
Heure: ${formattedTime}

À bientôt,
Institut S Liuba`,
        html: appointmentHtmlTemplate({
            title: "Rappel de votre rendez-vous",
            intro: "Nous vous rappelons votre rendez-vous prévu demain.",
            appointment
        })
    });
}
function adminAppointmentTemplate(appointment) {

    const formattedDate =
        formatFrenchDate(appointment.appointment_date);

    const formattedTime =
        formatFrenchTime(appointment.appointment_time);

    const [firstName, ...rest] =
        (appointment.client_name || "").split(" ");

    const lastName = rest.join(" ");
    const duration = Number(appointment.duration_minutes || 60);

    let durationText = "";

    if (duration >= 60) {
        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;

        durationText =
            minutes > 0
                ? `${hours} h ${minutes}`
                : `${hours} h`;
    } else {
        durationText = `${duration} min`;
    }

    return `
    <div style="
        font-family:Arial,sans-serif;
        background:#f7f3ef;
        padding:30px;
    ">

        <div style="
            max-width:700px;
            margin:auto;
            background:#ffffff;
            border-radius:16px;
            overflow:hidden;
            box-shadow:0 4px 14px rgba(0,0,0,.08);
        ">

            <div style="
                background:#b68c5a;
                color:white;
                padding:24px;
                text-align:center;
            ">
                <img
                    src="https://s-liuba.onrender.com/images/Logo_S_Luba.png"
                    style="
                        max-width:110px;
                        display:block;
                        margin:0 auto 15px;
                    "
                >

                <h2 style="margin:0;color:white;">
                    Nouveau rendez-vous réservé
                </h2>
            </div>

            <div style="padding:30px;">

                <p>
                    <strong>Date et heure du RDV :</strong><br>
                    ${formattedDate} à ${formattedTime}
                </p>

                <hr style="border:none;border-top:1px solid #eee;">

                <p><strong>Nom :</strong> ${lastName || "-"}</p>

                <p><strong>Prénom :</strong> ${firstName || "-"}</p>

                <p>
                    <strong>Email :</strong>
                    <a href="mailto:${appointment.client_email}">
                        ${appointment.client_email}
                    </a>
                </p>

                <p>
                    <strong>Téléphone :</strong>
                    ${appointment.client_phone || "-"}
                </p>

                <hr style="border:none;border-top:1px solid #eee;">

                <div style="
                    background:#f7f3ef;
                    padding:20px;
                    border-radius:12px;
                ">

                    <p>
                        <strong>Prestation :</strong><br>
                        ${appointment.service_title}
                    </p>

                    <p>
    <strong>Durée :</strong>
    ${durationText}
</p>

                    <p>
                        <strong>Notes :</strong>
                        ${appointment.notes || "-"}
                    </p>

                </div>

            </div>

        </div>

    </div>
    `;
}
module.exports = {
    sendAppointmentCreatedEmails,
    sendAppointmentUpdatedEmails,
    sendAppointmentCancelledEmails,
    sendContactMessageToAdmin,
    sendReviewRequestEmail,
    sendAdminPasswordResetEmail,
    sendAppointmentReminderEmail
};