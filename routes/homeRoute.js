const router = require("express").Router();
const homeController = require("../controllers/homeController");
const authController = require("../controllers/authController");

router.route("/").get(authController.protect, homeController.getPlans);

router.get("/aboutus", authController.protect, (req, res, next) => {
  res.render("aboutus", { title: "معلومات عنا" });
});

module.exports = router;
