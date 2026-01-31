//SERVER.JS

console.log('='.repeat(50));
console.log('SERVER.JS EXECUTION STARTED');
console.log('='.repeat(50));
console.log('Timestamp:', new Date().toISOString());

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

console.log('✅ Express and dotenv loaded');

// Load environment variables
dotenv.config();

console.log('✅ Environment variables loaded');
console.log('Available env vars:', Object.keys(process.env).filter(k => 
    k.includes('DISCORD') || k.includes('MONGO') || k.includes('GHOST') || k.includes('PORT')
));

// Import configuration and models
const connectDB = require('./config/db');
const User = require('./models/User');

console.log('✅ Database config and models loaded');

// Initialize Express app
const app = express();

console.log('✅ Express app initialized');

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log('✅ Middleware configured');

// Keep-alive route for Render and Cron-job.org
app.get('/', (req, res) => {
    res.status(200).send('Bot is Online and Spying! 🕵️');
});

console.log('✅ Routes configured');

// Import and start the Discord bot (this will handle all Discord events)
console.log('About to require ./bot...');
require('./bot');
console.log('✅ Main bot module loaded');

console.log('About to require ./ghostMonitor...');
require('./ghostMonitor');
console.log('✅ Ghost monitor module loaded');

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
    console.log('='.repeat(50));
    console.log(`✅ EXPRESS SERVER LISTENING ON PORT ${PORT}`);
    console.log('='.repeat(50));
});

console.log('✅ Server.js execution completed');

module.exports = app;