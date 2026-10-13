# Performance Regression Gate

**English** | [Español](README.es.md)

A performance QA project designed to automatically detect performance regressions using **k6**, **FastAPI**, **Docker**, and **GitHub Actions**.

The application can run in either normal or degraded mode. k6 measures its behavior and applies a quality gate to decide whether performance remains within the accepted limits.

## Demo

Public visual demo:

https://joseantoniocgonzalez.github.io/performance-regression-gate/

The demo allows both scenarios to be compared and links to the real GitHub Actions executions.

## Purpose

This project demonstrates that an application can remain functionally correct while still suffering a performance regression severe enough to block a release.

The quality gate checks:

- p95 latency below 500 ms.
- HTTP request failure rate below 1%.
- more than 99% successful checks.

If any of these limits is violated, k6 exits with an error and GitHub Actions marks the execution as failed.

## Scenarios

### Normal

The API responds without introducing artificial delay.

Result verified in GitHub Actions:

- p95: **2.03 ms**
- HTTP errors: **0%**
- successful checks: **100%**
- Quality gate: **PASS**

![k6 threshold pass](docs/images/k6-threshold-pass.png)

### Degraded

The API introduces approximately one second of artificial latency.

Result verified in GitHub Actions:

- p95: **~1 s**
- HTTP errors: **0%**
- successful checks: **100%**
- HTTP responses: **200**
- Quality gate: **FAIL**

The application remains functionally correct, but the pipeline detects the regression because p95 exceeds the 500 ms threshold.

![k6 threshold fail](docs/images/k6-threshold-fail.png)

## Flow

```text
FastAPI
   │
   ▼
Docker
   │
   ▼
/work?mode=normal
/work?mode=degraded
   │
   ▼
k6
   │
   ▼
Performance thresholds
   │
   ├── PASS
   └── FAIL
   │
   ▼
GitHub Actions
```

The `/health` endpoint is used to verify that the API is available.

The `/work` endpoint is the system under test:

- `mode=normal` responds normally.
- `mode=degraded` introduces an artificial delay to simulate a performance regression.

## Quality Gate

The k6 thresholds are:

```javascript
thresholds: {
  http_req_duration: ['p(95)<500'],
  http_req_failed: ['rate<0.01'],
  checks: ['rate>0.99'],
}
```

This means:

- 95% of requests must respond in under 500 ms;
- fewer than 1% of HTTP requests may fail;
- more than 99% of checks must complete successfully.

## GitHub Actions

The workflow can be run manually from GitHub by selecting one of the two scenarios:

- `normal`
- `degraded`

Workflow:

https://github.com/joseantoniocgonzalez/performance-regression-gate/actions/workflows/performance.yml

Verified runs:

- Normal — PASS:
  https://github.com/joseantoniocgonzalez/performance-regression-gate/actions/runs/37916231092
- Degraded — FAIL:
  https://github.com/joseantoniocgonzalez/performance-regression-gate/actions/runs/37916410173

The pipeline:

1. checks out the repository;
2. builds and starts the API with Docker Compose;
3. waits until `/health` is available;
4. installs k6;
5. runs the selected scenario;
6. evaluates the thresholds;
7. stops the containers after execution.

The failed degraded run is intentional: it demonstrates that the quality gate blocks a functionally valid application when its performance exceeds the defined limit.

## Structure

```text
performance-regression-gate/
├── api/
│   ├── app.py
│   ├── Dockerfile
│   └── requirements.txt
├── k6/
│   └── smoke.js
├── docs/
│   ├── index.html
│   └── images/
│       ├── k6-threshold-pass.png
│       └── k6-threshold-fail.png
├── reports/
│   └── .gitkeep
├── .github/
│   └── workflows/
│       └── performance.yml
├── docker-compose.yml
├── .gitignore
├── README.es.md
└── README.md
```

## Running with Docker

Start the API:

```bash
docker compose up -d --build
```

Check that it is available:

```bash
curl http://127.0.0.1:8000/health
```

Run the normal scenario:

```bash
MODE=normal k6 run k6/smoke.js
```

Run the degraded scenario:

```bash
MODE=degraded k6 run k6/smoke.js
```

Stop the containers:

```bash
docker compose down
```

## Running locally without Docker

Create and activate a virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r api/requirements.txt
```

Start the API:

```bash
uvicorn api.app:app --reload
```

The same k6 scenarios can then be executed.

## Technologies

- FastAPI
- Python
- k6
- Docker
- Docker Compose
- GitHub Actions
- GitHub Pages

## Status

Project complete.

It includes a test API, controlled degradation simulation, automated performance testing, a quality gate, containerization, CI integration, and a public demo.
