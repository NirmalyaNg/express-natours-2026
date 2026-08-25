const nodemailer = require('nodemailer');

async function sendEmail(options) {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  return transport.sendMail({
    from: 'Natours <nirmalyaganguly@natours.com>',
    to: options.email,
    subject: options.subject,
    text: options.text,
  });
}

module.exports = sendEmail;
