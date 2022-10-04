const AppError = require("../utils/appError");
const sendEmail = require("../utils/sendEmail");

exports.contact_Us = (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      throw new AppError("required", 401);
    }
    sendEmail({
      fromEmail: `From <${email}>`,
      toEmail: "zuhairahmed67@gmail.com",
      subject: `New message from ${name}`,
      message,
    })
      .then(() => {
        res.render("contacts", {
          title: "اتصل بنا",
          message: "شكرا لتواصلك معنا سوف يتم الرد عليك خلال 24 ساعة",
        });
      })
      .catch((error) => {
        res.render("contacts", {
          title: "اتصل بنا",
          message: "لا يوجد اتصال بالانترنت ):",
        });
      });
  } catch (error) {
    res.render("contacts", {
      title: "اتصل بنا",
      message: "من فضلك قم بمل جميع الحقول",
    });
  }
};
