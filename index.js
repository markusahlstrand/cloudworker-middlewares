const httpLogger = require("./services/http-logger");
const kinesisLogger = require("./services/kinesis-logger");
const logger = require("./middlewares/logger");
const httpsRedirect = require("./middlewares/https-redirect");
const rateLimit = require("./middlewares/rate-limit");

module.exports = {
  middlewares: {
    logger,
    httpsRedirect,
    rateLimit,
  },
  services: {
    httpLogger,
    kinesisLogger,
  },
};
