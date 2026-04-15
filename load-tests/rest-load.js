import http from "k6/http";
import { check, sleep } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";

const seedData = JSON.parse(open("./seed-data.json"));
const BASE_URL = __ENV.BASE_URL || seedData.baseUrl || "http://127.0.0.1:3000";

const endpointDefs = [
  { key: "get_posts", method: "GET", path: "/api/posts" },
  { key: "get_groups", method: "GET", path: "/api/groups" },
  { key: "get_notifications", method: "GET", path: "/api/notifications" },
  { key: "get_resources", method: "GET", path: "/api/resources" },
  { key: "create_post", method: "POST", path: "/api/posts" },
  { key: "like_post", method: "POST", path: "/api/posts/{postId}/like" },
];

const endpointMetrics = {};
for (const endpoint of endpointDefs) {
  endpointMetrics[endpoint.key] = {
    latency: new Trend(`latency_${endpoint.key}`, true),
    errors: new Rate(`errors_${endpoint.key}`),
    requests: new Counter(`requests_${endpoint.key}`),
    coldStarts: new Counter(`cold_starts_${endpoint.key}`),
    coldLatency: new Trend(`cold_latency_${endpoint.key}`, true),
    status2xx: new Counter(`status_2xx_${endpoint.key}`),
    status4xx: new Counter(`status_4xx_${endpoint.key}`),
    status5xx: new Counter(`status_5xx_${endpoint.key}`),
  };
}

const fastSeen = {};

export const options = {
  summaryTrendStats: ["avg", "min", "med", "max", "p(95)", "p(99)"],
  stages: [
    { duration: "30s", target: 1 },
    { duration: "60s", target: 10 },
    { duration: "60s", target: 50 },
    { duration: "60s", target: 100 },
    { duration: "30s", target: 0 },
  ],
};

function pickUser() {
  const idx = (__VU + __ITER) % seedData.users.length;
  return seedData.users[idx];
}

function execute(def, user) {
  let path = def.path;
  if (path.includes("{postId}")) {
    const postId = seedData.postIds[(__VU + __ITER) % seedData.postIds.length];
    path = path.replace("{postId}", postId);
  }
  const url = `${BASE_URL}${path}`;
  const headers = { Cookie: user.cookie };
  let response;

  if (def.method === "POST" && path === "/api/posts") {
    response = http.post(
      url,
      JSON.stringify({ content: `k6 post vu=${__VU} iter=${__ITER} t=${Date.now()}` }),
      { headers: { ...headers, "Content-Type": "application/json" } }
    );
  } else if (def.method === "POST") {
    response = http.post(url, null, { headers });
  } else {
    response = http.get(url, { headers });
  }

  const m = endpointMetrics[def.key];
  const duration = response.timings.duration;
  m.latency.add(duration);
  m.requests.add(1);

  const ok = check(response, { [`${def.key} status < 400`]: (r) => r.status < 400 });
  m.errors.add(!ok);

  if (response.status >= 200 && response.status < 300) m.status2xx.add(1);
  else if (response.status >= 400 && response.status < 500) m.status4xx.add(1);
  else if (response.status >= 500) m.status5xx.add(1);

  if (!fastSeen[def.key] && duration < 200) {
    fastSeen[def.key] = true;
  } else if (fastSeen[def.key] && duration > 500) {
    m.coldStarts.add(1);
    m.coldLatency.add(duration);
    console.log(`[cold-start] ${new Date().toISOString()} ${def.method} ${path} ${Math.round(duration)}ms`);
  }
}

export default function () {
  const user = pickUser();
  const endpoint = endpointDefs[__ITER % endpointDefs.length];
  execute(endpoint, user);
  sleep(0.5);
}

function metricValue(metrics, name, key, fallback = 0) {
  if (!metrics[name] || !metrics[name].values) return fallback;
  return metrics[name].values[key] ?? fallback;
}

export function handleSummary(data) {
  const testDurationSec = data.state.testRunDurationMs / 1000;
  const rows = endpointDefs.map((endpoint) => {
    const reqCount = metricValue(data.metrics, `requests_${endpoint.key}`, "count", 0);
    const errorsRate = metricValue(data.metrics, `errors_${endpoint.key}`, "rate", 0);
    const coldCount = metricValue(data.metrics, `cold_starts_${endpoint.key}`, "count", 0);

    const status2xx = metricValue(data.metrics, `status_2xx_${endpoint.key}`, "count", 0);
    const status4xx = metricValue(data.metrics, `status_4xx_${endpoint.key}`, "count", 0);
    const status5xx = metricValue(data.metrics, `status_5xx_${endpoint.key}`, "count", 0);

    return {
      endpoint: endpoint.path.replace("{postId}", ":postId"),
      method: endpoint.method,
      p50_ms: metricValue(data.metrics, `latency_${endpoint.key}`, "med", 0),
      p95_ms: metricValue(data.metrics, `latency_${endpoint.key}`, "p(95)", 0),
      p99_ms: metricValue(data.metrics, `latency_${endpoint.key}`, "p(99)", 0),
      rps: testDurationSec > 0 ? reqCount / testDurationSec : 0,
      error_rate_pct: errorsRate * 100,
      status_codes: {
        "2xx": status2xx,
        "4xx": status4xx,
        "5xx": status5xx,
      },
      cold_start_events: coldCount,
      cold_start_avg_ms: metricValue(data.metrics, `cold_latency_${endpoint.key}`, "avg", 0),
    };
  });

  return {
    "results/rest-load-summary.json": JSON.stringify(rows, null, 2),
  };
}
