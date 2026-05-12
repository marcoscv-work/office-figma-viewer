var http = require('http');
var fs = require('fs');
var path = require('path');

var PORT = 7777;
var ROOT = __dirname;
var PUBLIC_DIR = path.join(ROOT, 'public');
var CONFIG_PATH = path.join(ROOT, 'carousel-config.json');

var DEFAULT_CONFIG = {
  figmaToken: '',
  fileKey: 'BidKDsJvOdDy0xuFXEMg1F',
  pageName: 'carousel'
};

var MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.ico': 'image/x-icon'
};

function readConfig() {
  var parsed;

  try {
    parsed = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch (err) {
    parsed = {};
  }

  return {
    figmaToken: typeof parsed.figmaToken === 'string' ? parsed.figmaToken : DEFAULT_CONFIG.figmaToken,
    fileKey: typeof parsed.fileKey === 'string' && parsed.fileKey ? parsed.fileKey : DEFAULT_CONFIG.fileKey,
    pageName: typeof parsed.pageName === 'string' && parsed.pageName ? parsed.pageName : DEFAULT_CONFIG.pageName
  };
}

function writeConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n');
}

function send(res, status, body, contentType) {
  res.writeHead(status, {
    'Content-Type': contentType || 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(body);
}

function sendJson(res, status, data) {
  send(res, status, JSON.stringify(data), 'application/json; charset=utf-8');
}

function readRequestBody(req, done) {
  var body = '';

  req.on('data', function (chunk) {
    body += chunk;
    if (body.length > 1024 * 1024) {
      req.connection.destroy();
    }
  });

  req.on('end', function () {
    done(body);
  });
}

function serveFile(req, res) {
  var urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  var filePath;
  var ext;

  if (urlPath === '/') {
    urlPath = '/index.html';
  }

  filePath = path.normalize(path.join(PUBLIC_DIR, urlPath));

  if (filePath.indexOf(PUBLIC_DIR) !== 0) {
    send(res, 403, 'Forbidden');
    return;
  }

  fs.stat(filePath, function (err, stat) {
    if (err || !stat.isFile()) {
      send(res, 404, 'Not found');
      return;
    }

    ext = path.extname(filePath).toLowerCase();
    fs.readFile(filePath, function (readErr, data) {
      if (readErr) {
        send(res, 500, 'Read error');
        return;
      }

      res.writeHead(200, {
        'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
        'Cache-Control': 'no-store'
      });
      res.end(data);
    });
  });
}

function handleApi(req, res) {
  if (req.url.split('?')[0] !== '/api/carousel-config') {
    sendJson(res, 404, { error: 'not_found' });
    return;
  }

  if (req.method === 'GET') {
    sendJson(res, 200, readConfig());
    return;
  }

  if (req.method === 'POST') {
    readRequestBody(req, function (body) {
      var input;
      var current = readConfig();
      var next;

      try {
        input = JSON.parse(body || '{}');
      } catch (err) {
        sendJson(res, 400, { error: 'invalid_json' });
        return;
      }

      next = {
        figmaToken: typeof input.figmaToken === 'string' ? input.figmaToken.trim() : current.figmaToken,
        fileKey: typeof input.fileKey === 'string' && input.fileKey.trim() ? input.fileKey.trim() : current.fileKey,
        pageName: typeof input.pageName === 'string' && input.pageName.trim() ? input.pageName.trim() : current.pageName
      };

      try {
        writeConfig(next);
      } catch (err) {
        sendJson(res, 500, { error: 'write_failed' });
        return;
      }

      sendJson(res, 200, next);
    });
    return;
  }

  sendJson(res, 405, { error: 'method_not_allowed' });
}

http.createServer(function (req, res) {
  if (req.url.indexOf('/api/') === 0) {
    handleApi(req, res);
    return;
  }

  serveFile(req, res);
}).listen(PORT, function () {
  console.log('Design Dashboard Carousel listening on http://localhost:' + PORT);
});
