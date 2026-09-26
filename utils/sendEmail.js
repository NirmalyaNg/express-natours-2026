const path = require('node:path');
const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.from = `Nirmalya Ganguly <${process.env.EMAIL_FROM}>`;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
  }

  createNewTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Integrate sendgrid
      return 1;
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  send(template, subject) {
    // Render file as html
    const html = pug.renderFile(path.join(__dirname, `../views/${template}.pug`), {
      firstName: this.firstName,
      url: this.url,
      subject,
    });
    const text = htmlToText.convert(html);

    // Create mail options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      text,
      html,
    };

    // Create transport and send email
    this.createNewTransport().sendMail(mailOptions);
  }

  sendWelcome() {
    this.send('welcome', "Welcome to the Natours\' family");
  }
};
