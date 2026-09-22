import http from 'k6/http';
import { check, sleep } from 'k6';

const mode = __ENV.MODE || 'normal';

export const options = {
  vus: 1,
  duration: '10s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
  },
};

export default function () {
  const response = http.get(
    `http://127.0.0.1:8000/work?mode=${mode}`
  );

  check(response, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
