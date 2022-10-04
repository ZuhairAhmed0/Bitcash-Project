const formater = (time) => {
  return Intl.DateTimeFormat("US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(time));
};

module.exports = formater;
