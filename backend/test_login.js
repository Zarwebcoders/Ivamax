const API_URL = 'http://localhost:5000/api';

const testLogin = async () => {
    try {
        console.log('1. Testing Health Check...');
        try {
            const health = await fetch(`${API_URL}/health`);
            console.log('   Health Check Status:', health.status);
            if (health.ok) {
                const text = await health.text();
                console.log('   Body:', text);
            }
        } catch (e) {
            console.log('   Health Check Failed:', e.message);
            console.log('   (This implies backend is NOT running on port 5000 or blocked)');
        }

        console.log('\n2. Testing Login (Invalid Creds)...');
        try {
            const login = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: 'IVA_TEST_INVALID',
                    password: 'wrong_password'
                })
            });

            console.log('   Server Response Status:', login.status);
            const data = await login.json();
            console.log('   Server Response Data:', data);

            if (login.status === 401) {
                console.log('   SUCCESS: Server is reachable and rejected invalid creds.');
            }
        } catch (error) {
            console.log('   Network Error during login:', error.message);
        }

    } catch (error) {
        console.error('Unexpected error:', error);
    }
};

testLogin();
