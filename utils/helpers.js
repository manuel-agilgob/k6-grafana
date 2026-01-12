/**
 * Utility Functions for K6 Tests
 * 
 * Common helper functions used across tests.
 */

import { check, sleep as k6Sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

/**
 * Smart sleep with random variance
 * Adds more realistic user behavior patterns
 * 
 * @param {number} duration - Base duration in seconds
 * @param {number} variance - Variance percentage (0-1)
 */
export function sleep(duration = 1, variance = 0.2) {
  const min = duration * (1 - variance);
  const max = duration * (1 + variance);
  const randomDuration = min + Math.random() * (max - min);
  k6Sleep(randomDuration);
}

/**
 * Enhanced check with custom metrics
 * 
 * @param {Object} response - HTTP response
 * @param {Object} checks - Check conditions
 * @param {Function} onFailure - Callback on check failure
 * @returns {boolean} - Check result
 */
export function enhancedCheck(response, checks, onFailure = null) {
  const result = check(response, checks);
  
  if (!result && onFailure) {
    onFailure(response);
  }
  
  return result;
}

/**
 * Load test data from JSON file
 * Uses SharedArray for memory efficiency across VUs
 * 
 * @param {string} filePath - Path to JSON file
 * @param {string} name - SharedArray name
 * @returns {Array} Data array
 */
export function loadTestData(filePath, name = 'test-data') {
  return new SharedArray(name, function() {
    const data = JSON.parse(open(filePath));
    return Array.isArray(data) ? data : [data];
  });
}

/**
 * Get user for current VU
 * Distributes users across VUs in a round-robin fashion
 * 
 * @param {Array} users - Array of users
 * @param {number} vuId - Virtual User ID
 * @returns {Object} User object
 */
export function getUserForVU(users, vuId) {
  const index = (vuId - 1) % users.length;
  return users[index];
}

/**
 * Format error message for logging
 * 
 * @param {Object} response - HTTP response
 * @returns {string} Formatted error message
 */
export function formatErrorMessage(response) {
  return `
    Status: ${response.status}
    URL: ${response.url}
    Body: ${response.body ? response.body.substring(0, 200) : 'No body'}
    Duration: ${response.timings.duration}ms
  `;
}

/**
 * Retry mechanism for HTTP requests
 * 
 * @param {Function} requestFn - Function that makes the request
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delayMs - Delay between retries in ms
 * @returns {Object} Response or null
 */
export function retryRequest(requestFn, maxRetries = 3, delayMs = 1000) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = requestFn();
      if (response.status < 500) {
        return response;
      }
      lastError = response;
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${i + 1} failed:`, error);
    }
    
    if (i < maxRetries - 1) {
      k6Sleep(delayMs / 1000);
    }
  }
  
  console.error('All retry attempts failed');
  return lastError;
}

/**
 * Generate random string
 * 
 * @param {number} length - String length
 * @returns {string} Random string
 */
export function randomString(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Parse JSON safely
 * 
 * @param {string} jsonString - JSON string
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} Parsed object or default value
 */
export function safeJsonParse(jsonString, defaultValue = null) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('JSON parse error:', error);
    return defaultValue;
  }
}

/**
 * Create standardized test summary
 * 
 * @param {Object} data - K6 summary data
 * @returns {Object} Summary for multiple outputs
 */
export function createTestSummary(data) {
  const timestamp = new Date().toISOString();
  const testName = __ENV.TEST_NAME || 'Performance Test';
  
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    [`reports/summary-${timestamp}.json`]: JSON.stringify(data, null, 2),
    [`reports/report-${timestamp}.html`]: htmlReport(data),
  };
}

/**
 * Log test configuration at start
 */
export function logTestConfig() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 K6 Performance Test Starting');
  console.log('='.repeat(60));
  console.log(`📊 Strategy: ${__ENV.STRATEGY || 'smoke'}`);
  console.log(`🌍 Environment: ${__ENV.ENVIRONMENT || 'sandbox'}`);
  console.log(`📱 Application: ${__ENV.APPLICATION || 'functionary'}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log('='.repeat(60) + '\n');
}

/**
 * Calculate percentile
 * 
 * @param {Array} values - Array of numbers
 * @param {number} percentile - Percentile (0-100)
 * @returns {number} Percentile value
 */
export function calculatePercentile(values, percentile) {
  if (values.length === 0) return 0;
  
  const sorted = values.slice().sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

/**
 * Validate response structure
 * 
 * @param {Object} response - HTTP response
 * @param {Array} requiredFields - Required fields in response
 * @returns {boolean} Validation result
 */
export function validateResponse(response, requiredFields = []) {
  if (!response || response.status !== 200) {
    return false;
  }
  
  try {
    const body = safeJsonParse(response.body);
    if (!body) return false;
    
    return requiredFields.every(field => {
      const value = field.split('.').reduce((obj, key) => obj?.[key], body);
      return value !== undefined && value !== null;
    });
  } catch {
    return false;
  }
}
