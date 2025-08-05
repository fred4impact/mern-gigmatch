const prometheus = require('prom-client');

// Create a Registry to register the metrics
const register = new prometheus.Registry();

// Add default metrics (CPU, memory, etc.)
prometheus.collectDefaultMetrics({ register });

// Custom metrics for GigMatch application
const httpRequestDurationMicroseconds = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestsTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const activeUsers = new prometheus.Gauge({
  name: 'active_users_total',
  help: 'Total number of active users'
});

const eventsCreated = new prometheus.Counter({
  name: 'events_created_total',
  help: 'Total number of events created'
});

const applicationsSubmitted = new prometheus.Counter({
  name: 'applications_submitted_total',
  help: 'Total number of applications submitted'
});

const databaseConnections = new prometheus.Gauge({
  name: 'database_connections_active',
  help: 'Number of active database connections'
});

// Register all metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestsTotal);
register.registerMetric(activeUsers);
register.registerMetric(eventsCreated);
register.registerMetric(applicationsSubmitted);
register.registerMetric(databaseConnections);

// Middleware to collect HTTP metrics
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestDurationMicroseconds
      .labels(req.method, route, res.statusCode)
      .observe(duration / 1000);
    
    httpRequestsTotal
      .labels(req.method, route, res.statusCode)
      .inc();
  });
  
  next();
};

// Metrics endpoint
const metricsEndpoint = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
};

module.exports = {
  register,
  metricsMiddleware,
  metricsEndpoint,
  metrics: {
    httpRequestDurationMicroseconds,
    httpRequestsTotal,
    activeUsers,
    eventsCreated,
    applicationsSubmitted,
    databaseConnections
  }
}; 