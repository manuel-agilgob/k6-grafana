/**
 * Functionary Service
 * 
 * Business logic for functionary application endpoints.
 * Handles expedients, signatures, notifications, and other functionary operations.
 */

import http from 'k6/http';
import { check } from 'k6';
import { 
  trackExpedients, 
  trackApiCall,
  businessMetrics 
} from '../config/metrics.js';
import { enhancedCheck, formatErrorMessage, validateResponse } from '../utils/helpers.js';

/**
 * Get expedients by user
 * 
 * @param {string} baseUrl - API base URL
 * @param {Object} headers - HTTP headers with auth
 * @param {string} userId - User ID
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} Response data
 */
export function getExpedientsByUser(baseUrl, headers, userId, page = 1, limit = 10) {
  const startTime = Date.now();
  const url = `${baseUrl}/api/v1/electronic_expedients/find/user/${userId}/1/${limit}?page=${page}`;
  
  const response = http.get(url, {
    headers,
    tags: { name: 'get_expedients_by_user', endpoint: 'expedients_user' },
  });

  const duration = Date.now() - startTime;
  trackApiCall('expedients_by_user', duration, response);

  const checks = {
    'expedients by user: status 200': (r) => r.status === 200,
    'expedients by user: has data': (r) => validateResponse(r, ['data']),
    'expedients by user: response time < 2s': (r) => r.timings.duration < 2000,
  };

  enhancedCheck(response, checks, (r) => {
    console.error(`❌ Get expedients by user failed for user ${userId}`);
    console.error(formatErrorMessage(r));
  });

  // Track metrics
  if (response.status === 200) {
    try {
      const data = response.json('data');
      const count = data?.expedients?.length || 0;
      trackExpedients(duration, count);
    } catch (error) {
      console.error('Error parsing expedients response:', error);
    }
  }

  return response;
}

/**
 * Get expedients by court
 * 
 * @param {string} baseUrl - API base URL
 * @param {Object} headers - HTTP headers with auth
 * @param {number} limit - Items per page
 * @param {number} page - Page number
 * @returns {Object} Response data
 */
export function getExpedientsByCourt(baseUrl, headers, limit = 10, page = 1) {
  const startTime = Date.now();
  const url = `${baseUrl}/api/v1/electronic_expedients/find_by_court/${limit}?page=${page}`;
  
  const response = http.get(url, {
    headers,
    tags: { name: 'get_expedients_by_court', endpoint: 'expedients_court' },
  });

  const duration = Date.now() - startTime;
  trackApiCall('expedients_by_court', duration, response);
  businessMetrics.courtExpedientsDuration.add(duration);

  const checks = {
    'expedients by court: status 200': (r) => r.status === 200,
    'expedients by court: has data': (r) => validateResponse(r, ['data']),
    'expedients by court: response time < 2s': (r) => r.timings.duration < 2000,
  };

  enhancedCheck(response, checks, (r) => {
    console.error('❌ Get expedients by court failed');
    console.error(formatErrorMessage(r));
  });

  return response;
}

/**
 * Get pending signatures
 * 
 * @param {string} baseUrl - API base URL
 * @param {Object} headers - HTTP headers with auth
 * @param {number} limit - Number of documents to retrieve
 * @returns {Object} Response data
 */
export function getPendingSignatures(baseUrl, headers, limit = 10) {
  const startTime = Date.now();
  const url = `${baseUrl}/api/v1/signature_documents/get_documents_pending_signature_by_user/${limit}`;
  
  const response = http.get(url, {
    headers,
    tags: { name: 'get_pending_signatures', endpoint: 'signatures' },
  });

  const duration = Date.now() - startTime;
  trackApiCall('pending_signatures', duration, response);
  businessMetrics.signaturesFetchDuration.add(duration);

  const checks = {
    'pending signatures: status 200': (r) => r.status === 200,
    'pending signatures: has data': (r) => validateResponse(r, ['data']),
    'pending signatures: has signature documents': (r) => {
      try {
        const docs = r.json('data.signatureDocuments');
        return docs !== undefined && docs !== null;
      } catch {
        return false;
      }
    },
    'pending signatures: response time < 2s': (r) => r.timings.duration < 2000,
  };

  enhancedCheck(response, checks, (r) => {
    console.error('❌ Get pending signatures failed');
    console.error(formatErrorMessage(r));
  });

  // Track pending count
  if (response.status === 200) {
    try {
      const docs = response.json('data.signatureDocuments');
      const count = Array.isArray(docs) ? docs.length : 0;
      businessMetrics.signaturesPending.add(count);
    } catch (error) {
      console.error('Error parsing signatures response:', error);
    }
  }

  return response;
}

