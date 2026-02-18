import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    constant_load: {
      executor: 'constant-vus',
      vus: 100,
      duration: '10m',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const res = http.get(`${BASE_URL}/health`);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}

export function handleSummary(data) {
  const service = __ENV.SERVICE_NAME || 'unknown';
  const resultsDir = __ENV.RESULTS_DIR || './results';
  
  return {
    [`${resultsDir}/${service}_stress.json`]: JSON.stringify(data, null, 2),
  };
}
