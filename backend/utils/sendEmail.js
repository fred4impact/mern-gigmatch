const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create transporter
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
    },
  });

  // Email options
  const mailOptions = {
    from: process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@gigmatch.com',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || options.message.replace(/\n/g, '<br>'),
  };

  // Send email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail; 