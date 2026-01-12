/**
 * Custom Metrics Module
 * 
 * Defines custom metrics for detailed performance tracking.
 * These metrics provide insights beyond standard K6 metrics.
 * 
 * @see https://k6.io/docs/using-k6/metrics/
 */

import { Counter, Trend, Rate, Gauge } from 'k6/metrics';

/**
 * Authentication Metrics
 */
export const authMetrics = {
  // Login success rate
  loginSuccess: new Rate('login_success_rate'),
  
  // Login duration
  loginDuration: new Trend('login_duration'),
  
  // Failed login attempts
  loginFailures: new Counter('login_failures'),
  
  // JWT token reuse
  tokenReuse: new Counter('jwt_token_reuse'),
};

/**
 * Business Metrics
 */
export const businessMetrics = {
  // Expedients operations
  expedientsFetched: new Counter('expedients_fetched'),
  expedientsFetchDuration: new Trend('expedients_fetch_duration'),
  
  // Signatures operations
  signaturesPending: new Gauge('signatures_pending_count'),
  signaturesFetchDuration: new Trend('signatures_fetch_duration'),
  
  // Notifications
  notificationsFetched: new Counter('notifications_fetched'),
  notificationsDuration: new Trend('notifications_duration'),
  
  // Court operations
  courtExpedientsDuration: new Trend('court_expedients_duration'),
};

/**
 * Error Tracking Metrics
 */
export const errorMetrics = {
  // HTTP errors by status code
  http4xx: new Counter('http_errors_4xx'),
  http5xx: new Counter('http_errors_5xx'),
  
  // Timeouts
  requestTimeouts: new Counter('request_timeouts'),
  
  // Failed checks
  checkFailures: new Counter('check_failures'),
};

/**
 * Performance Metrics
 */
export const performanceMetrics = {
  // Page load times
  pageLoadTime: new Trend('page_load_time'),
  
  // API response times by endpoint
  apiResponseTime: new Trend('api_response_time'),
  
  // Data transfer
  dataSent: new Counter('data_sent_bytes'),
  dataReceived: new Counter('data_received_bytes'),
};

/**
 * Track successful login
 * @param {number} duration - Login duration in ms
 */
export function trackLogin(duration, success = true) {
  authMetrics.loginSuccess.add(success);
  authMetrics.loginDuration.add(duration);
  
  if (!success) {
    authMetrics.loginFailures.add(1);
    errorMetrics.checkFailures.add(1);
  }
}

/**
 * Track JWT token reuse
 */
export function trackTokenReuse() {
  authMetrics.tokenReuse.add(1);
}

/**
 * Track expedient fetch operation
 * @param {number} duration - Operation duration in ms
 * @param {number} count - Number of expedients fetched
 */
export function trackExpedients(duration, count = 0) {
  businessMetrics.expedientsFetched.add(count);
  businessMetrics.expedientsFetchDuration.add(duration);
}

/**
 * Track HTTP error
 * @param {number} statusCode - HTTP status code
 */
export function trackHttpError(statusCode) {
  if (statusCode >= 400 && statusCode < 500) {
    errorMetrics.http4xx.add(1);
  } else if (statusCode >= 500) {
    errorMetrics.http5xx.add(1);
  }
}

/**
 * Track API call
 * @param {string} endpoint - API endpoint name
 * @param {number} duration - Response time in ms
 * @param {Object} response - HTTP response object
 */
export function trackApiCall(endpoint, duration, response) {
  performanceMetrics.apiResponseTime.add(duration, { endpoint });
  
  if (response.status >= 400) {
    trackHttpError(response.status);
  }
  
  // Track data transfer
  if (response.body) {
    performanceMetrics.dataReceived.add(response.body.length);
  }
}

/**
 * Export all metrics for easy access
 */
export const allMetrics = {
  ...authMetrics,
  ...businessMetrics,
  ...errorMetrics,
  ...performanceMetrics,
};
