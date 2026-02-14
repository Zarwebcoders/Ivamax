const nodemailer = require('nodemailer');

/**
 * Send an email using SMTP settings from environment variables
 * @param {Object} options - { email, subject, message, html }
 */
const sendEmail = async (options) => {
    try {
        console.log(`[DEBUG] EMAIL_USER: ${process.env.EMAIL_USER}`);
        console.log(`[DEBUG] EMAIL_HOST: ${process.env.EMAIL_HOST}`);
        console.log(`[DEBUG] EMAIL_PORT: ${process.env.EMAIL_PORT}`);

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false
            },
            debug: true, // Enable nodemailer debug logs
            logger: true // Log to console
        });

        console.log(`[EMAIL] Attempting to send to ${options.email}...`);

        const mailOptions = {
            from: `"${process.env.FROM_NAME || 'IVAMAX Support'}" <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('[EMAIL] SUCCESS:', info.messageId);
        return info;
    } catch (error) {
        console.error('[EMAIL] FAILED:', error.message);
        console.error('[EMAIL] ERROR DETAILS:', error);
        return null;
    }
};

module.exports = sendEmail;
