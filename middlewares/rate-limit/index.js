module.exports = function rateLimitHandler({
  type = 'IP',
  scope = 'default',
  limit = 1000,
  storage,
}) {
  function getKey(headers) {
    const ip = headers['x-real-ip'];

    if (type === 'IP') {
      return `${scope}.${ip}`;
    }

    return `${scope}.account`;
  }

  async function getCount(key, currentMinute) {
    const jsonString = await storage.get(key);

    if (!jsonString) {
      return 0;
    }

    const data = JSON.parse(jsonString);
    if (data.minute !== currentMinute) {
      return 0;
    }

    return data.count;
  }

  async function setCount(key, currentMinute, count) {
    const jsonString = JSON.stringify({
      minute: currentMinute,
      count,
    });
    await storage.set(key, jsonString);
  }

  return async (ctx, next) => {
    const currentMinute = Math.trunc(Date.now() / (1000 * 60));
    const reset = Math.trunc(currentMinute * 60 + 60 - Date.now() / 1000);

    const key = getKey(ctx.request.headers);

    let count = await getCount(key, currentMinute);

    // Don't count head and options reqests
    if (['HEAD', 'OPTIONS'].indexOf(ctx.request.method) === -1) {
      count += 1;
    }

    ctx.set('X-Ratelimit-Limit', limit);
    ctx.set('X-Ratelimit-Count', count);
    ctx.set('X-Ratelimit-Reset', reset);

    await setCount(key, currentMinute, count);

    if (limit < count) {
      ctx.status = 429;
      return;
    }

    await next(ctx);
  };
};
