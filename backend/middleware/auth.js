/**
 * Authentication Middleware
 * Validates requests have required authentication headers
 */
export const validateSalesforceAuth = (req, res, next) => {
  const { access_token, instance_url } = req.headers;

  if (!access_token || !instance_url) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing Salesforce authentication headers',
    });
  }

  // Attach to request object for use in routes
  req.salesforce = {
    accessToken: access_token,
    instanceUrl: instance_url,
  };

  next();
};

/**
 * Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Server Error:', err);

  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong',
  });
};
