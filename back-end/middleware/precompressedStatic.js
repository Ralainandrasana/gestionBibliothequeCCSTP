const fs = require('fs');
const path = require('path');

function acceptsGzip(header = '') {
  return header.split(',').some((entry) => {
    const [encoding, ...parameters] = entry.trim().split(';');
    const quality = parameters.find((parameter) => parameter.trim().startsWith('q='));
    const qualityValue = quality ? Number(quality.trim().slice(2)) : 1;

    return (encoding === 'gzip' || encoding === '*') && qualityValue > 0;
  });
}

module.exports = function createPrecompressedStatic(rootDirectory) {
  const compressedFiles = new Map();

  function indexDirectory(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolutePath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        indexDirectory(absolutePath);
      } else if (entry.name.endsWith('.gz')) {
        const relativePath = path.relative(rootDirectory, absolutePath).split(path.sep).join('/');
        compressedFiles.set(`/${relativePath.slice(0, -3)}`, absolutePath);
      }
    }
  }

  if (fs.existsSync(rootDirectory)) {
    indexDirectory(rootDirectory);
  }

  return function precompressedStatic(req, res, next) {
    if (
      (req.method !== 'GET' && req.method !== 'HEAD')
      || !acceptsGzip(req.headers['accept-encoding'])
    ) {
      next();
      return;
    }

    const compressedPath = compressedFiles.get(req.path);
    if (!compressedPath) {
      next();
      return;
    }

    res.vary('Accept-Encoding');
    res.setHeader('Content-Encoding', 'gzip');
    res.type(path.extname(req.path));

    if (req.path.startsWith('/assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }

    res.sendFile(compressedPath);
  };
};
