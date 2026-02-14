require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmail = async () => {
    console.log('Starting self-contained test...');

    // Explicitly using the values we want to test
    const host = 'mail.spacemail.com';
    const port = 465;
    const user = 'support@ivamax.live';
    const pass = 'Imx@274121'; // Hardcoded to verify, then will revert to env

    console.log(`Config: ${host}:${port} (${user})`);

    try {
        const transporter = nodemailer.createTransport({
            host: host,
            port: port,
            secure: true, // 465 requires secure: true
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
