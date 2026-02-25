//GHOSTMONITOR.JS - UPDATED WITH RECONNECTION HANDLING

const { Client } = require('discord.js-selfbot-v13');
const mainBot = require('./bot'); 
require('dotenv').config();

const ghostClient = new Client({ checkUpdate: false });

// ============================================
// CONNECTION STATUS TRACKING
// ============================================
let ghostStatus = {
    isConnected: false,
    lastDisconnect: null,
    reconnectAttempts: 0,
    totalAlertsToday: 0,
    lastAlertTime: null
};

// LIST ALL SERVERS TO WATCH
const TARGET_SERVER_IDS = [
     '1426294982179815567', // Trading Profit Path
    '1099387609064673392', // Crystal Academy
    '1333948213589180476', // Lucid Trading
    '1454163702973468899', // liannawells's server
    '1432728569997688854',
    '783160857139740713',
    '922409529222770689',
    '724302556020342874',
    '697936741117460640',
    '741759573244772393',
    '449198875505590272',
    '1255896514618720370',
    '978662428655104010',
    '1006237207121641555',
    '827770781773201429',
    '813589894172770336',
    '1208466980596752446',
    '1185296072906653696',
    '896020115290746940',
    '970851308334620692',
    '1042189561478008943',
    '748556589333741568',
    '1084692903714107453',
    '879539609908953098',
    '750972781750911036',
    '1085603142625927190',
    '1335140845870911552',
    '1244040902117167174',
    '818483735241687142',
    '795445353012265011',
    '1227595470982086676',
];

const ALERT_CHANNEL_ID = '1455976915717325017';

