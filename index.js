const httpLogger = require("./middlewares/http-logger");
const httpsRedirect = require("./middlewares/https-redirect");
const rateLimit = require("./middlewares/rate-limit");

module.exports = {
  httpLogger,
  httpsRedirect,
  rateLimit,
};
