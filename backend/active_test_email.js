require('dotenv').config();
const sendEmail = require('./src/utils/sendEmail');

const testEmail = async () => {
    console.log('Testing email...');
    console.log('User:', process.env.EMAIL_USER);
    console.log('Host:', process.env.EMAIL_HOST);

    try {
        await sendEmail({
            email: 'darshanthanki77@gmail.com', // The user's likely email or a test one
            subject: 'Test Email from IVAMAX Backend',
            message: 'This is a test email to verify SMTP settings.',
            html: '<h1>Test Email</h1><p>If you see this, SMTP is working!</p>'
        });
        console.log('Test email finished.');
    } catch (error) {
        console.error('Test email failed hard:', error);
    }
};

testEmail();
