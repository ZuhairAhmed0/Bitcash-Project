const mongoose = require("mongoose");
const dotenv = require("dotenv");

const app = require("./app");
const port = process.env.PORT || 4000;
dotenv.config({ path: "./.env" });

mongoose.connect(process.env.DB_URL_ATLAS, (err) => {
  console.log("DB connection successful!");
});

app.listen(port, (err) => {
  console.log(`server running on port ${port}...`);
});

// const { logError, isOperationalError } = require("./utils/errorHandler");

// process.on("uncaughtException", (error) => {
//   logError(error);

//   if (!isOperationalError(error)) {
//     process.exit(1);
//   }
// });
