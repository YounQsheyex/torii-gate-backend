const nodemailer = require("nodemailer");

const {
  createWelcomeTemplate,
  createResetTemplate,
} = require("./emailTemplates");

const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMail = async ({ to, subject, html }) => {
  const msg = {
    to,
    from: process.env.EMAIL, // must be a verified sender in SendGrid
    subject,
    html,
  };

  try {
    const info = await sgMail.send(msg);
    console.log(`Email sent successfully: ${info[0].statusCode}`);
  } catch (error) {
    console.error("Error sending email:", error);
    if (error.response) {
      console.error(error.response.body);
    }
  }
};

// const sendMail = async ({ to, subject, html }) => {
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.EMAIL,
//       pass: process.env.PASSWORD,
//     },
//   });
//   try {
//     const info = await transporter.sendMail({
//       from: process.env.EMAIL,
//       to: to,
//       subject: subject,
//       html: html,
//     });
//     console.log(`email sent ${info.response}`);
//   } catch (error) {
//     console.log(error);
//   }
// };

const sendWelcomeEmail = ({ fullName, clientUrl, email }) => {
  const subject = "Welcome to Torii Gates";
  const html = createWelcomeTemplate(fullName, clientUrl);

  sendMail({ to: email, subject, html });
};
const sendResetEmail = ({ fullName, clientUrl, email }) => {
  const subject = "Password Reset";
  const html = createResetTemplate(fullName, clientUrl);

  sendMail({ to: email, subject, html });
};

module.exports = { sendWelcomeEmail, sendResetEmail };
