const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Manually load .env
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

// Adjust paths to models
const Income = require('./src/models/Income');

const verifyIncome = async () => {
    try {
        console.log('Connecting to MongoDB...');
        // Remove quotes if present
        const uri = process.env.MONGO_URI ? process.env.MONGO_URI.replace(/"/g, '') : '';

        console.log(`URI found: ${uri ? 'Yes' : 'No'}`);

        await mongoose.connect(uri);
        console.log('Connected!');

        const userId = 'IVA100003';
        console.log(`Checking income for ${userId}...`);

        const incomes = await Income.find({ userId });

        console.log(`\nFound ${incomes.length} income records for ${userId}:`);

        incomes.forEach(inc => {
            console.log(`- Type: "${inc.incomeType}", Amount: ${inc.netAmount}, Status: ${inc.status}, Month: ${inc.month}/${inc.year}`);
        });

        // Aggregation Check
        const agg = await Income.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: '$incomeType',
                    total: { $sum: '$netAmount' }
                }
            }
        ]);
        console.log('\nAggregation Result:', JSON.stringify(agg, null, 2));

        console.log('Done.');
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

verifyIncome();
