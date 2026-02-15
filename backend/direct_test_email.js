require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmail = async () => {
    console.log('Starting self-contained test...');

    // Explicitly using the values we want to test
    const host = process.env.EMAIL_HOST;
    const port = process.env.EMAIL_PORT;
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASSWORD;

    console.log(`Config: ${host}:${port} (${user})`);

    try {
        const transporter = nodemailer.createTransport({
            host: host,
            port: port,
            secure: false, // 587 requires secure: false (STARTTLS)
            auth: {
                user: user,
                pass: pass
            },
            tls: {
                rejectUnauthorized: false
            },
            debug: true, // Enable debug output
            logger: true // Log to console
        });

        const info = await transporter.sendMail({
            from: '"Ivamax Test" <support@ivamax.live>',
            to: 'darshanthanki77@gmail.com',
            subject: 'Direct Test 2',
            text: 'Testing spacesmail directly.',
        });

        console.log('Success:', info.messageId);
    } catch (error) {
        console.error('Failed:', error);
    }
};

testEmail();
