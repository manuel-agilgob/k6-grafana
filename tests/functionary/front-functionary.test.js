/**
 * Functionary Application - Performance Test
 * 
 * Professional load testing suite for the Functionary application.
 * Tests critical user workflows including authentication, expedient management,
 * signatures, and notifications.
 * 
 * @see README.md for execution instructions
 */

import { sleep } from '../utils/helpers.js';
import { getStrategy, commonOptions } from '../config/strategies.js';
import { getEnvironment, getApplication, defaultHeaders } from '../config/environments.js';
import { getOrCreateToken, createAuthHeaders } from '../services/auth.service.js';
import { executeFunctionaryWorkflow } from '../services/functionary.service.js';
import { loadTestData, logTestConfig, getUserForVU } from '../utils/helpers.js';

// ============================================
// Test Configuration
// ============================================

const STRATEGY = __ENV.STRATEGY || 'smoke';
const ENVIRONMENT = __ENV.ENVIRONMENT || 'sandbox';
const APPLICATION = __ENV.APPLICATION || 'functionary';

// Load configurations
const strategy = getStrategy(STRATEGY);
const environment = getEnvironment(ENVIRONMENT);
const application = getApplication(APPLICATION);

// Load test data
const usersData = loadTestData('./data/users.sandbox.json', 'users');
const testData = usersData[0];
const users = testData.users.filter(user => user.app_id === application.id);

// API configuration
const baseUrl = environment.apiBaseUrl;
const baseHeaders = {
  ...defaultHeaders,
  Authorization: environment.authorization,
};

// ============================================
// K6 Test Options
// ============================================

export const options = {
  ...strategy,
  ...commonOptions,
  
  // Additional thresholds for business metrics
  thresholds: {
    ...strategy.thresholds,
    
    // Custom metrics thresholds
    'login_duration': ['p(95)<2000'],
    'login_success_rate': ['rate>0.95'],
    'expedients_fetch_duration': ['p(95)<2000'],
    'signatures_fetch_duration': ['p(95)<2000'],
    
    // HTTP metrics
    'http_req_duration{endpoint:expedients_user}': ['p(95)<2000'],
    'http_req_duration{endpoint:expedients_court}': ['p(95)<2000'],
    'http_req_duration{endpoint:signatures}': ['p(95)<2000'],
  },
  
  // Test metadata
  tags: {
    test_name: 'functionary_performance_test',
    application: APPLICATION,
    environment: ENVIRONMENT,
    strategy: STRATEGY,
  },
};

// ============================================
// Test Lifecycle Hooks
// ============================================

/**
 * Setup - Runs once before test execution
 */
export function setup() {
  logTestConfig();
  
  console.log('📋 Test Configuration:');
  console.log(`   Users loaded: ${users.length}`);
  console.log(`   Base URL: ${baseUrl}`);
  console.log(`   VUs: ${strategy.vus || 'dynamic'}`);
  console.log('');
  
  return {
    baseUrl,
    users,
    baseHeaders,
    application,
  };
}

/**
 * Main test function - Executed by each VU
 * 
 * @param {Object} data - Data from setup
 */
export default function(data) {
  const vuId = __VU;
  const user = getUserForVU(data.users, vuId);
  
  // Get or create JWT token for this VU
  const authInfo = getOrCreateToken(
    vuId,
    data.baseUrl,
    data.baseHeaders,
    user
  );
  
  if (!authInfo.success) {
    console.error(`❌ [VU ${vuId}] Authentication failed, skipping iteration`);
    sleep(5);
    return;
  }
  
  // Create authorized headers
  const authHeaders = createAuthHeaders(data.baseHeaders, authInfo.jwt);
  
  // Execute main functionary workflow
  executeFunctionaryWorkflow(
    data.baseUrl,
    authHeaders,
    authInfo.userId,
    sleep
  );
  
  // Random think time between iterations
  sleep(2, 0.3);
}

/**
 * Teardown - Runs once after test completion
 * 
 * @param {Object} data - Data from setup
 */
export function teardown(data) {
  console.log('\n' + '='.repeat(60));
  console.log('✅ Test Execution Completed');
  console.log('='.repeat(60));
  console.log(`⏰ Finished at: ${new Date().toISOString()}`);
  console.log('📊 Check the reports directory for detailed results');
  console.log('='.repeat(60) + '\n');
}

/**
 * Custom summary handler
 * Generates multiple report formats
 */
export function handleSummary(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const testName = `functionary-${STRATEGY}-${ENVIRONMENT}`;
  
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    [`reports/${testName}-${timestamp}.json`]: JSON.stringify(data, null, 2),
  };
}

// Import for summary
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';
