//SERVER.JS - UPDATED WITH CONNECTION MONITORING

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

// ============================================
// ROUTES
// ============================================

// Keep-alive route for Render and Cron-job.org
app.get('/', (req, res) => {
    res.status(200).send('Bot is Online and Spying! 🕵️');
});

// Health check endpoint with detailed status
app.get('/health', (req, res) => {
    const mainBot = require('./bot');
    const ghostBot = require('./ghostMonitor');
    
    const status = {
        timestamp: new Date().toISOString(),
        server: 'online',
        mainBot: {
            connected: mainBot.ws && mainBot.ws.status === 0,
            status: mainBot.ws ? mainBot.ws.status : 'not initialized',
            ping: mainBot.ws ? mainBot.ws.ping : null,
            guilds: mainBot.guilds ? mainBot.guilds.cache.size : 0
        },
        ghostBot: {
            connected: ghostBot.ws && ghostBot.ws.status === 0,
            status: ghostBot.ws ? ghostBot.ws.status : 'not initialized',
            ping: ghostBot.ws ? ghostBot.ws.ping : null,
            guilds: ghostBot.guilds ? ghostBot.guilds.cache.size : 0
        }
    };
    
    console.log('Health check requested:', JSON.stringify(status, null, 2));
    res.status(200).json(status);
});

// Status endpoint for monitoring
app.get('/status', (req, res) => {
    const mainBot = require('./bot');
    const ghostBot = require('./ghostMonitor');
    
    res.status(200).json({
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        mainBot: mainBot.ws ? mainBot.ws.status : 'not initialized',
        ghostBot: ghostBot.ws ? ghostBot.ws.status : 'not initialized',
        memory: process.memoryUsage()
    });
});

console.log('✅ Routes configured');

// ============================================
// LOAD DISCORD BOTS
// ============================================

console.log('About to require ./bot...');
require('./bot');
console.log('✅ Main bot module loaded');

console.log('About to require ./ghostMonitor...');
require('./ghostMonitor');
console.log('✅ Ghost monitor module loaded');

// ============================================
// BOT HEARTBEAT MONITOR
// ============================================

let heartbeatCounter = 0;

setInterval(() => {
    heartbeatCounter++;
    
    console.log('');
    console.log('='.repeat(50));
    console.log(`💓 HEARTBEAT #${heartbeatCounter}`);
    console.log('='.repeat(50));
    console.log('Timestamp:', new Date().toISOString());
    console.log('Server uptime:', Math.floor(process.uptime()), 'seconds');
    
    const mainBot = require('./bot');
    const ghostBot = require('./ghostMonitor');
    
    // Main Bot Status
    console.log('');
    console.log('--- MAIN BOT STATUS ---');
    if (mainBot.ws) {
        const wsStatus = mainBot.ws.status;
        const statusNames = ['READY', 'CONNECTING', 'RECONNECTING', 'IDLE', 'NEARLY', 'DISCONNECTED', 'WAITING_FOR_GUILDS', 'IDENTIFYING', 'RESUMING'];
        console.log('WebSocket Status:', wsStatus, `(${statusNames[wsStatus] || 'UNKNOWN'})`);
        console.log('Ping:', mainBot.ws.ping, 'ms');
        console.log('Guilds:', mainBot.guilds ? mainBot.guilds.cache.size : 0);
        
        if (wsStatus === 0) {
            console.log('✅ Main bot is CONNECTED and READY');
        } else if (wsStatus === 1 || wsStatus === 2) {
            console.log('🔄 Main bot is CONNECTING/RECONNECTING');
        } else {
            console.log('⚠️ Main bot connection issue detected!');
        }
    } else {
        console.log('❌ Main bot WebSocket not initialized');
    }
    
    // Ghost Bot Status
    console.log('');
    console.log('--- GHOST BOT STATUS ---');
    if (ghostBot.ws) {
        const wsStatus = ghostBot.ws.status;
        const statusNames = ['READY', 'CONNECTING', 'RECONNECTING', 'IDLE', 'NEARLY', 'DISCONNECTED', 'WAITING_FOR_GUILDS', 'IDENTIFYING', 'RESUMING'];
        console.log('WebSocket Status:', wsStatus, `(${statusNames[wsStatus] || 'UNKNOWN'})`);
        console.log('Ping:', ghostBot.ws.ping, 'ms');
        console.log('Guilds:', ghostBot.guilds ? ghostBot.guilds.cache.size : 0);
        
        if (wsStatus === 0) {
            console.log('✅ Ghost bot is CONNECTED and READY');
        } else if (wsStatus === 1 || wsStatus === 2) {
            console.log('🔄 Ghost bot is CONNECTING/RECONNECTING');
        } else {
            console.log('⚠️ Ghost bot connection issue detected!');
            console.log('⚠️ Remember: User tokens are against Discord ToS and may be banned');
        }
    } else {
        console.log('❌ Ghost bot WebSocket not initialized');
    }
    
    // Memory usage
    console.log('');
    console.log('--- SYSTEM STATUS ---');
    const memUsage = process.memoryUsage();
    console.log('Memory RSS:', Math.round(memUsage.rss / 1024 / 1024), 'MB');
    console.log('Memory Heap Used:', Math.round(memUsage.heapUsed / 1024 / 1024), 'MB');
    
    console.log('='.repeat(50));
    console.log('');
    
}, 180000); // Every 3 minutes

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

app.use((err, req, res, next) => {
    console.error('===========================================');
    console.error('❌ EXPRESS ERROR');
    console.error('===========================================');
    console.error(err.stack);
    console.error('Timestamp:', new Date().toISOString());
    
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

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`✅ EXPRESS SERVER LISTENING ON PORT ${PORT}`);
    console.log('='.repeat(50));
    console.log('Timestamp:', new Date().toISOString());
    console.log('');
    console.log('Available endpoints:');
    console.log(`  GET  /          - Keep-alive endpoint`);
    console.log(`  GET  /health    - Detailed health check`);
    console.log(`  GET  /status    - Quick status check`);
    console.log('');
});

console.log('✅ Server.js execution completed');

module.exports = app;