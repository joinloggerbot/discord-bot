# Discord Bot with MongoDB and Email Notifications

A Discord bot that sends email notifications when users are added to channels and stores server information in MongoDB when added to new servers.

## Features

- Discord bot with MongoDB integration
- Email notifications for server joins and user additions
- Server information storage and management
- RESTful API endpoints for server data
- User model with validation
- Error handling and middleware
- CORS support
- Environment configuration

## Features

- Express.js server setup
- MongoDB connection with Mongoose ODM
- RESTful API endpoints
- User model with validation
- Error handling and middleware
- CORS support
- Environment configuration

## Prerequisites

- Node.js (version 14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Discord Developer Account (for bot token)
- Email service (Gmail recommended for SMTP)

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd discord-bot
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the MongoDB connection string in `.env`

## Configuration

Edit the `.env` file to configure your application:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/myapp

# Server Configuration
PORT=3000
```

### MongoDB Connection Options

**Local MongoDB:**

```env
MONGODB_URI=mongodb://localhost:27017/myapp
```

**MongoDB Atlas (Cloud):**

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/myapp?retryWrites=true&w=majority
```

## Usage

### Start the Server

**Development mode (with nodemon):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

The server will start on the port specified in your `.env` file (default: 3000).

### Start the Discord Bot

**Development mode:**

```bash
npm run bot:dev
```

**Production mode:**

```bash
npm run bot
```

The bot will connect to Discord using the token in your `.env` file.

### API Endpoints

#### Users API

- `GET /` - Server status
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

#### User Model

The User model includes the following fields:

- `name` (required, string, max 50 characters)
- `email` (required, unique, valid email format)
- `age` (optional, number between 0 and 120)
- `createdAt` (auto-generated timestamp)

#### Example Requests

**Create a user:**

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","age":30}'
```

**Get all users:**

```bash
curl http://localhost:3000/api/users
```

**Get specific user:**

```bash
curl http://localhost:3000/api/users/USER_ID
```

## Project Structure

```
.
├── config/
│   ├── db.js          # MongoDB connection configuration
│   └── constants.js   # Application constants
├── models/
│   ├── User.js        # User model definition
│   └── DiscordServer.js # Discord server model
├── services/
│   └── emailService.js # Email notification service
├── server.js          # Express server file
├── bot.js             # Discord bot file
├── package.json       # Project dependencies
├── .env              # Environment variables
└── README.md         # This file
```

## MongoDB Setup

### Local Installation

1. Download and install MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service
3. Update `.env` with local connection string

### MongoDB Atlas (Cloud)

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Add your IP address to the allowlist
4. Create database user
5. Get connection string and update `.env`

## Discord Bot Setup

### Creating a Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Navigate to the "Bot" section and add a bot
4. Copy the bot token and add it to your `.env` file as `DISCORDBOTTOKEN`
5. Under "OAuth2" > "URL Generator", select the following scopes:
   - `bot`
6. Select the following bot permissions:
   - `View Channels`
   - `Send Messages`
   - `Manage Guild` (for server information)
   - `Server Members Intent` (enable in Bot settings)
   - `Message Content Intent` (enable in Bot settings)
7. Generate the invite URL and invite the bot to your server

### Email Configuration

For Gmail SMTP setup:

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password at [Google App Passwords](https://support.google.com/accounts/answer/185833)
3. Use your email as `EMAIL_USER` and the app password as `EMAIL_PASSWORD` in `.env`

### Bot Features

- **Server Join Notifications**: Automatically sends email when bot is added to new servers
- **User Join Notifications**: Sends email when new users join the server
- **Server Data Storage**: Stores server information in MongoDB database
- **Server Removal Tracking**: Removes server data when bot is removed from servers

### Bot Commands

The bot currently runs in the background and doesn't require commands. It automatically:

- Tracks server joins and sends notifications
- Monitors user joins and sends notifications
- Stores server information in the database

### Troubleshooting

**Discord Intents Error:**
If you get "Used disallowed intents" error:

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to "Bot" section
4. Enable "Server Members Intent" and "Message Content Intent"
5. Regenerate your invite URL with the updated permissions

**MongoDB Deprecation Warnings:**
The MongoDB driver warnings about `useNewUrlParser` and `useUnifiedTopology` are normal and can be ignored. These options are no longer needed in newer versions of the MongoDB driver.

**Email Not Sending:**

- Check that your email credentials are correct in `.env`
- Ensure 2-Factor Authentication is enabled on your Google account
- Verify you're using an App Password, not your regular password
- Check that your email provider allows SMTP access

## Error Handling

The server includes comprehensive error handling for:

- MongoDB connection errors
- Validation errors
- Invalid requests
- Not found routes
- Server errors

## Development

- Use `npm run dev` for development with auto-restart
- Use `npm start` for production deployment
- Add new models in the `models/` directory
- Add new routes in `server.js` or create separate route files

## License

This project is open source and available under the [MIT License](LICENSE).
