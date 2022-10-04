const Plans = require("../models/Plans");

exports.getPlans = async (req, res, next) => {
  try {
    const plans = await Plans.find();

    res.render("index", { title: "الصفحة الرئيسية", plans });
  } catch (error) {
    console.log(error);
  }
};

exports.addPlans = async (req, res, next) => {
  const plan = await Plans.create(req.body);

  res.json({
    status: "Success",
    plan,
  });
};
