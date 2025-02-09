// server/api/contact.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "ssl0.ovh.net",
    port: 587,
    secure: false,
    auth: {
        user: "contact@fabienlubin.fr",
        pass: process.env.SMTP_PASS,
    },
});

export default defineEventHandler(async (event) => {
    try {
        await transporter.verify();
        const body = await readBody(event);

        const emailContent = `
Nouvelle demande de contact :

Nom: ${body.lastName} ${body.firstName}
Email: ${body.email}
Message:
${body.message}
    `;

        const info = await transporter.sendMail({
            from: {
                name: "Portfolio Contact",
                address: "contact@fabienlubin.fr",
            },
            to: "contact@fabienlubin.fr",
            subject: "Nouvelle demande de contact",
            text: emailContent,
            replyTo: body.email,
        });

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Erreur SMTP:", error);
        return { success: false, error: error.message };
    }
});