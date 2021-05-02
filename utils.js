function filterCfHeaders(headers) {
  const result = {};

  Object.keys(headers).forEach((key) => {
    if (!key.startsWith("cf")) {
      result[key] = headers[key];
    }
  });

  return result;
}

function instanceToJson(instance) {
  return [...instance].reduce((obj, item) => {
    const prop = {};
    // eslint-disable-next-line prefer-destructuring
    prop[item[0]] = item[1];
    return { ...obj, ...prop };
  }, {});
}

module.exports = {
  filterCfHeaders,
  instanceToJson,
};
