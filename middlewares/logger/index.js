const lodashGet = require("lodash.get");

const _ = {
  get: lodashGet,
};

async function streamToString(readable, maxSize) {
  const results = [];
  const reader = readable.getReader();
  // eslint-disable-next-line no-undef
  const textDecoder = new TextDecoder();
  let bytesCount = 0;

  while (maxSize && bytesCount < maxSize) {
    // eslint-disable-next-line no-await-in-loop
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    bytesCount += value.byteLength;
    results.push(textDecoder.decode(value));
  }

  const result = results.join("");
  if (maxSize) {
    return result.substring(0, maxSize);
  }
  return result;
}

/**
 * Returns the first 10 KB of the body
 * @param {*} ctx
 */
async function getBody(request) {
  if (["POST", "PATCH"].indexOf(request.method) === -1) {
    return null;
  }

  const clonedRequest = request.clone();

  return streamToString(clonedRequest.body, 1024 * 10);
}

async function defaultFormatter({ ctx, event, serverity }) {
  return {
    message: event,
    requestIp: _.get(ctx, "request.headers.x-real-ip"),
    requestId: _.get(ctx, "request.requestId"),
    request: {
      headers: _.get(ctx, "request.headers"),
      method: _.get(ctx, "request.method"),
      url: _.get(ctx, "request.href"),
      protocol: _.get(ctx, "request.protocol"),
      body,
    },
    response: {
      status: ctx.status,
      headers: _.get(ctx, "response.headers"),
    },
    handlers: _.get(ctx, "state.handlers", []).join(","),
    route: _.get(ctx, "route.name"),
    timestamp: new Date().toISOString(),
    ttfb: new Date() - ctx.state["logger-startDate"],
    redirectUrl: ctx.userRedirect,
    severity,
  };
}

module.exports = function logger({ logService, formatter = defaultFormatter }) {
  return async (ctx, next) => {
    ctx.state["logger-startDate"] = new Date();
    const body = await getBody(ctx.event.request);

    try {
      await next(ctx);

      const data = formatter({ ctx, event: "START", severity: 30 });

      ctx.event.waitUntil(logService.log(data));
    } catch (err) {
      const errData = {
        request: {
          headers: _.get(ctx, "request.headers"),
          method: _.get(ctx, "request.method"),
          handlers: _.get(ctx, "state.handlers", []).join(","),
          url: _.get(ctx, "request.href"),
          body,
        },
        message: "ERROR",
        stack: err.stack,
        error: err.message,
        severity: 50,
      };

      ctx.event.waitUntil(logService.log(errData));
    }
  };
};
