require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/database');

// Import routes
const authRoutes = require('./src/routes/auth');
const adminRoutes = require('./src/routes/admin');
const treeRoutes = require('./src/routes/tree');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'https://ivamax-frontend.vercel.app',
    'http://192.168.1.3:5173'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://192.168.')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tree', treeRoutes);
app.use('/api/dashboard', require('./src/routes/dashboard'));
app.use('/api/deposit', require('./src/routes/deposit'));
app.use('/api/income', require('./src/routes/income'));
app.use('/api/withdrawal', require('./src/routes/withdrawal'));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'IVAMAX API is running' });
});

// Root route
app.get('/', (req, res) => {
    res.json({ status: 'OK', message: 'IVAMAX API Backend is running successfully' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
