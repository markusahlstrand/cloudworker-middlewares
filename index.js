const HttpLogger = require("./services/http-logger");
const KinesisLogger = require("./services/kinesis-logger");
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
    HttpLogger,
    KinesisLogger,
  },
};
