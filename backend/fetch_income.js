const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/test/income-check/IVA100003',
    method: 'GET',
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log(JSON.stringify(json.aggregation, null, 2));
        } catch (e) {
            console.log('Error parsing JSON:', e.message);
        }
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.end();
