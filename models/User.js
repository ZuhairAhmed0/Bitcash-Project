const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: [true, "Please enter username"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true, //"that email is already resgiter"],
    validate: [isEmail, "Please provide a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minlength: [8, "Minimum password length is 8 characters"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      validator: function (val) {
        return this.password === val;
      },
      message: "The password is not same",
    },
  },
  role: {
    type: String,
    enum: ["user", "guide", "admin"],
    default: "user",
  },
  user: Array,
  profits: Number,
  investment: Number,
  allWithdrawal: Array,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.passwordConfirm = undefined;

  this.password = await bcrypt.hash(this.password, 12);

  next();
});

userSchema.methods.correctPassword = async function (newPass, userPass) {
  return await bcrypt.compare(newPass, userPass);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(16).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
// mongoose.set("debug", true);

const User = mongoose.model("user", userSchema);

module.exports = User;
