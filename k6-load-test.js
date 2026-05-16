import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp-up to 20 users
    { duration: '1m', target: 20 },  // Stay at 20 users
    { duration: '30s', target: 0 },  // Ramp-down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must be under 500ms
  },
};

export default function () {
  const res = http.get('http://localhost:4000/api/jobs');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response has jobs': (r) => r.json().jobs.length >= 0,
  });
  sleep(1);
}