// ============================================
// READY EVENT
// ============================================
ghostClient.on('ready', () => {
    console.log('===========================================');
    console.log('✅ GHOST BOT READY EVENT FIRED');
    console.log('===========================================');
    console.log(`✅ SPY ACTIVE: ${ghostClient.user.tag}`);
    console.log(`User ID: ${ghostClient.user.id}`);
    console.log(`Watching ${ghostClient.guilds.cache.size} servers total`);
    console.log(`Target servers to monitor: ${TARGET_SERVER_IDS.length}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    
    ghostStatus.isConnected = true;
    ghostStatus.reconnectAttempts = 0;
    
    // Log which target servers we're actually in
    let foundServers = 0;
    TARGET_SERVER_IDS.forEach(serverId => {
        const guild = ghostClient.guilds.cache.get(serverId);
        if (guild) {
            console.log(`  ✅ Monitoring: ${guild.name} (ID: ${serverId})`);
            foundServers++;
        } else {
            console.log(`  ⚠️ Not in server: ${serverId}`);
        }
    });
    console.log(`Found ${foundServers}/${TARGET_SERVER_IDS.length} target servers`);
});

// ============================================
// ERROR HANDLING EVENTS
// ============================================
ghostClient.on('error', error => {
    console.error('===========================================');
    console.error('❌ GHOST CLIENT ERROR');
    console.error('===========================================');
    console.error('Error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Timestamp:', new Date().toISOString());
    
    // Check if this is a user account ban/restriction
    if (error.message && error.message.includes('401')) {
        console.error('⚠️⚠️⚠️ WARNING: 401 ERROR - POSSIBLE ACCOUNT BAN/RESTRICTION ⚠️⚠️⚠️');
        console.error('Your user account may have been flagged by Discord for self-bot activity');
    }
});

ghostClient.on('warn', info => {
    console.warn('===========================================');
    console.warn('⚠️ GHOST CLIENT WARNING');
    console.warn('===========================================');
    console.warn('Warning:', info);
    console.warn('Timestamp:', new Date().toISOString());
});

// ============================================
// RECONNECTION EVENTS
// ============================================
ghostClient.on('shardDisconnect', (event, id) => {
    console.warn('===========================================');
    console.warn(`⚠️ GHOST SHARD ${id} DISCONNECTED`);
    console.warn('===========================================');
    console.warn('Disconnect event:', event);
    console.warn('Close code:', event.code);
    console.warn('Reason:', event.reason);
    console.warn('Timestamp:', new Date().toISOString());
    
    ghostStatus.isConnected = false;
    ghostStatus.lastDisconnect = new Date().toISOString();
    
    // Log specific disconnect codes
    if (event.code === 4004) {
        console.error('⚠️⚠️⚠️ AUTHENTICATION FAILED - TOKEN MAY BE INVALID ⚠️⚠️⚠️');
    } else if (event.code === 1000) {
        console.log('Normal disconnect (code 1000)');
    } else if (event.code === 1001) {
        console.log('Going away disconnect (code 1001)');
    }
});

ghostClient.on('shardReconnecting', (id) => {
    console.log('===========================================');
    console.log(`🔄 GHOST SHARD ${id} RECONNECTING...`);
    console.log('===========================================');
    console.log('Timestamp:', new Date().toISOString());
    
    ghostStatus.reconnectAttempts++;
    console.log(`Reconnect attempt #${ghostStatus.reconnectAttempts}`);
});

ghostClient.on('shardReady', (id) => {
    console.log('===========================================');
    console.log(`✅ GHOST SHARD ${id} READY`);
    console.log('===========================================');
    console.log('Timestamp:', new Date().toISOString());
});

ghostClient.on('shardResume', (id, replayedEvents) => {
    console.log('===========================================');
    console.log(`🔄 GHOST SHARD ${id} RESUMED`);
    console.log('===========================================');
    console.log(`Replayed ${replayedEvents} events`);
    console.log('Timestamp:', new Date().toISOString());
    
    ghostStatus.isConnected = true;
});

ghostClient.on('disconnect', () => {
    console.warn('===========================================');
    console.warn('⚠️ GHOST CLIENT DISCONNECTED');
    console.warn('===========================================');
    console.warn('Timestamp:', new Date().toISOString());
    
    ghostStatus.isConnected = false;
    ghostStatus.lastDisconnect = new Date().toISOString();
});

// ============================================
// RATE LIMIT HANDLING
// ============================================
ghostClient.on('rateLimit', (rateLimitData) => {
    console.warn('===========================================');
    console.warn('⚠️ GHOST BOT RATE LIMIT HIT');
    console.warn('===========================================');
    console.warn('Timeout:', rateLimitData.timeout, 'ms');
    console.warn('Limit:', rateLimitData.limit);
    console.warn('Method:', rateLimitData.method);
    console.warn('Path:', rateLimitData.path);
    console.warn('Timestamp:', new Date().toISOString());
    console.warn('⚠️ User accounts have stricter rate limits than bot accounts!');
});

// ============================================
// MEMBER JOIN DETECTION
// ============================================
/**
 * Detect when a user joins any of the monitored servers.
 * This event fires regardless of whether welcome messages are enabled.
 */
ghostClient.on('guildMemberAdd', async (member) => {
    if (TARGET_SERVER_IDS.includes(member.guild.id)) {
        console.log('===========================================');
        console.log('🚨 GHOST BOT DETECTED MEMBER JOIN');
        console.log('===========================================');
        console.log(`User: ${member.user.username}`);
        console.log(`Server: ${member.guild.name}`);
        console.log(`Server ID: ${member.guild.id}`);
        console.log(`Timestamp: ${new Date().toISOString()}`);
        
        await sendAlert(member.user.username, member.guild.name, "Member Event");
    }
});

// ============================================
// SHARED ALERT FUNCTION
// ============================================
async function sendAlert(username, serverName, method) {
    try {
        console.log(`🚨 Join detected via ${method}: ${username} in ${serverName}`);
        console.log(`Attempting to send alert to channel: ${ALERT_CHANNEL_ID}`);
        
        const alertChannel = await mainBot.channels.fetch(ALERT_CHANNEL_ID);
        
        if (!alertChannel) {
            console.error(`❌ Could not find alert channel: ${ALERT_CHANNEL_ID}`);
            return;
        }
        
        await alertChannel.send({ 
            content: `🚨 **Alert**: User **${username}** joined the server: **${serverName}**\n*Detected at: ${new Date().toISOString()}*` 
        });
        
        ghostStatus.totalAlertsToday++;
        ghostStatus.lastAlertTime = new Date().toISOString();
        
        console.log(`✅ Alert sent successfully! Total alerts today: ${ghostStatus.totalAlertsToday}`);
        
    } catch (error) {
        console.error("===========================================");
        console.error("❌ ALERT ERROR");
        console.error("===========================================");
        console.error("Error message:", error.message);
        console.error("Error code:", error.code);
        console.error("Full error:", error);
        console.error("Timestamp:", new Date().toISOString());
    }
}

// ============================================
// LOGIN
// ============================================
const ghostToken = process.env.GHOST_TOKEN;

console.log('===============================================');
console.log('GHOST BOT LOGIN ATTEMPT');
console.log('===============================================');
console.log('Ghost token exists:', !!ghostToken);
console.log('Ghost token length:', ghostToken ? ghostToken.length : 0);
console.log('Ghost token preview:', ghostToken ? `${ghostToken.substring(0, 30)}...` : 'N/A');
console.log('Timestamp:', new Date().toISOString());

console.log('');
console.log('⚠️⚠️⚠️ WARNING ⚠️⚠️⚠️');
console.log('This bot is using a USER TOKEN (self-bot)');
console.log('This violates Discord Terms of Service');
console.log('Your account may be banned or restricted');
console.log('Consider using a proper bot token instead');
console.log('⚠️⚠️⚠️ WARNING ⚠️⚠️⚠️');
console.log('');

if (!ghostToken) {
    console.error('❌ GHOST_TOKEN environment variable is missing!');
    console.error('Ghost monitor will not be active.');
    console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('GHOST') || k.includes('TOKEN')));
    // Don't exit - let main bot continue working
} else {
    // Add a timeout to detect hanging connections
    const loginTimeout = setTimeout(() => {
        console.error('===========================================');
        console.error('⏱️ GHOST BOT LOGIN TIMEOUT');
        console.error('===========================================');
        console.error('No response after 120 seconds');
        console.error('This may indicate:');
        console.error('  - Network connectivity issues');
        console.error('  - Discord API problems');
        console.error('  - Invalid or banned user token');
        console.error('  - Discord detecting self-bot activity');
        console.error('Timestamp:', new Date().toISOString());
        console.error('');
        console.error('The ghost bot will continue attempting to connect...');
    }, 120000); // 120 second timeout

    ghostClient.login(ghostToken)
        .then(() => {
            clearTimeout(loginTimeout);
            console.log('===========================================');
            console.log('✅ GHOST BOT LOGIN PROMISE RESOLVED');
            console.log('===========================================');
            console.log('Timestamp:', new Date().toISOString());
        })
        .catch(error => {
            clearTimeout(loginTimeout);
            console.error('===========================================');
            console.error('❌ GHOST BOT LOGIN FAILED!');
            console.error('===========================================');
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Error code:', error.code);
            console.error('Full error:', JSON.stringify(error, null, 2));
            console.error('Timestamp:', new Date().toISOString());
            console.error('');
            console.error('POSSIBLE CAUSES:');
            console.error('1. Invalid user token');
            console.error('2. Account has been banned/restricted by Discord');
            console.error('3. Token has expired (user changed password)');
            console.error('4. Discord detected self-bot activity');
            console.error('');
            // Don't exit - let main bot continue
        });
}

