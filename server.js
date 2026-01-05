const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Import configuration and models
const connectDB = require('./config/db');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Keep-alive route for Render and Cron-job.org
app.get('/', (req, res) => {
    res.status(200).send('Bot is Online and Spying! 🕵️');
});

// Import and start the Discord bot (this will handle all Discord events)
require('./bot');
require('./ghostMonitor');

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'production' ? {} : err
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`MongoDB connected and ready to use`);
});

module.exports = app;