## REST Endpoint Performance

| Endpoint | Method | p50 (ms) | p95 (ms) | p99 (ms) | RPS | Error Rate (%) | Cold Starts | Cold Start Avg (ms) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| /api/posts | GET | 205.45 | 793.06 | 910.88 | 7.52 | 0.00 | 247 | 679.24 |
| /api/groups | GET | 168.90 | 761.63 | 898.38 | 7.43 | 0.00 | 242 | 683.50 |
| /api/notifications | GET | 192.46 | 798.88 | 914.11 | 7.35 | 0.00 | 250 | 688.75 |
| /api/resources | GET | 186.33 | 764.77 | 901.44 | 7.31 | 0.00 | 231 | 678.81 |
| /api/posts | POST | 190.73 | 797.85 | 910.60 | 7.24 | 0.00 | 253 | 691.86 |
| /api/posts/:postId/like | POST | 187.34 | 773.31 | 917.52 | 7.17 | 0.00 | 233 | 689.04 |

## WebSocket vs Polling

| Channel | Min (ms) | Mean (ms) | p95 (ms) | p99 (ms) | Max (ms) | Failed Deliveries | Poll Interval (ms) |
|---|---:|---:|---:|---:|---:|---:|---:|
| WebSocket | 54.00 | 5403.42 | 9674.20 | 9739.64 | 9771.00 | 943 | - |
| Polling | 18000.00 | 18000.00 | 18000.00 | 18000.00 | 18000.00 | - | 3000 |

## Upload Concurrency Results

| Concurrent Users | Server p50 (ms) | Server p95 (ms) | Total p50 (ms) | Total p95 (ms) | Error Rate (%) |
|---:|---:|---:|---:|---:|---:|
| 1 | 11.33 | 26.14 | 11.33 | 26.14 | 0.00 |
| 5 | 11.97 | 102.71 | 11.97 | 102.71 | 0.00 |
| 10 | 13.21 | 80.72 | 13.21 | 80.72 | 0.00 |
| 20 | 59.09 | 288.37 | 59.09 | 288.37 | 0.00 |

`p95_exceeds_2000ms_at_concurrency`: **0** (not reached in this run)

## Cold-Start Characterization (5 Trials)

Warm baseline (mean): **68.80 ms**  
Cold-start mean: **46.48 ms**  
Cold-start p95: **48.43 ms**  
Mean requests to return within 20% of warm baseline: **1.00**

| Trial | Cold Start (ms) | Warmup #1 (ms) | Warmup #2 (ms) | Warmup #3 (ms) | Warmup #4 (ms) | Warmup #5 (ms) | Requests to Warm |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 48.43 | 43.63 | 44.59 | 44.09 | 43.63 | 46.10 | 1 |
| 2 | 46.45 | 43.36 | 44.36 | 45.21 | 45.76 | 45.61 | 1 |
| 3 | 43.96 | 44.23 | 41.77 | 45.14 | 47.07 | 45.19 | 1 |
| 4 | 46.95 | 46.35 | 44.20 | 58.26 | 72.01 | 81.74 | 1 |
| 5 | 46.61 | 44.61 | 44.32 | 45.03 | 44.60 | 43.39 | 1 |

## Key Findings

- `GET /api/posts` reached p95 **793.06ms** and p99 **910.88ms** under the staged 1→100 VU profile while keeping **0.00%** request errors.
- Across all six REST endpoints, sustained throughput stayed tightly clustered at **7.17–7.52 RPS** with no observed HTTP 4xx/5xx responses.
- Cold-start-like slow responses (>500ms after prior <200ms responses) were frequent in the REST run, ranging from **231 to 253 events** per endpoint with average slow-response latencies near **679–692ms**.
- WebSocket delivery was mixed: successful deliveries had a minimum of **54ms**, but tail latency was high (p95 **9674.20ms**, p99 **9739.64ms**) and **943 deliveries failed** during the test matrix.
- Polling latency was bounded by polling cadence and response availability, producing a flat **18,000ms** min/mean/p95/p99/max under the configured 3-second poll interval and 6-attempt cap.
- Upload API behavior remained stable under concurrency growth from 1 to 20 users, with total-upload p95 increasing from **26.14ms** to **288.37ms** and **0.00%** errors at all levels.
- In the 5-cycle cold-start characterization, measured cold-start latency averaged **46.48ms** (p95 **48.43ms**), and latency returned within 20% of warm baseline in **1 request on average**.
