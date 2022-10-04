const errorHandler = (err) => {
  const { errors } = err;
  const error = {};

  if (err.name === "ValidationError") {
    Object.values(errors).forEach(({ properties }) => {
      error[properties.path] = properties.message;
    });
    return error;
  }

  if (err.code === 11000) {
    let value = err.errmsg.match(/(["'])(\\?.)*?\1/);
    value = value.input.split(":")[2].trim().split(" ")[0];

    if (value == "email_1") {
      error.email = "that email is already reqistered";
    }
    if (value == "username_1") {
      error.username = "that username is not available";
    }
    return error;
  }

  return err;
};

module.exports = errorHandler;
