/**
 * K6 Test Configuration Profiles
 * 
 * This file defines different testing strategies with their respective
 * virtual users (VUs), duration, and thresholds.
 * 
 * @see https://k6.io/docs/using-k6/k6-options/
 */

export const strategies = {
  /**
   * Smoke Test - Minimal load to verify system basic functionality
   * Use case: Quick sanity check, CI/CD pipeline
   */
  smoke: {
    vus: 2,
    duration: '1m',
    thresholds: {
      http_req_duration: ['p(95)<2000', 'p(99)<3000'],
      http_req_failed: ['rate<0.05'],
      checks: ['rate>0.95'],
    },
  },

  /**
   * Load Test - Normal expected load
   * Use case: Baseline performance testing
   */
  load: {
    stages: [
      { duration: '2m', target: 10 },  // Ramp up
      { duration: '5m', target: 10 },  // Steady state
      { duration: '2m', target: 0 },   // Ramp down
    ],
    thresholds: {
      http_req_duration: ['p(95)<2000', 'p(99)<3000'],
      http_req_failed: ['rate<0.01'],
      checks: ['rate>0.98'],
    },
  },

  /**
   * Stress Test - Push system beyond normal load
   * Use case: Find breaking points and stability under high load
   */
  stress: {
    stages: [
      { duration: '2m', target: 10 },   // Warm up
      { duration: '5m', target: 20 },   // Stress level
      { duration: '3m', target: 30 },   // High stress
      { duration: '2m', target: 0 },    // Recovery
    ],
    thresholds: {
      http_req_duration: ['p(95)<3000', 'p(99)<5000'],
      http_req_failed: ['rate<0.05'],
      checks: ['rate>0.90'],
    },
  },

  /**
   * Spike Test - Sudden traffic increase
   * Use case: Test system resilience to sudden traffic spikes
   */
  spike: {
    stages: [
      { duration: '30s', target: 5 },    // Baseline
      { duration: '1m', target: 50 },    // Spike!
      { duration: '30s', target: 5 },    // Recovery
      { duration: '30s', target: 0 },    // Cool down
    ],
    thresholds: {
      http_req_duration: ['p(95)<5000'],
      http_req_failed: ['rate<0.10'],
      checks: ['rate>0.85'],
    },
  },

  /**
   * Soak Test - Extended duration at normal load
   * Use case: Detect memory leaks, degradation over time
   */
  soak: {
    stages: [
      { duration: '2m', target: 10 },    // Ramp up
      { duration: '30m', target: 10 },   // Extended duration
      { duration: '2m', target: 0 },     // Ramp down
    ],
    thresholds: {
      http_req_duration: ['p(95)<2000', 'p(99)<3000'],
      http_req_failed: ['rate<0.01'],
      checks: ['rate>0.98'],
    },
  },

  /**
   * Average Test - Quick realistic load test
   * Use case: Regular performance checks
   */
  average: {
    stages: [
      { duration: '1m', target: 5 },
      { duration: '3m', target: 5 },
      { duration: '1m', target: 0 },
    ],
    thresholds: {
      http_req_duration: ['p(95)<2000', 'p(99)<3000'],
      http_req_failed: ['rate<0.02'],
      checks: ['rate>0.95'],
    },
  },
};

/**
 * Get test strategy configuration
 * @param {string} strategyName - Name of the strategy
 * @returns {Object} K6 options object
 */
export function getStrategy(strategyName = 'smoke') {
  const strategy = strategies[strategyName];
  
  if (!strategy) {
    console.warn(`Strategy "${strategyName}" not found. Using "smoke" as fallback.`);
    return strategies.smoke;
  }
  
  return strategy;
}

/**
 * Common options to be merged with strategy
 */
export const commonOptions = {
  // Disable connection reuse for more realistic testing
  noConnectionReuse: false,
  
  // User agent
  userAgent: 'K6-PerformanceTest/2.0',
  
  // Timeout configurations
  httpDebug: 'full',
  
  // Tags for better organization
  tags: {
    test_type: 'performance',
  },
  
  // Summary configuration
  summaryTrendStats: ['min', 'avg', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
  
  // Graceful stop
  gracefulStop: '10s',
};
