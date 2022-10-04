const router = require("express").Router();
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

router
  .route("/signup")
  .get((req, res, next) => {
    res.render("signup", { title: "انشاء حساب" });
  })
  .post(authController.signup);

router
  .route("/login")
  .get((req, res, next) => {
    res.render("login", { title: "تسجيل الدخول" });
  })
  .post(authController.login);

router
  .route("/forgetPassword")
  .get((req, res, next) => {
    res.render("forgetPassword", { title: "هل نسيت كلمة السر ؟" });
  })
  .post(authController.forgetPassword);

router.get("/resetPassword/:token", (req, res, next) => {
  res.render("resetPassword", { title: "تغيير كلمة السر" });
});
router.patch("/resetPassword", authController.resetPassword);

router.get("/logout", userController.logout);

router.get("/user", authController.protect, userController.user);
router
  .get("/user/edit", authController.protect, (req, res, next) => {
    res.render("edit", { title: "الاعدادات" });
  })
  .patch("/user/edit", authController.protect, userController.updateMe);

router.patch(
  "/user/updatePassword",
  authController.protect,
  authController.updatePassword
);

router
  .route("/user/invest")
  .get(authController.protect, userController.invest)
  .post(authController.protect, userController.openInvest);

router
  .route("/user/payment")
  .get(authController.protect, userController.withdrawal)
  .post(authController.protect, userController.openWithdraw);

module.exports = router;