// ============================================
// CONNECTION STATUS LOGGER
// ============================================
setInterval(() => {
    console.log('===========================================');
    console.log('📊 GHOST BOT STATUS CHECK');
    console.log('===========================================');
    console.log('Timestamp:', new Date().toISOString());
    
    if (ghostClient.ws) {
        console.log('WebSocket Status:', ghostClient.ws.status);
        console.log('Ping:', ghostClient.ws.ping, 'ms');
    } else {
        console.log('WebSocket: Not initialized');
    }
    
    console.log('Is Connected:', ghostStatus.isConnected);
    console.log('Reconnect Attempts:', ghostStatus.reconnectAttempts);
    console.log('Alerts Sent Today:', ghostStatus.totalAlertsToday);
    
    if (ghostStatus.lastDisconnect) {
        console.log('Last Disconnect:', ghostStatus.lastDisconnect);
    }
    if (ghostStatus.lastAlertTime) {
        console.log('Last Alert:', ghostStatus.lastAlertTime);
    }
    
    if (ghostClient.guilds) {
        console.log('Guilds:', ghostClient.guilds.cache.size);
    }
}, 120000); // Every 2 minutes

// Reset daily alert counter at midnight
setInterval(() => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
        console.log('🔄 Resetting daily alert counter');
        ghostStatus.totalAlertsToday = 0;
    }
}, 60000); // Check every minute

module.exports = ghostClient;