const nodemailer = require('nodemailer');
const genericDal = require('../services/genericDal');
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.PASSWORD_USER
    },
    tls: {
        rejectUnauthorized: false
    }
});

const sendEmail = async ({ to, subject, html }) => {
    return await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html
    });
};

const sendWelcomeEmail = async (userId, email, username) => {
    const welcomeContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to GitLink! 🎉</h2>
            <p>Hello ${username},</p>
            <p>Welcome to GitLink - the platform for project management and developer collaboration!</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="color: #007bff; margin-top: 0;">What you can do:</h3>
                <ul style="margin: 10px 0;">
                    <li>Manage projects with powerful tools</li>
                    <li>Collaborate with teams globally</li>
                    <li>Track code changes with version control</li>
                    <li>Join our active developer community</li>
                </ul>
            </div>
            
            <p><strong>Getting started:</strong> Complete your profile and create your first repository to explore all features.</p>
            
            <p>Need help? Contact us at <a href="mailto:support@gitlink.com" style="color: #007bff;">support@gitlink.com</a> or visit our <a href="https://gitlink.com/help" style="color: #007bff;">Help Center</a>.</p>
            
            <br>
            <p>Best regards,<br>GitLink Team</p>
        </div>
    `;

    await genericDal.CREATE("messages", {
        user_id: userId,
        email,
        title: 'Welcome to GitLink! 🎉',
        content: `Hello ${username}! Welcome to GitLink - the platform for project management and developer collaboration. Start managing projects, collaborating with teams, and tracking code changes today!`
    });

    await sendEmail({
        to: email,
        subject: 'Welcome to GitLink! 🎉',
        html: welcomeContent
    });
};

const sendPasswordResetEmail = async (user, newPassword) => {
    const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset</h2>
            <p>Hello ${user.username},</p>
            <p>Your password has been reset as requested. Here is your new password:</p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <strong style="font-size: 18px; color: #007bff;">${newPassword}</strong>
            </div>
            <p><strong>Important:</strong> Please change this password after logging in for security reasons.</p>
            <p>If you didn't request this password reset, please contact support immediately.</p>
            <br>
            <p>Best regards,<br>GitLink Team</p>
        </div>
    `;

    await sendEmail({
        to: user.email,
        subject: 'Password Reset - GitLink',
        html: emailContent
    });
};

const sendPasswordChangeWarningEmail = async (userId, email) => {
    const subject = 'Security Alert: Your Password Was Changed';
    const content = `
        ⚠️ Hello,
        We noticed that your password was just changed.
        If **you** made this change, no further action is needed.
        But if this wasn't you, please reset your password immediately to protect your account.
        👉 [Click here to reset your password](https://localhost:/reset-password)
        Stay safe,
        The Security Team
    `;

    await genericDal.CREATE("messages", {
        user_id: userId,
        email,
        title: subject,
        content
    });

    await sendEmail({
        to: email,
        subject,
        html: content.replace(/\n/g, '<br/>')
    });
};


module.exports = { sendEmail, sendWelcomeEmail, sendPasswordResetEmail, sendPasswordChangeWarningEmail };