/**
 * Get push notifications
 * 
 * @param {string} baseUrl - API base URL
 * @param {Object} headers - HTTP headers with auth
 * @param {number} limit - Number of notifications
 * @param {number} page - Page number
 * @returns {Object} Response data
 */
export function getPushNotifications(baseUrl, headers, limit = 20, page = 1) {
  const startTime = Date.now();
  const url = `${baseUrl}/api/v1/push_notifications/${limit}?page=${page}`;
  
  const response = http.get(url, {
    headers,
    tags: { name: 'get_push_notifications', endpoint: 'notifications' },
  });

  const duration = Date.now() - startTime;
  trackApiCall('push_notifications', duration, response);
  businessMetrics.notificationsDuration.add(duration);

  const checks = {
    'push notifications: status 200': (r) => r.status === 200,
    'push notifications: has notifications': (r) => {
      try {
        return r.json('data.notifications') !== undefined;
      } catch {
        return false;
      }
    },
    'push notifications: response time < 2s': (r) => r.timings.duration < 2000,
  };

  enhancedCheck(response, checks, (r) => {
    console.error('❌ Get push notifications failed');
    console.error(formatErrorMessage(r));
  });

  // Track count
  if (response.status === 200) {
    try {
      const notifications = response.json('data.notifications');
      const count = Array.isArray(notifications) ? notifications.length : 0;
      businessMetrics.notificationsFetched.add(count);
    } catch (error) {
      console.error('Error parsing notifications response:', error);
    }
  }

  return response;
}

/**
 * Get matters list
 * 
 * @param {string} baseUrl - API base URL
 * @param {Object} headers - HTTP headers with auth
 * @returns {Object} Response data
 */
export function getMatters(baseUrl, headers) {
  const startTime = Date.now();
  const url = `${baseUrl}/api/v1/matters/get_list`;
  
  const response = http.get(url, {
    headers,
    tags: { name: 'get_matters', endpoint: 'matters' },
  });

  const duration = Date.now() - startTime;
  trackApiCall('matters', duration, response);

  const checks = {
    'matters: status 200': (r) => r.status === 200,
    'matters: status is true': (r) => {
      try {
        return r.json('status') === true;
      } catch {
        return false;
      }
    },
    'matters: has data': (r) => validateResponse(r, ['data']),
    'matters: response time < 1.5s': (r) => r.timings.duration < 1500,
  };

  enhancedCheck(response, checks, (r) => {
    console.error('❌ Get matters failed');
    console.error(formatErrorMessage(r));
  });

  return response;
}

/**
 * Simulate complete user workflow
 * Executes a realistic sequence of operations a functionary would perform
 * 
 * @param {string} baseUrl - API base URL
 * @param {Object} headers - HTTP headers with auth
 * @param {string} userId - User ID
 * @param {Function} sleepFn - Sleep function
 * @returns {Object} Workflow results
 */
export function executeFunctionaryWorkflow(baseUrl, headers, userId, sleepFn) {
  const results = {
    expedientsByUser: null,
    expedientsByCourt: null,
    pendingSignatures: null,
    // notifications: null,
  };

  // Step 1: Check user's expedients
  sleepFn(1);
  results.expedientsByUser = getExpedientsByUser(baseUrl, headers, userId);

  // Step 2: Check court expedients
  sleepFn(1);
  results.expedientsByCourt = getExpedientsByCourt(baseUrl, headers);

  // Step 3: Check pending signatures
  sleepFn(1);
  results.pendingSignatures = getPendingSignatures(baseUrl, headers);

  // Step 4: Check notifications
  // sleepFn(1);
  // results.notifications = getPushNotifications(baseUrl, headers);

  return results;
}
