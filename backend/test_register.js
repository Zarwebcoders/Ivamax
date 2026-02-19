const API_URL = 'http://localhost:5000/api/auth/register';

async function testRegister() {
    try {
        const randomId = Math.floor(Math.random() * 10000);
        const userData = {
            fullName: 'Test User ' + randomId,
            mobile: '123456' + randomId,
            email: `test${randomId}@example.com`,
            password: 'password123',
            placementSide: 'left' // Optional but good to provide
        };

        console.log('Attempting registration with:', userData);

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (response.ok && data.token) {
            console.log('SUCCESS: Registration worked and returned token.');
            // Try login immediately
            console.log('Now testing login with these credentials...');
            const loginResp = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: data.userId, // Use the returned userId
                    password: 'password123'
                })
            });
            const loginData = await loginResp.json();
            console.log('Login Status:', loginResp.status);
            console.log('Login Response:', JSON.stringify(loginData, null, 2));
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testRegister();
