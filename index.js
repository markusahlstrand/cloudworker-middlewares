const httpLoggerService = require("./services/http-logger");
const httpLoggerMiddleware = require("./middlewares/http-logger");
const httpsRedirect = require("./middlewares/https-redirect");
const rateLimit = require("./middlewares/rate-limit");

module.exports = {
  middlewares: {
    httpLogger: httpLoggerMiddleware,
    httpsRedirect,
    rateLimit,
  },
  services: {
    httpLogger: httpLoggerService,
  },
};
