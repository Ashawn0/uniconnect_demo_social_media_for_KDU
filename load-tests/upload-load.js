import http from "k6/http";
import { sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const seedData = JSON.parse(open("./seed-data.json"));
const BASE_URL = __ENV.BASE_URL || seedData.baseUrl || "http://127.0.0.1:3000";
const fileBin = open("./fixtures/test-file.pdf", "b");

const levels = [1, 5, 10, 20];
const levelMetrics = {};

for (const level of levels) {
  levelMetrics[level] = {
    server: new Trend(`upload_server_processing_${level}`, true),
    total: new Trend(`upload_total_${level}`, true),
    errors: new Rate(`upload_errors_${level}`),
  };
}

function cookieForVu() {
  const idx = (__VU + __ITER) % seedData.users.length;
  return seedData.users[idx].cookie;
}

function performUpload(level) {
  const payload = {
    file: http.file(fileBin, `upload-${Date.now()}.pdf`, "application/pdf"),
  };
  const res = http.post(`${BASE_URL}/api/upload`, payload, {
    headers: { Cookie: cookieForVu() },
  });
  const duration = res.timings.duration;
  levelMetrics[level].server.add(duration);
  levelMetrics[level].total.add(duration);
  levelMetrics[level].errors.add(!(res.status >= 200 && res.status < 300));
  sleep(0.2);
}

export const options = {
  summaryTrendStats: ["avg", "min", "med", "max", "p(95)", "p(99)"],
  scenarios: {
    level_1: { executor: "constant-vus", vus: 1, duration: "15s", exec: "runLevel1" },
    level_5: { executor: "constant-vus", vus: 5, duration: "15s", exec: "runLevel5", startTime: "15s" },
    level_10: { executor: "constant-vus", vus: 10, duration: "15s", exec: "runLevel10", startTime: "30s" },
    level_20: { executor: "constant-vus", vus: 20, duration: "15s", exec: "runLevel20", startTime: "45s" },
  },
};

export function runLevel1() { performUpload(1); }
export function runLevel5() { performUpload(5); }
export function runLevel10() { performUpload(10); }
export function runLevel20() { performUpload(20); }

function v(data, metric, key, fallback = 0) {
  if (!data.metrics[metric] || !data.metrics[metric].values) return fallback;
  return data.metrics[metric].values[key] ?? fallback;
}

export function handleSummary(data) {
  const concurrencyLevels = levels.map((level) => ({
    concurrent_users: level,
    server_processing_p50_ms: v(data, `upload_server_processing_${level}`, "med"),
    server_processing_p95_ms: v(data, `upload_server_processing_${level}`, "p(95)"),
    total_upload_p50_ms: v(data, `upload_total_${level}`, "med"),
    total_upload_p95_ms: v(data, `upload_total_${level}`, "p(95)"),
    error_rate_pct: v(data, `upload_errors_${level}`, "rate") * 100,
  }));

  const exceeded = concurrencyLevels.find((x) => x.total_upload_p95_ms > 2000);
  const summary = {
    concurrency_levels: concurrencyLevels,
    p95_exceeds_2000ms_at_concurrency: exceeded ? exceeded.concurrent_users : 0,
  };

  return {
    "results/upload-load-summary.json": JSON.stringify(summary, null, 2),
  };
}
