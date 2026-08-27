const { gzipSync, constants } = require('zlib');

const MINIMUM_SIZE = 1024;
const COMPRESSIBLE_CONTENT_TYPE = /^(?:text\/|application\/(?:json|javascript|xml|x-javascript))/i;

function acceptsGzip(header = '') {
  return header.split(',').some((entry) => {
    const [encoding, ...parameters] = entry.trim().split(';');
    const quality = parameters.find((parameter) => parameter.trim().startsWith('q='));
    const qualityValue = quality ? Number(quality.trim().slice(2)) : 1;

    return (encoding === 'gzip' || encoding === '*') && qualityValue > 0;
  });
}

module.exports = function gzipJsonResponse(req, res, next) {
  if (req.method === 'HEAD' || !acceptsGzip(req.headers['accept-encoding'])) {
    next();
    return;
  }

  const originalSend = res.send.bind(res);

  res.send = function sendCompressed(body) {
    if (res.getHeader('Content-Encoding')) {
      return originalSend(body);
    }

    const cacheControl = String(res.getHeader('Cache-Control') || '');
    if (/\bno-transform\b/i.test(cacheControl)) {
      return originalSend(body);
    }

    const payload = Buffer.isBuffer(body)
      ? body
      : typeof body === 'string'
        ? Buffer.from(body)
        : null;

    if (!payload || payload.length < MINIMUM_SIZE) {
      return originalSend(body);
    }

    const contentType = String(res.getHeader('Content-Type') || '');
    if (contentType && !COMPRESSIBLE_CONTENT_TYPE.test(contentType)) {
      return originalSend(body);
    }

    const compressed = gzipSync(payload, {
      level: constants.Z_BEST_SPEED,
    });

    if (compressed.length >= payload.length) {
      return originalSend(body);
    }

    res.vary('Accept-Encoding');
    res.setHeader('Content-Encoding', 'gzip');
    res.removeHeader('Content-Length');
    return originalSend(compressed);
  };

  next();
};
