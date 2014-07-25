var env = process.env.ENV || "dev";
module.exports = require("./config." + env + ".json");
module.exports.ENV = env;