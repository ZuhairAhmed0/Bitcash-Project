const User = require("../models/User");
const Plans = require("../models/Plans");
const AppError = require("../utils/appError");
const formatTime = require("../utils/formatTime");
const errorHandler = require("../controllers/errorController");
const userFeat = require("../utils/userFeat");

exports.user = async (req, res, next) => {
  try {
    let { user, allWithdrawal, username } = await User.findById(req.user.id);

    const userData = userFeat(user, allWithdrawal, username);

    user.forEach(async (el, i) => {
      if (new Date(Date.now()).getTime() > new Date(el.expiresAt).getTime()) {
        await User.updateMany(
          {
            _id: req.user.id,
          },
          {
            [`user.${i}.status`]: "Inactive",
          }
        );
      }
    });

    await User.updateOne(
      { _id: req.user.id },
      { $set: { profits: userData.profits, investment: userData.investor } }
    );

    res.render("user", { title: "لوحة المستخدم", userData });
  } catch (error) {
    console.error(error.message);
    res.redirect("/user");
  }
};

exports.logout = async (req, res, next) => {
  res.cookie("token", "", {
    expires: new Date(Date.now() - 1),
  });
  res.user = undefined;
  res.redirect("/");
};

exports.invest = async (req, res, next) => {
  try {
    let plans = await Plans.find();
    const { user } = await User.findById(req.user.id).select("user");

    const allDeposits = user.map((el) => ({
      balance: el.balance,
      time: formatTime(el.createdAt),
    }));
    res.render("invest", {
      title: "إيداع مبلغ  للاستثمار",
      plans: plans.sort((pl1, pl2) => pl1.plan - pl2.plan),
      allDeposits,
    });
  } catch (error) {
    console.error(error.message);
    res.redirect("/user");
  }
};

exports.openInvest = async (req, res, next) => {
  const plans = await Plans.find();
  try {
    const { plans: plan, plansVal, paymentMethod } = req.body;

    plans.forEach((pl) => {
      if (plan == pl.plan / 100 && plansVal < pl.minimumDeposit) {
        throw new AppError("Deposit is less", 401);
      }
    });

    const expiresAt = new Date(
      new Date(Date.now()).setDate(new Date(Date.now()).getDate() + 15)
    );
    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        user: {
          username: req.user.username,
          plan: parseFloat(plan),
          balance: parseFloat(plansVal),
          paymentMethod,
          createdAt: new Date(Date.now()),
          expiresAt,
          status: "active",
        },
      },
    });

    res.redirect("/user/invest");
  } catch (error) {
    console.error(error.message);
    res.render("invest", {
      title: "إيداع مبلغ  للاستثمار",
      error: "مبلغ الايداع اقل من الحد الادني للايداع للخطة التي اخترتها",
      plans,
    });
  }
};

exports.withdrawal = async (req, res, next) => {
  try {
    const { allWithdrawal } = await User.findById(req.user.id).select(
      "allWithdrawal"
    );

    const withdraw = allWithdrawal.map((el) => ({
      time: formatTime(el.time),
      paymentMethod: el.paymentMethod,
      wallet: el.wallet,
      balance: el.balance,
    }));

    res.render("payment", {
      title: "سحب مبلغ من الحساب",
      allWithdrawal: withdraw,
    });
  } catch (error) {
    console.error(error.message);
    res.redirect("/user");
  }
};

exports.openWithdraw = async (req, res, next) => {
  try {
    const { paymentMethod, wallet, balance } = req.body;

    const { profits } = await User.findById(req.user.id).select("profits");

    if (balance > profits) {
      throw new AppError("Your balance is not enough to withdraw", 401);
    }

    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        allWithdrawal: {
          username: req.user.username,
          paymentMethod,
          wallet,
          balance,
          time: Date.now(),
        },
      },
    });

    await User.updateOne(
      { _id: req.user.id },
      {
        $set: { profits: profits - balance },
      }
    );

    res.redirect("/user/payment");
  } catch (error) {
    console.error(error.message);
    res.render("payment", {
      title: "سحب مبلغ من الحساب",
      error: "رصيدك غير كافي للسحب",
    });
  }
};

//  update username and email
exports.updateMe = async (req, res, next) => {
  try {
    // 1) create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
      throw new AppError("The route is not for password updats", 401);
    }

    const filterObj = Object.keys(req.body)
      .filter((obj) => req.body[obj] !== "")
      .map((obj) => ({
        [obj]: req.body[obj],
      }));

    let body = Object.assign({}, ...filterObj);

    // 2) update user document
    const user = await User.findByIdAndUpdate(req.user.id, body, {
      new: true,
      runValidators: true,
    })
      .then((us) => {
        res.render("edit", {
          title: "الاعدادات",
          message: "Updated Successfully",
        });
      })
      .catch((err) => {
        console.log(err.message);
        res.render("edit", {
          title: "الاعدادات",
          error: errorHandler(err),
        });
      });
  } catch (err) {
    console.log(err.message);
    res.render("edit", {
      title: "الاعدادات",
      error: errorHandler(err),
    });
  }
};
