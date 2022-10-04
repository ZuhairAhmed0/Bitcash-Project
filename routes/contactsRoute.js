const router = require("express").Router();
const contactsController = require("../controllers/contactsController");
const authController = require("../controllers/authController");

router
  .route("/contacts")
  .get(authController.protect, (req, res, next) => {
    res.render("contacts", { title: "اتصل بنا" });
  })
  .post(authController.protect, contactsController.contact_Us);

module.exports = router;
