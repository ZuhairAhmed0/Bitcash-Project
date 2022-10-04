const Plans = require("../models/Plans");
const User = require("../models/User");
const formatTime = require("../utils/formatTime");
const userFeat = require("../utils/userFeat");

//sort 10 last payments or deposits
const limitTops = (users, option, time) => {
  let sortPayments = users
    .flatMap((user) => user[option])
    .sort((us1, us2) => us2[time] - us1[time]);

  const top10s = [];
  for (let i = 0; i < 10; i++) {
    top10s.push(sortPayments[i]);
  }
  return top10s;
};

// lastest 10 Payments
const top10Payments = (users) => {
  const topPayments = limitTops(users, "allWithdrawal", "time");

  return topPayments.map((user) => ({
    ...user,
    time: formatTime(user.time),
    wallet: null,
  }));
};

// lastest 10 Deposits
const top10Deposits = (users) => {
  const topDeposits = limitTops(users, "user", "createdAt");

  return topDeposits.map((user) => ({
    username: user.username,
    paymentMethod: user.paymentMethod,
    time: formatTime(user.createdAt),
    balance: user.balance,
  }));
};

exports.systemAnalysis = async (req, res, next) => {
  try {
    const users = await User.find();

    const deposits = users
      .map((user) => user.investment)
      .reduce((a, b) => a + b, 0);

    const allWithdrawal = users
      .flatMap((user) => user.allWithdrawal)
      .map((user) => +user.balance)
      .reduce((a, b) => a + b, 0);

    res.render("dashboard", {
      title: "لوحة التحكم",
      deposits,
      users: users.length,
      payments: allWithdrawal,
      topPayments: top10Payments(users),
      topDeposits: top10Deposits(users),
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getAllPlans = async (req, res, next) => {
  try {
    const plans = await Plans.find();

    res.render("dashboard", {
      title: "خطط الاستثمار | لوحة التحكم",
      allPlans: plans,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.topPayments = async (req, res, next) => {
  try {
    const users = await User.find();

    res.render("dashboard", {
      title: "المدفوعات الاخيرة  | لوحة التحكم",
      topPaymentsPage: top10Payments(users),
    });
  } catch (error) {
    console.log(error);
  }
};

exports.topPeposits = async (req, res, next) => {
  try {
    const users = await User.find();

    res.render("dashboard", {
      title: "الايداعات الاخيرة  | لوحة التحكم",
      topDepositsPage: top10Deposits(users),
    });
  } catch (error) {
    console.log(error);
  }
};

exports.addNewPlan = async (req, res, next) => {
  try {
    const plan = await Plans.create(req.body);
    res.redirect("/dashboard/plans");
  } catch (error) {
    console.log(error);
    res.redirect("/dashboard/plans");
  }
};

exports.deletePlan = async (req, res, next) => {
  try {
    await Plans.deleteOne({ _id: req.params.id });
    res.redirect("/dashboard/plans");
  } catch (error) {
    console.log(error);
    res.redirect("/dashboard/plans");
  }
};

exports.updatePlan = async (req, res, next) => {
  try {
    await Plans.updateOne({ _id: req.params.id }, req.body);
    res.redirect("/dashboard/plans");
  } catch (error) {
    console.log(error);
    res.redirect("/dashboard/plans");
  }
};

// users actions
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    res.render("dashboard", {
      title: "المستخدمين | لوحة التحكم",
      allUsers: users,
    });
  } catch (error) {
    console.log(error);
    redirect("/dashboard/users");
  }
};

exports.search = async (req, res, next) => {
  try {
    const users = await User.find({
      $or: [{ email: req.body.search }, { username: req.body.search }],
    });

    res.render("dashboard", {
      title: "المستخدمين | لوحة التحكم",
      allUsers: users,
      searchOption: true,
    });
  } catch (error) {
    console.log(error.message);
    res.redirect("/dashboard/users");
  }
};

exports.details = async (req, res, next) => {
  try {
    const users = await User.findById(req.params.id);
    let { user, allWithdrawal, username } = await User.findById(req.params.id);

    const userData = userFeat(user, allWithdrawal, username);

    userData.lastDeposit = user.filter(
      ({ createdAt }) =>
        new Date(createdAt).getTime() == userData.lastDepositTime
    )[0];

    userData.lastPayment = allWithdrawal.filter(
      ({ time }) => time == userData.lastPaymentTime
    )[0];

    // format time before send to client
    userData.lastPayment.time = formatTime(userData.lastPayment.time);
    userData.lastDeposit.createdAt = formatTime(userData.lastDeposit.createdAt);
    userData.lastDeposit.expiresAt = formatTime(userData.lastDeposit.expiresAt);

    users.user.forEach((user) => {
      user.createdAt = formatTime(user.createdAt);
      user.expiresAt = formatTime(user.expiresAt);
    });
    users.allWithdrawal.forEach((user) => {
      user.time = formatTime(user.time);
    });

    res.render("dashboard", {
      title: "المستخدمين | لوحة التحكم",
      userDetails: users,
      userData,
    });
  } catch (error) {
    console.log(error.message);
    res.redirect("/dashboard/users");
  }
};
