const path = require('node:path');
const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.from = `Nirmalya Ganguly <${process.env.EMAIL_FROM}>`;
    this.url = url;
    this.firstName = user.name.split(' ')[0];
  }

  createNewTransport() {
    if (process.env.NODE_ENV === 'production') {
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

  async send(template, subject) {
    const html = pug.renderFile(path.join(__dirname, `../templates/email/${template}.pug`), {
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
    await this.createNewTransport().sendMail(mailOptions);
  }

  async sendWelcomeEmail() {
    await this.send('welcome', "Welcome to Natours' family!");
  }

  async sendPasswordReset() {
    await this.send('passwordReset', 'Your password reset link (valid for only 10 minutes)');
  }
};
