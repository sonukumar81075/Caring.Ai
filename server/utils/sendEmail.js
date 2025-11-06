import nodemailer from "nodemailer";

export const sendEmail = async(to, subject, html) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'business140.web-hosting.com',
        port: parseInt(process.env.EMAIL_PORT) || 465,
        secure: true, // true for port 465 (SSL), false for port 587 (TLS)
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false // Accept self-signed certificates
        }
    });

    await transporter.sendMail({
        from: `"Caring AI" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
    });
};