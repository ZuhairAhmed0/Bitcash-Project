const router = require("express").Router();
const dashboardController = require("../controllers/dashboardController");
const authController = require("../controllers/authController");

router.get(
  "/",
  authController.protect,
  authController.restrictTo("admin"),
  dashboardController.systemAnalysis
);

router
  .route("/plans")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    dashboardController.getAllPlans
  )
  .post(
    authController.protect,
    authController.restrictTo("admin"),
    dashboardController.addNewPlan
  );

router.delete(
  "/plans/:id",
  authController.protect,
  authController.restrictTo("admin"),
  dashboardController.deletePlan
);

router.patch(
  "/plans/:id",
  authController.protect,
  authController.restrictTo("admin"),
  dashboardController.updatePlan
);

router.get(
  "/top-payments",
  authController.protect,
  authController.restrictTo("admin"),
  dashboardController.topPayments
);

router.get(
  "/top-deposits",
  authController.protect,
  authController.restrictTo("admin"),
  dashboardController.topPeposits
);

router.get(
  "/users",
  authController.protect,
  authController.restrictTo("admin"),
  dashboardController.getAllUsers
);

router.post(
  "/users/search",
  authController.protect,
  authController.restrictTo("admin"),
  dashboardController.search
);

router.get(
  "/users/:id",
  authController.protect,
  authController.restrictTo("admin"),
  dashboardController.details
);

module.exports = router;
