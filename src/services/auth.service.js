/**
 * Authentication Service
 * 
 * Handles user authentication and JWT token management.
 */

import http from 'k6/http';
import { check } from 'k6';
import { trackLogin, trackTokenReuse } from '../config/metrics.js';
import { enhancedCheck, formatErrorMessage } from '../utils/helpers.js';

/**
 * JWT Token Cache
 * Stores tokens per VU to avoid unnecessary login requests
 */
const tokenCache = new Map();

/**
 * Perform user login
 * 
 * @param {string} baseUrl - API base URL
 * @param {Object} headers - HTTP headers
 * @param {Object} user - User credentials
 * @param {string} loginEndpoint - Login endpoint path
 * @returns {Object} Login result with JWT and user info
 */
export function login(baseUrl, headers, user, loginEndpoint = '/api/v1/auth/sign_in') {
  const startTime = Date.now();
  
  const loginPayload = JSON.stringify({
    email: user.email,
    password: user.password,
  });

  const response = http.post(
    `${baseUrl}${loginEndpoint}`,
    loginPayload,
    { headers, tags: { name: 'auth_login' } }
  );

  const duration = Date.now() - startTime;
  
  const checks = {
    'login: status is 200': (r) => r.status === 200,
    'login: JWT token received': (r) => {
      try {
        return r.json('data.jwt') !== undefined && r.json('data.jwt') !== null;
      } catch {
        return false;
      }
    },
    'login: user ID received': (r) => {
      try {
        return r.json('data.user.id') !== undefined;
      } catch {
        return false;
      }
    },
    'login: response time < 3s': (r) => r.timings.duration < 3000,
  };

  const checkResult = enhancedCheck(response, checks, (r) => {
    console.error(`❌ Login failed for ${user.email}`);
    console.error(formatErrorMessage(r));
  });

  trackLogin(duration, checkResult && response.status === 200);

  if (response.status === 200) {
    try {
      return {
        jwt: response.json('data.jwt'),
        userId: response.json('data.user.id'),
        email: user.email,
        success: true,
      };
    } catch (error) {
      console.error('Error parsing login response:', error);
      return { success: false, error: 'Parse error' };
    }
  }

  return { success: false, error: `Status ${response.status}` };
}

/**
 * Get cached JWT or perform login
 * Implements JWT caching per VU for better performance
 * 
 * @param {string} vuId - Virtual User ID
 * @param {string} baseUrl - API base URL
 * @param {Object} headers - HTTP headers
 * @param {Object} user - User credentials
 * @returns {Object} Auth info with JWT
 */
export function getOrCreateToken(vuId, baseUrl, headers, user) {
  const cacheKey = `vu-${vuId}`;
  
  if (tokenCache.has(cacheKey)) {
    trackTokenReuse();
    const cached = tokenCache.get(cacheKey);
    console.log(`🔄 [VU ${vuId}] Reusing JWT for ${cached.email}`);
    return cached;
  }
  
  console.log(`🔑 [VU ${vuId}] Performing initial login for ${user.email}`);
  const authInfo = login(baseUrl, headers, user);
  
  if (authInfo.success) {
    tokenCache.set(cacheKey, authInfo);
  }
  
  return authInfo;
}

/**
 * Clear token from cache
 * Useful when token expires or for testing re-authentication
 * 
 * @param {string} vuId - Virtual User ID
 */
export function clearToken(vuId) {
  const cacheKey = `vu-${vuId}`;
  tokenCache.delete(cacheKey);
  console.log(`🗑️  [VU ${vuId}] Token cleared from cache`);
}

/**
 * Validate JWT token
 * Makes a lightweight request to verify token is still valid
 * 
 * @param {string} baseUrl - API base URL
 * @param {string} jwt - JWT token
 * @param {Object} headers - HTTP headers
 * @returns {boolean} Token validity
 */
export function validateToken(baseUrl, jwt, headers) {
  const response = http.get(
    `${baseUrl}/api/v1/auth/validate`,
    {
      headers: { ...headers, Authorization: jwt },
      tags: { name: 'auth_validate' },
    }
  );
  
  return response.status === 200;
}

/**
 * Create authorization header
 * 
 * @param {string} jwt - JWT token
 * @returns {Object} Headers with authorization
 */
export function createAuthHeaders(baseHeaders, jwt) {
  return {
    ...baseHeaders,
    Authorization: jwt,
  };
}
