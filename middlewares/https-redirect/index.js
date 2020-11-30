const get = require("lodash.get");

const _ = {
  get,
};

module.exports = function httpsRedirect({
  status = 302,
  message = "Redriect to https",
}) {
  return async (ctx, next) => {
    const httpUpgradeHeader = _.get(
      ctx,
      "request.headers.upgrade-insecure-requests"
    );

    if (httpUpgradeHeader !== "1") {
      await next(ctx);
    } else {
      ctx.status = status;
      ctx.body = message;
      ctx.set("location", `https://${ctx.request.hostname}/${ctx.params.file}`);
    }
  };
};
