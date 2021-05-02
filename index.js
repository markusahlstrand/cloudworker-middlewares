const HttpLogger = require('./services/http-logger');
const KinesisLogger = require('./services/kinesis-logger');
const httpsRedirect = require('./middlewares/https-redirect');
const logger = require('./middlewares/logger');
const origin = require('./middlewares/origin');
const rateLimit = require('./middlewares/rate-limit');

module.exports = {
  middlewares: {
    httpsRedirect,
    logger,
    origin,
    rateLimit,
  },
  services: {
    HttpLogger,
    KinesisLogger,
  },
};
