const get = require('lodash.get');

const _ = {
  get,
};

module.exports = async function httpsRedirect(ctx, next) {
  const httpUpgradeHeader = _.get(ctx, 'request.headers.upgrade-insecure-requests');

  if (httpUpgradeHeader !== '1') {
    await next(ctx);
  } else {
    ctx.status = 302;
    ctx.body = 'Redirect to https';
    ctx.set('location', `https://${ctx.params.host}.sesamy.com/${ctx.params.file}`);
  }
};
