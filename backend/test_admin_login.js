

const API_URL = 'http://localhost:5000/api/auth/login';

async function testAdminLogin() {
    try {
        console.log('Attempting login with admin credentials...');
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: 'admin@ivamax.com',
                password: 'Admin@123'
            })
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testAdminLogin();
