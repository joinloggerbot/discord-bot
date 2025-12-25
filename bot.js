const { Client, GatewayIntentBits } = require('discord.js');
const connectDB = require('./config/db');
const DiscordServer = require('./models/DiscordServer');
const { sendServerJoinNotification, sendUserJoinNotification } = require('./services/emailService');

// Load environment variables
require('dotenv').config();

// Connect to MongoDB
connectDB();

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

// When the client is ready, run this code (only once)
client.once('ready', () => {
    console.log(`Bot logged in as ${client.user.tag}!`);
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

        // Create new server document
        const serverData = new DiscordServer({
            id: guild.id,
            name: guild.name,
            memberCount: guild.memberCount,
            owner: {
                id: guild.ownerId,
                username: guild.owner ? guild.owner.user.username : 'Unknown'
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

// Handle user joins in channels (you'll need to specify which channels to monitor)
client.on('guildMemberAdd', async (member) => {
    try {
        // Get the guild (server) the member joined
        const guild = member.guild;

        // You can add logic here to check if the user was added to specific channels
        // For now, we'll send a notification for any new member
        const emailSent = await sendUserJoinNotification(
            guild.name,
            member.user.tag,
            'Server'
        );

        if (emailSent) {
            console.log(`User join notification sent for ${member.user.tag} in ${guild.name}`);
        } else {
            console.log(`Failed to send user join notification for ${member.user.tag}`);
        }

    } catch (error) {
        console.error("Error handling user join:", error);
    }
});

// Handle user being added to specific channels
// Note: Discord.js doesn't have a direct "user added to channel" event
// You would need to implement this based on your specific requirements
// For example, tracking voice channel joins or specific role assignments

// Login to Discord with your client token
client.login(process.env.DISCORDBOTTOKEN);

module.exports = client;