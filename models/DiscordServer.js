//models/DiscordServer.js

const mongoose = require('mongoose');

const discordServerSchema = new mongoose.Schema({
    id: {
        type: String,
        required: [true, 'Server ID is required'],
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Server name is required'],
        trim: true,
        maxlength: [100, 'Server name cannot exceed 100 characters']
    },
    memberCount: {
        type: Number,
        default: 0
    },
    owner: {
        id: String,
        username: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for better performance (removed duplicate index)

module.exports = mongoose.model('DiscordServer', discordServerSchema);