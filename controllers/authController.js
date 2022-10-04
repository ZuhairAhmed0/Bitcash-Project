const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const crypto = require("crypto");
const User = require("../models/User");

const errorHandler = require("../controllers/errorController");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/sendEmail");

const createToken = (id, res) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRESIN,
  });
  res.cookie("token", token, {
    expires: new Date(Date.now() + process.env.COOKIE_EXPIRESIN * 60 * 60 * 24),
    httpOnly: true,
  });
};

exports.signup = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    createToken(user._id, res);
    res.redirect("/login");
  } catch (err) {
    let errors = new AppError(err, 403);
    console.error(errors.message);
    res.render("signup", { title: "انشاء حساب", error: errorHandler(err) });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AppError("Please provide email and password", 403);
    }
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      throw new AppError("Incorrect email or password", 403);
    }

    createToken(user._id, res);
    res.redirect("/user");
  } catch (err) {
    console.error(err.message);
    res.render("login", {
      title: "تسجيل الدخول",
      message: "Incorrect email or password",
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    let { cookie } = req.headers;
    if (!cookie) {
      throw new AppError(
        "You are not loged in, please log in to get access!",
        403
      );
    }
    const cookies = cookie
      .split(";")
      .map((item) => item.split("="))
      .flat(1);

    let c1 = [],
      c2 = [];
    const cookiesObj = {};

    for (let c = 0; c < cookies.length; c += 2) {
      c1.push(cookies[c]);
    }
    for (let c = 1; c < cookies.length; c += 2) {
      c2.push(cookies[c]);
    }

    for (let c = 0; c < c1.length; c++) {
      cookiesObj[c1[c]] = c2[c];
    }

    let { token } = cookiesObj;
    if (!token) {
      throw new AppError(
        "You are not loged in, please log in to get access!",
        403
      );
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) cheak if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      throw new AppError(
        "The user belonging to this token does no longer exist",
        403
      );
    }
    req.user = currentUser;
    res.locals.isLogin = true;
    next();
  } catch (error) {
    res.locals.isLogin = false;
    if (req.url === "/user") {
      console.error(error.message);
      res.redirect("/login");
    } else {
      next();
    }
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    try {
      if (!roles.includes(req.user.role)) {
        throw new AppError(
          "You do not have permission to perform this action",
          403
        );
      }
      res.locals.adminLogin = true;
      next();
    } catch (error) {
      res.locals.adminLogin = false;
      console.log(error.message);
      res.redirect("/");
    }
  };
};

// update user password
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, password, passwordConfirm } = req.body;

    if (!password || !passwordConfirm) {
      throw new AppError("Input data invalid", 401);
    }
    // 1) get user from collection
    const user = await User.findById(req.user.id).select("+password");

    // 2) Check if POSTed current password is current
    if (!(await user.correctPassword(currentPassword, user.password))) {
      throw new AppError("Your correct password is wrong!", 401);
    }
    // 3) if so, update password
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user
      .save()
      .then(() => {
        // 4) log user in, send JWT
        createToken(user._id, res);
        res.render("edit", {
          title: "الاعدادات",
          message: "Updated Successfully",
        });
      })
      .catch((err) => {
        console.log(err.message);
        res.render("edit", {
          title: "الاعدادات",
          currentPassword: "Input data invalid",
          error: errorHandler(err),
        });
      });
  } catch (err) {
    console.log(err.message);
    res.render("edit", {
      title: "الاعدادات",
      currentPassword: "Input data invalid",
      error: errorHandler(err),
    });
  }
};

//forget password
exports.forgetPassword = async (req, res, next) => {
  try {
    // 1) get user from collection
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      throw new AppError("There is no user with email address", 404);
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/resetPassword/${resetToken}`;

    console.log(resetURL);
    const message = `Forget Your password, Submit a request PATCH with new password and passwordConfirm to ${resetURL}.\n
  If you did'nt forget your password, please ignore this email!`;

    sendEmail({
      fromEmail: "BitCash support <zuhairahmed67@gmail.com>",
      toEmail: user.email,
      subject: "Your passwprd reset token (valid for 10 min)",
      message,
    })
      .then(() => {
        res.render("forgetPassword", {
          title: "هل نسيت كلمة السر ؟",
          message: "تم ارسال رمز التحقق بنجاح ، من فضلك تحقق من صندوق الوارد",
        });
      })
      .catch((error) => {
        res.render("forgetPassword", {
          title: "هل نسيت كلمة السر ؟",
          message: "لا يوجد اتصال بالانترنت ):",
        });
      });
  } catch (error) {
    console.log(error.message);
    res.render("forgetPassword", {
      title: "هل نسيت كلمة السر ؟",
      message: "There is no user with email address",
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    // 1) get token from url
    let token = req.headers.referer.split("/").slice(-1)[0];

    // 2) Hash token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError("Token is invalid or has expired", 400);
    }

    // if token is valid and there user , set new password

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user
      .save()
      .then(() => {
        // 4) log user in, send JWT
        res.render("login", {
          title: "تسجيل الدخول",
          message:
            "تم اعادة  تعيين كلمة السر ، من فضلك يمكنك الان تسجيل الدخول",
        });
      })
      .catch((err) => {
        console.log(err.message);
        res.render("resetPassword", {
          title: "اعادة  تعيين كلمة السر",
          error: errorHandler(err),
        });
      });
  } catch (err) {
    console.log(err.message);
    res.render("resetPassword", {
      title: "اعادة  تعيين كلمة السر",
      message: err.message,
    });
  }
};
