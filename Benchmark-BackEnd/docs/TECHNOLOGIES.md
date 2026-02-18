# 🛠 Technologies & Versions

## 📦 Frameworks Backend Testés

### Node.js
- **Runtime** : Node.js 20 LTS
- **Framework 1** : Express.js v4.18.2
  - Framework web minimal et flexible
  - Most popular Node.js framework
- **Framework 2** : Fastify v4.25.2
  - High performance framework
  - Schema-based validation
  - Async/await native

### Go
- **Version** : Go 1.21
- **Framework 1** : Fiber v2.52.0
  - Express-inspired framework
  - Built on fasthttp
  - Very fast routing
- **Framework 2** : Gin v1.9.1
  - Mature and stable
  - Excellent middleware support
  - Clean API

### Rust
- **Version** : Rust 1.75
- **Framework 1** : Actix-web v4.4
  - Actor-based framework
  - Highest performance
  - Type-safe routing
- **Framework 2** : Axum v0.7
  - Built on Tokio
  - Modern async/await
  - Tower middleware

---

## 🧪 Outils de Test

### k6
- **Version** : Latest
- **Purpose** : Load testing tool
- **Features** :
  - JavaScript-based test scripts
  - Virtual users simulation
  - Metrics export (JSON, CSV)
  - Thresholds & assertions

### Scénarios Implémentés
1. **Load Test** : Ramping load (0 → 1000 users)
2. **Spike Test** : Sudden traffic spike
3. **Stress Test** : Sustained high load

---

## 🐳 Infrastructure

### Docker
- **Base Images** :
  - `node:20-alpine` (Node.js)
  - `golang:1.21-alpine` (Go)
  - `rust:1.75-alpine` (Rust)
  - `alpine:latest` (Final images)

### Docker Compose
- **Version** : 3.8
- **Configuration** :
  - CPU limit: 2 cores per service
  - RAM limit: 512MB per service
  - Network: bridge (default)

---

## 📊 Analyse & Visualisation

### Python
- **Version** : 3.8+
- **Libraries** :
  - **matplotlib** v3.8.0 - Plotting library
  - **seaborn** v0.13.0 - Statistical visualizations
  - **pandas** v2.1.0 - Data manipulation
  - **numpy** v1.26.0 - Numerical computing

### Graphiques Générés
1. Latency comparison (bar chart)
2. Throughput comparison (horizontal bar)
3. Performance matrix (heatmap)
4. Failure rate (bar with threshold)
5. Comprehensive view (2x2 grid)

---

## 📈 Métriques Collectées

### HTTP Metrics (k6)
- `http_req_duration` - Request duration
  - avg - Average
  - min - Minimum
  - max - Maximum
  - med - Median
  - p(90) - 90th percentile
  - p(95) - 95th percentile
  - p(99) - 99th percentile
- `http_reqs` - Total requests
  - count - Total number
  - rate - Requests per second
- `http_req_failed` - Failed requests
  - rate - Failure rate
- `data_received` - Data downloaded
- `data_sent` - Data uploaded

### Docker Metrics
- CPU usage percentage
- Memory usage (MB)
- Memory percentage

---

## 🔧 Build Tools

### Node.js
- **npm** - Package manager
- **Dependencies** : express or fastify

### Go
- **go mod** - Dependency management
- **Build** : CGO_ENABLED=0 for static binaries

### Rust
- **Cargo** - Package manager & build tool
- **Build** : Release mode with optimizations

---

## 📝 Configuration Files

### Docker
- `Dockerfile` (6 files - one per service)
- `docker-compose.yml` (orchestration)

### Node.js
- `package.json` (dependencies)
- `server.js` (application code)

### Go
- `go.mod` (dependencies)
- `main.go` (application code)

### Rust
- `Cargo.toml` (dependencies)
- `src/main.rs` (application code)

### Python
- `requirements.txt` (dependencies)
- `generate_charts.py` (analysis script)

### k6
- `load-test.js` (main test)
- `spike-test.js` (spike test)
- `stress-test.js` (stress test)

