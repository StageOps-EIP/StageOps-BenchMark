import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    spike: {
      executor: 'ramping-arrival-rate',
      startRate: 50,
      timeUnit: '1s',
      preAllocatedVUs: 100,
      maxVUs: 2000,
      stages: [
        { duration: '30s', target: 100 },   // Normal load
        { duration: '10s', target: 1000 },  // Spike!
        { duration: '1m', target: 1000 },   // Maintain spike
        { duration: '10s', target: 100 },   // Recovery
        { duration: '30s', target: 100 },   // Normal load
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(99)<2000'], // 99% requests < 2s during spike
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const responses = http.batch([
    ['GET', `${BASE_URL}/health`],
    ['GET', `${BASE_URL}/users`],
    ['GET', `${BASE_URL}/events`],
  ]);

  responses.forEach((res) => {
    check(res, {
      'status is 200': (r) => r.status === 200,
    });
  });
}

export function handleSummary(data) {
  const service = __ENV.SERVICE_NAME || 'unknown';
  const resultsDir = __ENV.RESULTS_DIR || './results';
  
  return {
    [`${resultsDir}/${service}_spike.json`]: JSON.stringify(data, null, 2),
  };
}
