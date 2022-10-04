const userFeat = (user, allWithdrawal, username) => {
  let day = 1000 * 3600 * 24;

  const investor = user.map((el) => el.balance).reduce((a, b) => a + b, 0);
  user = user.filter((el) => el.status === "active");

  const allPlan = user.map((el) =>
    ((new Date(Date.now()).getTime() - el.createdAt.getTime()) / day).toFixed(2)
  );

  const payment = allWithdrawal
    .map((el) => +el.balance)
    .reduce((a, b) => a + b, 0)
    .toFixed(2);

  const profits = (
    user
      .map((el, i) => (el.plan * el.balance * allPlan[i]) / 15)
      .reduce((a, b) => a + b, 0) - payment
  ).toFixed(2);

  const activeDeposit = user.map((el) => el.balance).reduce((a, b) => a + b, 0);

  const lastDeposit = user
    .filter(
      ({ createdAt }) =>
        createdAt.getMilliseconds() ===
        Math.min(...user.map((el) => el.createdAt.getMilliseconds()))
    )
    .map((el) => el.balance)[0];

  const lastDepositTime = Math.min(...user.map((el) => el.createdAt));

  const lastPayment = allWithdrawal
    .filter((el) => el.time === Math.max(...allWithdrawal.map((el) => el.time)))
    .map((el) => el.balance)[0];
  const lastPaymentTime = Math.max(...allWithdrawal.map((el) => el.time));

  const userData = {
    lastPaymentTime,
    lastDepositTime,
    activeDeposit,
    username,
    lastDeposit,
    investor,
    profits,
    payment,
    lastPayment,
  };

  return userData;
};

module.exports = userFeat;