---

## 🎯 Endpoints Implémentés

Tous les services exposent les mêmes endpoints :

### Health
- `GET /health` - Service status

### Users
- `GET /users` - List all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user

### Events
- `GET /events` - List all events
- `GET /events/:id` - Get event by ID
- `POST /events` - Create new event

---

## 📦 Data Models

### User
```json
{
  "id": 1,
  "name": "Alice",
  "email": "alice@theatre.com"
}
```

### Event
```json
{
  "id": 1,
  "title": "Le Cid",
  "date": "2026-03-15",
  "capacity": 500,
  "booked": 342
}
```

### Response Wrapper
```json
{
  "success": true,
  "count": 3,
  "data": [...]
}
```

---

## 🔐 Security Notes

### Current Implementation
- ⚠️ **No authentication** (benchmark focus)
- ⚠️ **No rate limiting** (measure raw performance)
- ⚠️ **No HTTPS** (localhost testing)
- ⚠️ **In-memory data** (no persistence)

### Production Recommendations
- ✅ Add JWT authentication
- ✅ Implement rate limiting
- ✅ Use HTTPS/TLS
- ✅ Connect to database
- ✅ Add request validation
- ✅ Implement CORS properly

---

## 📊 Test Parameters

### Virtual Users
- Warmup: 10 VUs
- Ramp-up: 0 → 100 → 500 → 1000
- Peak: 1000 concurrent users
- Duration: 11 minutes total

### Thresholds
- P95 latency: < 500ms
- P99 latency: < 1000ms
- Error rate: < 10%

### Think Time
- Random: 1-3 seconds between requests

---

## 🌐 Ports Configuration

| Service | Framework | Internal Port | External Port |
|---------|-----------|---------------|---------------|
| Node.js Express | Express.js | 3000 | 3001 |
| Node.js Fastify | Fastify | 3000 | 3002 |
| Go Fiber | Fiber | 3000 | 3003 |
| Go Gin | Gin | 3000 | 3004 |
| Rust Actix | Actix-web | 3000 | 3005 |
| Rust Axum | Axum | 3000 | 3006 |

---

## 💾 Resource Limits

### Per Container
- **CPU** : 2 cores
- **RAM** : 512 MB
- **Restart** : unless-stopped

### Total Resources
- **CPU** : 12 cores (6 services × 2)
- **RAM** : 3 GB (6 services × 512MB)

---

## 🔄 CI/CD Ready

### Automation
- ✅ `run_benchmark.sh` - Full automation
- ✅ `check_prerequisites.sh` - Environment validation
- ✅ `quick_test.sh` - Fast validation

### Output Formats
- ✅ JSON (machine-readable)
- ✅ CSV (Excel-compatible)
- ✅ PNG (visual reports)
- ✅ Markdown (documentation)

---

## 📚 Documentation Files

- `README_BENCHMARK.md` - Complete documentation
- `benchmark_report.md` - Analysis report
- `QUICK_START.md` - Quick start guide
- `PROJECT_SUMMARY.md` - Project overview
- `TECHNOLOGIES.md` - This file

---

## 🔗 Useful Links

### Official Documentation
- [Node.js](https://nodejs.org/en/docs/)
- [Express](https://expressjs.com/)
- [Fastify](https://www.fastify.io/)
- [Go](https://golang.org/doc/)
- [Fiber](https://gofiber.io/)
- [Gin](https://gin-gonic.com/)
- [Rust](https://www.rust-lang.org/learn)
- [Actix-web](https://actix.rs/)
- [Axum](https://docs.rs/axum/)
- [k6](https://k6.io/docs/)
- [Docker](https://docs.docker.com/)

### Benchmarks References
- [TechEmpower Benchmarks](https://www.techempower.com/benchmarks/)
- [Web Framework Benchmarks](https://web-frameworks-benchmark.netlify.app/)

---

**Dernière mise à jour** : Février 2026  
**Version** : 1.0
