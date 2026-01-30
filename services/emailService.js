//EMAILSERVICE.JS

const nodemailer = require('nodemailer');
require('dotenv').config();

// Create the transporter for email sending
const createTransport = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false, 
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

// Send notification email to admin
const sendServerJoinNotification = async (serverName, serverId, memberCount) => {
    try {
        const transporter = createTransport();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: 'Discord Bot Added to New Server',
            html: `
        <h2>Bot Added to New Server</h2>
        <p><strong>Server Name:</strong> ${serverName}</p>
        <p><strong>Server ID:</strong> ${serverId}</p>
        <p><strong>Member Count:</strong> ${memberCount}</p>
        <p><strong>Joined At:</strong> ${new Date().toLocaleString()}</p>
        <hr>
        <p>This is an automated notification from your Discord bot.</p>
      `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Notification email sent for server: ${serverName}`);
        return true;
    } catch (error) {
        console.error('Error sending notification email:', error);
        return false;
    }
};

// Send user join notification
const sendUserJoinNotification = async (serverName, userName, channelName) => {
    try {
        const transporter = createTransport();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: 'User Added to Channel',
            html: `
        <h2>User Added to Channel</h2>
        <p><strong>Server:</strong> ${serverName}</p>
        <p><strong>User:</strong> ${userName}</p>
        <p><strong>Channel:</strong> ${channelName}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <hr>
        <p>This is an automated notification from your Discord bot.</p>
      `
        };

        await transporter.sendMail(mailOptions);
        console.log(`User join notification sent for ${userName} in ${channelName}`);
        return true;
    } catch (error) {
        console.error('Error sending user join notification:', error);
        return false;
    }
};

module.exports = {
    sendServerJoinNotification,
    sendUserJoinNotification
};




 const numbers = [2,3,4,5,6,7,8,9,10];

 if (numbers / 2 === 0) {
    console.log("even");
 }

