require('dotenv').config();
const sendResetEmail = require('./utils/mailer');

sendResetEmail('thereplicant007@gmail.com', 'http://localhost:5500/auth.html?token=test123')
  .then(() => console.log('✅ Email sent successfully'))
  .catch(err => console.error('❌ Email failed:', err));
  