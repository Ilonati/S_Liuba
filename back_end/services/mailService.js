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

    return `
Nom: ${appointment.client_name}
Email: ${appointment.client_email}
Téléphone: ${appointment.client_phone || "-"}
Prestation: ${appointment.service_title}
Date: ${formattedDate} à ${formattedTime}
Durée: ${appointment.duration_minutes || 60} minutes
Notes: ${appointment.notes || "-"}
`;
}

function appointmentHtmlTemplate({ title, intro, appointment, reason = null }) {
    const formattedDate = formatFrenchDate(appointment.appointment_date);
    const formattedTime = formatFrenchTime(appointment.appointment_time);

    return `
  <div style="font-family: Arial, sans-serif; background:#f7f3ef; padding:30px;">
    <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 4px 14px rgba(0,0,0,0.08);">
      
      <div style="background:#b68c5a; color:#ffffff; padding:24px; text-align:center;">
        <h1 style="margin:0; font-size:26px;">Institut S Liuba</h1>
        <p style="margin:8px 0 0;">Beauté & bien-être</p>
      </div>

      <div style="padding:28px;">
        <h2 style="color:#2c2c2c; margin-top:0;">${title}</h2>

        <p style="font-size:16px; color:#444;">
          Bonjour ${appointment.client_name},
        </p>

        <p style="font-size:16px; color:#444;">
          ${intro}
        </p>

        ${reason
            ? `<p style="background:#fff3cd; padding:12px; border-radius:8px; color:#856404;">
                Raison: ${reason}
              </p>`
            : ""
        }

        <div style="background:#f7f3ef; padding:18px; border-radius:12px; margin:22px 0;">
          <p><strong>Prestation:</strong> ${appointment.service_title}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Heure:</strong> ${formattedTime}</p>
          <p><strong>Durée:</strong> ${appointment.duration_minutes || 60} minutes</p>
          <p><strong>Téléphone:</strong> ${appointment.client_phone || "-"}</p>
          <p><strong>Notes:</strong> ${appointment.notes || "-"}</p>
        </div>

        <p style="font-size:15px; color:#555;">
          Merci,<br>
          <strong>Institut S Liuba</strong>
        </p>
      </div>

      <div style="background:#eeeeee; padding:16px; text-align:center; color:#777; font-size:13px;">
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
        html: appointmentHtmlTemplate({
            title: "Nouveau rendez-vous réservé",
            intro: "Un nouveau rendez-vous a été réservé.",
            appointment
        })
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
module.exports = {
    sendAppointmentCreatedEmails,
    sendAppointmentUpdatedEmails,
    sendAppointmentCancelledEmails,
    sendContactMessageToAdmin
};