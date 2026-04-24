/**
 * Functionary Service
 * 
 * Business logic for functionary application endpoints.
 * Handles expedients, signatures, notifications, and other functionary operations.
 */

import http from 'k6/http';
import { check } from 'k6';

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
export function getExpedientsByUser(baseUrl, jwt, userId, page = 1, limit = 10) {
    const headers = [
            {
                "name": "Accept",
                "value": "application/json, text/plain, */*"
            },
            {
                "name": "Accept-Encoding",
                "value": "gzip, deflate, br, zstd"
            },
            {
                "name": "Accept-Language",
                "value": "es-MX,es;q=0.9,en-US;q=0.8,en;q=0.7"
            },
            {
                "name": "Authorization",
                "value": jwt
            },
            {
                "name": "Connection",
                "value": "keep-alive"
            },
            {
                "name": "Content-Type",
                "value": "application/json"
            },
            {
                "name": "Sec-Fetch-Dest",
                "value": "empty"
            },
            {
                "name": "Sec-Fetch-Mode",
                "value": "cors"
            },
            {
                "name": "Sec-Fetch-Site",
                "value": "same-site"
            },
            {
                "name": "User-Agent",
                "value": "Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0"
            }
        ];

    const url = `${baseUrl}/api/v1/electronic_expedients/find/user/${userId}/1/${limit}?page=${page}`;

    const response = http.get(url, {
        headers,
        tags: { name: 'get_expedients_by_user', endpoint: 'expedients_user' },
    });

    const duration = response.timings.duration;

    const checks = {
        'expedients by user: status 200': (r) => r.status === 200,
        'expedients by user: response time < 2s': (r) => r.timings.duration < 2000,
    };
    check(response, checks);
}