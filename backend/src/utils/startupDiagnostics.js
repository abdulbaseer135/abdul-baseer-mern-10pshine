const ENV_KEYS = new Set(['PORT', 'MONGO_URI', 'JWT_SECRET', 'FRONTEND_URL', 'BACKEND_URL', 'CLIENT_URL', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET', 'EMAIL_FROM', 'RESEND_API_KEY', 'EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_SECURE', 'EMAIL_USER', 'EMAIL_PASS']);

const configurationError = (message, keys, reason) => {
  const error = new Error(message);
  error.code = 'INVALID_CONFIGURATION';
  error.configuration = keys.filter((key) => ENV_KEYS.has(key)).map((variable) => ({ variable, reason }));
  return error;
};

// Never serialize an error, message, stack, URI, or connection options here.
const startupDiagnostic = (phase, error) => {
  let category = 'unexpected_error';
  if (error?.code === 'INVALID_CONFIGURATION') category = 'configuration';
  else if (error?.code === 'EADDRINUSE') category = 'port_in_use';
  else if (error?.code === 'EACCES') category = 'permission_denied';
  else if ([18, 13].includes(error?.code) || (error?.code === 8000 && /bad auth|authentication failed|authentication failure/i.test(error?.message || ''))) category = 'database_authorization';
  else if (['ENOTFOUND', 'EAI_AGAIN', 'ESERVFAIL'].includes(error?.code)) category = 'dns';
  else if (['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT'].includes(error?.code)) category = 'network';
  else if (['MongoParseError', 'MongoInvalidArgumentError'].includes(error?.name)) category = 'database_uri_format';
  else if (['MongoServerSelectionError', 'MongooseServerSelectionError'].includes(error?.name)) category = 'database_server_selection';
  else if (error?.name === 'MongoNetworkError') category = 'database_network';
  const diagnostic = { event: 'startup_failed', phase, category };
  if (category === 'configuration') {
    diagnostic.configuration = (error.configuration || []).filter((item) =>
      ENV_KEYS.has(item.variable) && ['missing', 'invalid_format', 'weak_secret'].includes(item.reason))
      .map(({ variable, reason }) => ({ variable, reason }));
  }
  return diagnostic;
};

module.exports = { configurationError, startupDiagnostic };
