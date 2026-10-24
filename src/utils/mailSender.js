const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
  try {
    if (!process.env.MAIL_HOST || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
      console.warn("Mail credentials not configured. Skipping email delivery.");
      return { success: false, message: "Mail credentials not configured" };
    }

    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    let info = await transporter.sendMail({
      from: `"Musify" <${process.env.MAIL_USER}>`,
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`,
    });
    console.log("Mail sent:", info?.messageId);
    return info;
  } catch (error) {
    console.error("mailSender error:", error.message);
    return { error: error.message };
  }
};

export default mailSender;
