const http = require('http');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function validateTimezone(timezone) {
  if (!timezone) return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

function validateUrl(targetUrl) {
  if (!targetUrl) return false;
  try {
    const parsed = new URL(targetUrl);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function handleRequest(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const { pathname, searchParams } = requestUrl;

  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed. Use GET.' });
  }

  if (pathname !== '/win' && pathname !== '/mac') {
    return sendJson(res, 404, { error: 'Endpoint not found. Use /win or /mac.' });
  }

  const timezone = searchParams.get('timezone');
  const targetUrl = searchParams.get('url');

  if (!validateTimezone(timezone)) {
    return sendJson(res, 400, {
      error: 'Invalid or missing timezone. Example: America/New_York'
    });
  }

  if (!validateUrl(targetUrl)) {
    return sendJson(res, 400, {
      error: 'Invalid or missing url. Example: https://example.com'
    });
  }

  const now = new Date();
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    dateStyle: 'full',
    timeStyle: 'long'
  }).format(now);

  return sendJson(res, 200, {
    endpoint: pathname,
    timezone,
    url: targetUrl,
    localTime: formattedTime,
    message: `Request accepted for ${pathname === '/win' ? 'Windows' : 'Mac'}`
  });
}

const server = http.createServer(handleRequest);
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
