const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendResetEmail(toEmail, resetLink) {
  await transporter.sendMail({
    from: `"Lost & Found" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Reset Your Password',
    html: `
      <p>You requested a password reset.</p>
      <p>Click the link below to set a new password. This link expires in 1 hour.</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>If you didn't request this, you can ignore this email.</p>
    `
  });
}

module.exports = sendResetEmail;
