const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendResetEmail(toEmail, resetLink) {
  await resend.emails.send({
    from: 'Lost & Found <onboarding@resend.dev>',
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
