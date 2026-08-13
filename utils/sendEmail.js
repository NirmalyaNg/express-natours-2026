const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  const emailOptions = {
    from: 'Nirmalya Ganguly <gangulynirmalya99@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  return await transport.sendMail(emailOptions);
};

module.exports = sendEmail;
