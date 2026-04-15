import http from "k6/http";
import ws from "k6/ws";
import { sleep } from "k6";
import { Counter, Trend } from "k6/metrics";

const seedData = JSON.parse(open("./seed-data.json"));
const BASE_URL = __ENV.BASE_URL || seedData.baseUrl || "http://127.0.0.1:3000";
const WS_BASE_URL = BASE_URL.replace(/^http/, "ws");

const wsLatency = new Trend("ws_delivery_latency_ms", true);
const wsFailed = new Counter("ws_failed_deliveries");
const pollingLatency = new Trend("polling_delivery_latency_ms", true);

export const options = {
  summaryTrendStats: ["avg", "min", "med", "max", "p(95)", "p(99)"],
  scenarios: {
    websocket_delivery: {
      executor: "per-vu-iterations",
      vus: 20,
      iterations: 1,
      exec: "websocketScenario",
      maxDuration: "15m",
    },
    polling_delivery: {
      executor: "per-vu-iterations",
      vus: 20,
      iterations: 1,
      exec: "pollingScenario",
      startTime: "2m",
      maxDuration: "20m",
    },
  },
};

function userPair() {
  const idx = (__VU - 1) % seedData.users.length;
  const a = seedData.users[idx];
  const b = seedData.users[(idx + 1) % seedData.users.length];
  return { a, b };
}

export function websocketScenario() {
  const { a, b } = userPair();
  const pending = new Map();
  let delivered = 0;

  ws.connect(`${WS_BASE_URL}/ws`, { headers: { Cookie: b.cookie } }, (socket) => {
    socket.on("message", (raw) => {
      try {
        const event = JSON.parse(raw);
        if (event.type !== "new_message") return;
        const content = event?.payload?.content;
        if (typeof content !== "string") return;
        if (!pending.has(content)) return;
        const start = pending.get(content);
        pending.delete(content);
        wsLatency.add(Date.now() - start);
        delivered += 1;
      } catch (_e) {}
    });

    socket.setTimeout(() => {
      for (let i = 0; i < 50; i++) {
        const token = `k6-ws-${__VU}-${__ITER}-${i}-${Date.now()}`;
        const response = http.post(
          `${BASE_URL}/api/messages`,
          JSON.stringify({
            senderId: a.id,
            receiverId: b.id,
            content: token,
          }),
          { headers: { Cookie: a.cookie, "Content-Type": "application/json" } }
        );

        if (response.status >= 200 && response.status < 300) {
          pending.set(token, Date.now());
        } else {
          wsFailed.add(1);
        }
        sleep(0.05);
      }
    }, 200);

    socket.setTimeout(() => {
      const failures = Math.max(0, 50 - delivered);
      if (failures > 0) wsFailed.add(failures);
      socket.close();
    }, 10000);
  });
}

export function pollingScenario() {
  const { a, b } = userPair();

  for (let i = 0; i < 30; i++) {
    const actionStart = Date.now();
    http.post(`${BASE_URL}/api/users/${b.id}/follow`, null, {
      headers: { Cookie: a.cookie },
    });

    let found = false;
    for (let attempt = 0; attempt < 6; attempt++) {
      sleep(3);
      const response = http.get(`${BASE_URL}/api/notifications`, {
        headers: { Cookie: b.cookie },
      });
      if (response.status < 200 || response.status >= 300) continue;
      const notifications = JSON.parse(response.body || "[]");
      if (Array.isArray(notifications) && notifications.length > 0) {
        found = true;
        pollingLatency.add(Date.now() - actionStart);
        break;
      }
    }
    if (!found) {
      pollingLatency.add(18000);
    }
  }
}

function m(metrics, name, key, fallback = 0) {
  if (!metrics[name] || !metrics[name].values) return fallback;
  return metrics[name].values[key] ?? fallback;
}

export function handleSummary(data) {
  const summary = {
    websocket: {
      min_ms: m(data.metrics, "ws_delivery_latency_ms", "min"),
      mean_ms: m(data.metrics, "ws_delivery_latency_ms", "avg"),
      p95_ms: m(data.metrics, "ws_delivery_latency_ms", "p(95)"),
      p99_ms: m(data.metrics, "ws_delivery_latency_ms", "p(99)"),
      max_ms: m(data.metrics, "ws_delivery_latency_ms", "max"),
      failed_deliveries: m(data.metrics, "ws_failed_deliveries", "count"),
    },
    polling: {
      min_ms: m(data.metrics, "polling_delivery_latency_ms", "min"),
      mean_ms: m(data.metrics, "polling_delivery_latency_ms", "avg"),
      p95_ms: m(data.metrics, "polling_delivery_latency_ms", "p(95)"),
      p99_ms: m(data.metrics, "polling_delivery_latency_ms", "p(99)"),
      max_ms: m(data.metrics, "polling_delivery_latency_ms", "max"),
      poll_interval_ms: 3000,
    },
  };

  return {
    "results/ws-vs-polling-summary.json": JSON.stringify(summary, null, 2),
  };
}
