const express = require("express");
const app = express();
const methodOverride = require("method-override");
const homeRoute = require("./routes/homeRoute");
const userRoute = require("./routes/userRoute");
const contactsRoute = require("./routes/contactsRoute");
const dashboardRoute = require("./routes/dashboardRoute");
const globalErrorHandler = require("./controllers/errorController");
const authController = require("./controllers/authController");
const helmet = require("helmet");

// app.use(helmet());
// ovverride methods from client
app.use(methodOverride("_method"));

// setup view engine
app.set("view engine", "ejs");
app.set("views");

// statics fils
app.use(express.static("public"));

// body Parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// routes
app.use("/", homeRoute);
app.use("/", userRoute);
app.use("/", contactsRoute);
app.use("/dashboard", dashboardRoute);

app.all("*", authController.protect, (req, res, next) => {
  res.render("404", { title: "الصفحة غير موجودة" });
});

app.use(globalErrorHandler);

module.exports = app;
