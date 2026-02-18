import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  scenarios: {
    // Scenario 1: Warmup
    warmup: {
      executor: 'constant-vus',
      vus: 10,
      duration: '30s',
      startTime: '0s',
    },
    // Scenario 2: Load test
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 100 },   // Ramp up to 100 users
        { duration: '2m', target: 100 },   // Stay at 100 users
        { duration: '1m', target: 500 },   // Ramp up to 500 users
        { duration: '2m', target: 500 },   // Stay at 500 users
        { duration: '1m', target: 1000 },  // Ramp up to 1000 users (peak)
        { duration: '3m', target: 1000 },  // Stay at 1000 users
        { duration: '1m', target: 0 },     // Ramp down
      ],
      startTime: '30s',
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% requests < 500ms, 99% < 1000ms
    http_req_failed: ['rate<0.1'],  // Less than 10% failures
    errors: ['rate<0.1'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const requests = [
    // Health check
    {
      method: 'GET',
      url: `${BASE_URL}/health`,
      params: { tags: { name: 'health' } },
    },
    // Get users list
    {
      method: 'GET',
      url: `${BASE_URL}/users`,
      params: { tags: { name: 'users_list' } },
    },
    // Get specific user
    {
      method: 'GET',
      url: `${BASE_URL}/users/1`,
      params: { tags: { name: 'user_detail' } },
    },
    // Get events list
    {
      method: 'GET',
      url: `${BASE_URL}/events`,
      params: { tags: { name: 'events_list' } },
    },
    // Get specific event
    {
      method: 'GET',
      url: `${BASE_URL}/events/1`,
      params: { tags: { name: 'event_detail' } },
    },
  ];

  // Execute requests
  requests.forEach((req) => {
    const res = http.get(req.url, req.params);
    
    const success = check(res, {
      'status is 200': (r) => r.status === 200,
      'response time OK': (r) => r.timings.duration < 1000,
    });
    
    errorRate.add(!success);
  });

  // Simulate user think time
  sleep(Math.random() * 2 + 1); // Random sleep between 1-3 seconds
}

export function handleSummary(data) {
  const service = __ENV.SERVICE_NAME || 'unknown';
  const resultsDir = __ENV.RESULTS_DIR || './results';
  
  return {
    [`${resultsDir}/${service}_summary.json`]: JSON.stringify(data, null, 2),
  };
}
