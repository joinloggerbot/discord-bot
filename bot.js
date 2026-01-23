//DISCORD_BOT.JS

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const connectDB = require('./config/db');
const DiscordServer = require('./models/DiscordServer');
const { sendServerJoinNotification, sendUserJoinNotification } = require('./services/emailService');

// Load environment variables
require('dotenv').config();

// Connect to MongoDB
connectDB();

// Create a new client instance with the necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

// When the client is ready, run this code (only once)
client.once('clientReady', () => {
    console.log(`✅ Bot logged in as ${client.user.tag}!`);
    console.log(`Bot is in ${client.guilds.cache.size} servers`);
    
    // Log all servers the bot is in
    client.guilds.cache.forEach(guild => {
        console.log(`  - ${guild.name} (ID: ${guild.id}) - ${guild.memberCount} members`);
    });
});

// Handle when bot is added to a new server
client.on('guildCreate', async (guild) => {
    console.log(`Bot added to new server: ${guild.name} (ID: ${guild.id})`);

    try {
        // Check if server already exists in database
        const existingServer = await DiscordServer.findOne({ id: guild.id });

        if (existingServer) {
            console.log(`Server ${guild.name} already exists in database`);
            return;
        }

        // Fetch the owner to get their username
        let ownerUsername = 'Unknown';
        try {
            const owner = await guild.fetchOwner();
            ownerUsername = owner.user.tag;
        } catch (error) {
            console.error('Error fetching owner:', error);
        }

        // Create new server document
        const serverData = new DiscordServer({
            id: guild.id,
            name: guild.name,
            memberCount: guild.memberCount,
            owner: {
                id: guild.ownerId,
                username: ownerUsername
            }
        });

        // Save to database
        await serverData.save();
        console.log(`Server "${serverData.name}" information stored in database.`);

        // Send notification email to admin
        const emailSent = await sendServerJoinNotification(
            serverData.name,
            serverData.id,
            serverData.memberCount
        );

        if (emailSent) {
            console.log(`Notification email sent for server: ${serverData.name}`);
        } else {
            console.log(`Failed to send notification email for server: ${serverData.name}`);
        }

    } catch (error) {
        console.error("Error storing server information:", error);
    }
});

// Handle when bot is removed from a server
client.on('guildDelete', async (guild) => {
    console.log(`Bot removed from server: ${guild.name} (ID: ${guild.id})`);

    try {
        // Remove server from database
        await DiscordServer.deleteOne({ id: guild.id });
        console.log(`Server "${guild.name}" removed from database.`);
    } catch (error) {
        console.error("Error removing server information:", error);
    }
});

// Handle when a new member joins the server
client.on('guildMemberAdd', async (member) => {
    try {
        const guild = member.guild;
        
        console.log(`New member joined: ${member.user.tag} in server: ${guild.name}`);

        // Send email notification
        const emailSent = await sendUserJoinNotification(
            guild.name,
            member.user.tag,
            'Server (New Member)'
        );

        if (emailSent) {
            console.log(`✅ User join notification sent for ${member.user.tag} in ${guild.name}`);
        } else {
            console.log(`❌ Failed to send user join notification for ${member.user.tag}`);
        }

        // Post message to #new-members channel
        const newMembersChannel = guild.channels.cache.find(
            channel => channel.name === 'new-members' && channel.isTextBased()
        );

        if (!newMembersChannel) {
            console.log(`⚠️ Could not find #new-members channel in ${guild.name}`);
            console.log(`Available channels: ${guild.channels.cache.map(ch => ch.name).join(', ')}`);
            return;
        }

        // Check bot permissions in the channel
        const permissions = newMembersChannel.permissionsFor(client.user);
        if (!permissions.has('SendMessages')) {
            console.log(`❌ Bot lacks Send Messages permission in #new-members`);
            return;
        }
        if (!permissions.has('EmbedLinks')) {
            console.log(`⚠️ Bot lacks Embed Links permission in #new-members`);
        }

        // Create an embed message for the new member
        const welcomeEmbed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🎉 New Member Joined!')
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '👤 User', value: `${member.user.tag}`, inline: true },
                { name: '🆔 User ID', value: `${member.user.id}`, inline: true },
                { name: '📅 Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: false },
                { name: '👥 Member Count', value: `${guild.memberCount}`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `Welcome to ${guild.name}!` });

        // Send the message to the channel
        await newMembersChannel.send({ 
            content: `Welcome ${member}! 👋`,
            embeds: [welcomeEmbed] 
        });

        console.log(`✅ Welcome message posted in #new-members for ${member.user.tag}`);

    } catch (error) {
        console.error("Error handling user join:", error);
    }
});

// Login to Discord with your client token
const token = process.env.DISCORDBOTTOKEN;

console.log('===========================================');
console.log('MAIN BOT LOGIN ATTEMPT');
console.log('===========================================');
console.log('Attempting Discord bot login...');
console.log('Token exists:', !!token);
console.log('Token length:', token ? token.length : 0);
console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'N/A');

if (!token) {
    console.error('❌ DISCORDBOTTOKEN environment variable is missing!');
    console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('DISCORD') || k.includes('BOT') || k.includes('TOKEN')));
    process.exit(1);
}

client.login(token)
    .then(() => {
        console.log('✅ Main bot login promise resolved successfully');
    })
    .catch(error => {
        console.error('❌ MAIN BOT LOGIN FAILED!');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Full error:', JSON.stringify(error, null, 2));
        process.exit(1);
    });

module.exports = client;