const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Remove CSP headers in development
  app.use((req, res, next) => {
    res.removeHeader('Content-Security-Policy');
    next();
  });
};