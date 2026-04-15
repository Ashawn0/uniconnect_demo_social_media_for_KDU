import fs from "fs";
import path from "path";

const seedData = JSON.parse(fs.readFileSync(path.resolve("seed-data.json"), "utf-8"));
const BASE_URL = process.env.BASE_URL || seedData.baseUrl || "http://127.0.0.1:3000";
const cookie = seedData.users[0].cookie;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestPosts() {
  const start = performance.now();
  const response = await fetch(`${BASE_URL}/api/posts`, {
    method: "GET",
    headers: { Cookie: cookie },
  });
  if (!response.ok) {
    throw new Error(`GET /api/posts failed with ${response.status}`);
  }
  await response.text();
  return performance.now() - start;
}

function percentile(values, p) {
  const sorted = [...values].sort((a, b) => a - b);
  const rank = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, rank)];
}

async function run() {
  const trials = [];
  const warmBaselines = [];

  for (let trial = 1; trial <= 5; trial++) {
    const warmBaseline = await requestPosts();
    warmBaselines.push(warmBaseline);
    await sleep(300000);

    const coldStart = await requestPosts();
    const warmupCurve = [];
    for (let i = 0; i < 5; i++) {
      await sleep(1000);
      warmupCurve.push(await requestPosts());
    }

    const threshold = warmBaseline * 1.2;
    let requestsToWarm = warmupCurve.length;
    for (let i = 0; i < warmupCurve.length; i++) {
      if (warmupCurve[i] <= threshold) {
        requestsToWarm = i + 1;
        break;
      }
    }

    trials.push({
      trial,
      cold_start_ms: coldStart,
      warmup_curve_ms: warmupCurve,
      requests_to_warm: requestsToWarm,
    });
  }

  const coldStarts = trials.map((t) => t.cold_start_ms);
  const summary = {
    warm_baseline_ms: warmBaselines.reduce((a, b) => a + b, 0) / warmBaselines.length,
    cold_start_trials: trials,
    cold_start_mean_ms: coldStarts.reduce((a, b) => a + b, 0) / coldStarts.length,
    cold_start_p95_ms: percentile(coldStarts, 95),
    mean_requests_to_warm:
      trials.reduce((sum, trial) => sum + trial.requests_to_warm, 0) / trials.length,
  };

  fs.writeFileSync(
    path.resolve("results/cold-start-summary.json"),
    JSON.stringify(summary, null, 2)
  );
  console.log("Wrote results/cold-start-summary.json");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
