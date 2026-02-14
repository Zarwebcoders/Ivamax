const nodemailer = require('nodemailer');

/**
 * Send an email using SMTP settings from environment variables
 * @param {Object} options - { email, subject, message, html }
 */
const sendEmail = async (options) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: `"${process.env.FROM_NAME || 'IVAMAX Support'}" <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        // We generally don't want to crash the request if email fails, 
        // but for registration we might want to know.
        return null;
    }
};

module.exports = sendEmail;
