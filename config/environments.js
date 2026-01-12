/**
 * Environment Configuration Module
 * 
 * Manages environment-specific configurations for different testing environments.
 * Supports loading from environment variables with fallback defaults.
 */

/**
 * Environment configurations
 */
export const environments = {
  sandbox: {
    name: 'sandbox',
    apiBaseUrl: __ENV.API_BASE_URL_SANDBOX || 'https://api-sandbox.example.com',
    authorization: __ENV.API_AUTHORIZATION_SANDBOX || 'Bearer default-sandbox-token',
    timeoutMs: 10000,
    description: 'Sandbox environment for testing',
  },
  
  production: {
    name: 'production',
    apiBaseUrl: __ENV.API_BASE_URL_PRODUCTION || 'https://api.example.com',
    authorization: __ENV.API_AUTHORIZATION_PRODUCTION || 'Bearer default-prod-token',
    timeoutMs: 5000,
    description: 'Production environment',
  },
  
  local: {
    name: 'local',
    apiBaseUrl: __ENV.API_BASE_URL_LOCAL || 'http://localhost:3000',
    authorization: __ENV.API_AUTHORIZATION_LOCAL || 'Bearer local-token',
    timeoutMs: 15000,
    description: 'Local development environment',
  },
};

/**
 * Get environment configuration
 * @param {string} envName - Environment name (sandbox, production, local)
 * @returns {Object} Environment configuration
 */
export function getEnvironment(envName = 'sandbox') {
  const env = environments[envName];
  
  if (!env) {
    console.warn(`Environment "${envName}" not found. Using "sandbox" as fallback.`);
    return environments.sandbox;
  }
  
  console.log(`🌍 Environment: ${env.name} - ${env.description}`);
  console.log(`📡 API Base URL: ${env.apiBaseUrl}`);
  
  return env;
}

/**
 * Application-specific configurations
 */
export const applications = {
  functionary: {
    id: 3,
    name: 'Functionary Application',
    endpoints: {
      login: '/api/v1/auth/sign_in',
      expedientsByUser: (userId, page = 1) => `/api/v1/electronic_expedients/find/user/${userId}/1/10?page=${page}`,
      expedientsByCourt: (page = 1) => `/api/v1/electronic_expedients/find_by_court/10?page=${page}`,
      pendingSignatures: (limit = 10) => `/api/v1/signature_documents/get_documents_pending_signature_by_user/${limit}`,
      pushNotifications: (limit = 20, page = 1) => `/api/v1/push_notifications/${limit}?page=${page}`,
      matters: '/api/v1/matters/get_list',
    },
  },
  
  citizen: {
    id: 2,
    name: 'Citizen Application',
    endpoints: {
      login: '/api/v1/auth/sign_in',
      // Add citizen-specific endpoints here
    },
  },
};

/**
 * Get application configuration
 * @param {string} appName - Application name
 * @returns {Object} Application configuration
 */
export function getApplication(appName = 'functionary') {
  const app = applications[appName];
  
  if (!app) {
    console.warn(`Application "${appName}" not found. Using "functionary" as fallback.`);
    return applications.functionary;
  }
  
  console.log(`📱 Application: ${app.name}`);
  
  return app;
}

/**
 * Default HTTP headers
 */
export const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json, text/plain, */*',
  'User-Agent': 'K6-PerformanceTest/2.0',
};
