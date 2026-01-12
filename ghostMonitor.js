const { Client } = require('discord.js-selfbot-v13');
const mainBot = require('./bot'); 
require('dotenv').config();

const ghostClient = new Client({ checkUpdate: false });

// LIST ALL SERVERS TO WATCH
const TARGET_SERVER_IDS = [
    '1426294982179815567', // Trading Profit Path
    '1099387609064673392', // Crystal Academy
    '1333948213589180476', // Lucid Trading
    '1454163702973468899', // liannawells's server
    '1432728569997688854',
    '724302556020342874',
    '697936741117460640',
    '449198875505590272',
    '1255896514618720370',
    '978662428655104010',
    '1316750175930421389',
    '1006237207121641555',
    '827770781773201429',
    '813589894172770336',
    '1208466980596752446',
    '1185296072906653696',
    '896020115290746940',
    '1042189561478008943',
    '748556589333741568',
];

const ALERT_CHANNEL_ID = '1455976915717325017'; 

ghostClient.on('ready', () => {
    console.log(`✅ SPY ACTIVE: ${ghostClient.user.tag}`);
    console.log(`Watching ${ghostClient.guilds.cache.size} servers total.`);
});

/**
 * SCENARIO A: The server has "Welcome Messages" ENABLED.
 * This catches the system message like "User joined the party!"
 */
ghostClient.on('messageCreate', async (message) => {
    if (message.type === 'GUILD_MEMBER_JOIN' && TARGET_SERVER_IDS.includes(message.guild.id)) {
        sendAlert(message.author.username, message.guild.name, "System Message");
    }

    // Manual Test Command
    if (message.content === '!testspy') {
        sendAlert("TEST_USER", message.guild.name, "Manual Test");
    }
});

/**
 * SCENARIO B: The server has "Welcome Messages" DISABLED.
 * This triggers the moment a user hits the 'Join' button, even if no message is sent.
 */
ghostClient.on('guildMemberAdd', async (member) => {
    if (TARGET_SERVER_IDS.includes(member.guild.id)) {
        sendAlert(member.user.username, member.guild.name, "Member Event");
    }
});

// SHARED ALERT FUNCTION (Matches your client's image style)
async function sendAlert(username, serverName, method) {
    try {
        console.log(`🚨 Join detected via ${method}: ${username} in ${serverName}`);
        const alertChannel = await mainBot.channels.fetch(ALERT_CHANNEL_ID);
        if (alertChannel) {
            await alertChannel.send({ 
                content: `Notification: User **${username}** joined the server: **${serverName}**` 
            });
        }
    } catch (error) {
        console.error("Alert Error:", error.message);
    }
}

ghostClient.login(process.env.GHOST_TOKEN);
module.exports = ghostClient;