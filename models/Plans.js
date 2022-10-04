const mongoose = require("mongoose");

const planSchema = mongoose.Schema({
  plan: {
    type: Number,
    required: [true, "please choose your plan"],
  },
  minimumDeposit: {
    type: Number,
    required: [true, "Minimum deposit is 100"],
    min: 100,
  },
  maximumDeposit: {
    type: Number,
    required: [true, "Maximum deposit is 100"],
  },
  withdrawTime: Number,
  withdrawFee: Number,
  depositPeriod: Number,
});

const Plans = mongoose.model("plan", planSchema);

module.exports = Plans;

/*
<li>الحد الادني للايداع 100</li>
<li>الحد الاعلي للايداع 300</li>
<li>سحب كل 24 ساعة</li>
<li>رسوم سحب 1% </li>
<li>مدة الايداع 15يوم</li>
*/
