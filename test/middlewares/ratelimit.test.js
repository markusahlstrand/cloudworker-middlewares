const { expect } = require('chai');
const rateLimitFactory = require('../../middlewares/rate-limit');
const helpers = require('../helpers');
const LruCache = require('../../storage/lru-cache');
const DurableObjects = require('../../storage/durable-objects');

describe('ratelimit', () => {
  it('should add ratelimit headers to the response', async () => {
    const storage = new LruCache();
    const rateLimit = rateLimitFactory({ storage });

    const ctx = helpers.getCtx();

    await rateLimit(ctx, helpers.getNext());

    expect(ctx.response.headers.get('X-Ratelimit-Count')).to.equal(1);
    expect(ctx.response.headers.get('X-Ratelimit-Limit')).to.equal(1000);
    expect(ctx.response.headers.get('X-Ratelimit-Count')).to.be.below(60);
  });

  it('should not count options requests', async () => {
    const storage = new LruCache();
    const rateLimit = rateLimitFactory({ storage });

    const ctx = helpers.getCtx();
    ctx.request.method = 'OPTIONS';

    await rateLimit(ctx, helpers.getNext());

    expect(ctx.response.headers.get('X-Ratelimit-Count')).to.equal(0);
    expect(ctx.response.headers.get('X-Ratelimit-Limit')).to.equal(1000);
    expect(ctx.response.headers.get('X-Ratelimit-Count')).to.be.below(60);
  });

  it('should not count head requests', async () => {
    const storage = new LruCache();
    const rateLimit = rateLimitFactory({ storage });

    const ctx = helpers.getCtx();
    ctx.request.method = 'HEAD';

    await rateLimit(ctx, helpers.getNext());

    expect(ctx.response.headers.get('X-Ratelimit-Count')).to.equal(0);
    expect(ctx.response.headers.get('X-Ratelimit-Limit')).to.equal(1000);
    expect(ctx.response.headers.get('X-Ratelimit-Count')).to.be.below(60);
  });

  it.only('should return a 429 for ratelimited requests', async () => {
    const storage = new LruCache();
    const rateLimit = rateLimitFactory({
      limit: 1,
      storage,
    });

    const ctx1 = helpers.getCtx();
    const ctx2 = helpers.getCtx();

    await rateLimit(ctx1, helpers.getNext());
    await rateLimit(ctx2, helpers.getNext());

    expect(ctx1.status).to.equal(200);
    expect(ctx2.status).to.equal(429);
  });

  it('should use durable objects as storage', async () => {
    const durableObjects = new DurableObjects();
    const rateLimit = rateLimitFactory({
      limit: 1,
      storage: durableObjects,
    });

    const ctx1 = helpers.getCtx();
    const ctx2 = helpers.getCtx();

    await rateLimit(ctx1, helpers.getNext());
    await rateLimit(ctx2, helpers.getNext());

    expect(ctx1.status).to.equal(200);
    expect(ctx2.status).to.equal(429);
  });
});
