const nodemailer = require("nodemailer");

const sendEmail = async (option) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const emailOptions = {
    from: option.fromEmail,
    to: option.toEmail,
    subject: option.subject,
    text: option.message,
  };

  await transporter.sendMail(emailOptions);
};

module.exports = sendEmail;
