# 🚀 K6 Performance Testing Suite

<div align="center">

![K6](https://img.shields.io/badge/K6-7D64FF?style=for-the-badge&logo=k6&logoColor=white)
![Grafana](https://img.shields.io/badge/Grafana-F46800?style=for-the-badge&logo=grafana&logoColor=white)
![InfluxDB](https://img.shields.io/badge/InfluxDB-22ADF6?style=for-the-badge&logo=influxdb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**Professional load testing framework for modern applications**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Examples](#-examples)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Running Tests](#-running-tests)
- [Test Strategies](#-test-strategies)
- [Metrics & Reporting](#-metrics--reporting)
- [Grafana Dashboards](#-grafana-dashboards)
- [CI/CD Integration](#-cicd-integration)
- [Best Practices](#-best-practices)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Overview

This is a professional-grade performance testing suite built with **K6**, designed to test modern web applications with **realistic load patterns**, **comprehensive metrics**, and **beautiful visualizations**.

### Why This Framework?

- ✅ **Production-Ready**: Professional structure and best practices
- ✅ **Scalable**: Easy to add new tests and scenarios
- ✅ **Observable**: Rich metrics and custom dashboards
- ✅ **Maintainable**: Clean code architecture and documentation
- ✅ **Flexible**: Multiple test strategies and environments
- ✅ **CI/CD Ready**: Easy integration with pipelines

---

## ✨ Features

### 🎪 Test Strategies
- **Smoke Tests**: Quick validation (2 VUs, 1min)
- **Load Tests**: Normal load patterns (10 VUs, ramping)
- **Stress Tests**: Breaking point analysis (30 VUs, progressive)
- **Spike Tests**: Sudden traffic surge handling
- **Soak Tests**: Long-duration stability (30min)

### 📊 Reporting & Metrics
- Real-time web dashboard
- HTML reports with detailed breakdown
- JSON exports for analysis
- Custom business metrics
- InfluxDB integration
- Grafana dashboards

### 🏗️ Architecture
- Service-oriented design
- Reusable components
- Environment management
- JWT token caching
- Smart user distribution

---

## 📦 Prerequisites

Before you begin, ensure you have:

- **K6** (v0.45.0+) - [Installation Guide](https://k6.io/docs/getting-started/installation/)
- **Docker & Docker Compose** (optional, for Grafana/InfluxDB)
- **Node.js** (v16+, optional, for npm scripts)
- **Git**

### Install K6

#### Linux (Debian/Ubuntu)
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

#### Linux (Fedora/CentOS)
```bash
sudo dnf install https://dl.k6.io/rpm/repo.rpm
sudo dnf install k6
```

#### macOS
```bash
brew install k6
```

#### Windows
```powershell
winget install k6
```

---

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd k6-grafana
   ```

2. **Set up test data**
   ```bash
   # Copy example files
   cp data/users.sandbox.json.example data/users.sandbox.json
   cp .env.example .env
   
   # Edit with your credentials
   nano data/users.sandbox.json
   nano .env
   ```

3. **Make scripts executable**
   ```bash
   chmod +x scripts/*.sh
   ```

4. **Start monitoring stack (optional)**
   ```bash
   docker-compose up -d
   ```

---

## 🎬 Quick Start

### Basic Test Run

```bash
# Run a smoke test (fastest)
./scripts/run-test.sh --strategy smoke

# Run with dashboard
./scripts/run-test.sh --strategy smoke --dashboard

# Using npm scripts
npm run test:smoke
npm run test:load
npm run test:stress
```

### Direct K6 Execution

```bash
# Simple run
k6 run tests/functionary/front-functionary.test.js

# With environment variables
STRATEGY=load ENVIRONMENT=sandbox k6 run tests/functionary/front-functionary.test.js

# With dashboard and custom output
K6_WEB_DASHBOARD=true \
K6_WEB_DASHBOARD_EXPORT=./reports/my-report.html \
STRATEGY=stress \
k6 run tests/functionary/front-functionary.test.js
```

---

## 📁 Project Structure

```
k6-grafana/
├── config/                      # Test configurations
│   ├── strategies.js           # Load test strategies
│   ├── environments.js         # Environment configs
│   └── metrics.js              # Custom metrics definitions
│
├── services/                    # Business logic services
│   ├── auth.service.js         # Authentication service
│   └── functionary.service.js  # Functionary operations
│
├── tests/                       # Test files
│   └── functionary/
│       └── front-functionary.test.js
│
├── utils/                       # Helper utilities
│   └── helpers.js              # Common functions
│
├── data/                        # Test data (gitignored)
│   ├── users.sandbox.json      # User credentials
│   └── users.sandbox.json.example
│
├── scripts/                     # Automation scripts
│   ├── run-test.sh             # Main test runner
│   └── setup-influxdb.sh       # InfluxDB setup
│
├── reports/                     # Test reports (gitignored)
│
├── grafana/                     # Grafana configuration
│   ├── dashboards/             # Dashboard definitions
│   └── provisioning/           # Auto-provisioning
│
├── docker-compose.yml          # Docker stack
├── .env.example                # Environment template
├── package.json                # NPM scripts
└── README.md                   # This file
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file from the template:

```bash
# Test Configuration
ENVIRONMENT=sandbox
TEST_STRATEGY=smoke
APPLICATION=functionary

# K6 Dashboard
K6_WEB_DASHBOARD=true
K6_WEB_DASHBOARD_EXPORT=./reports/performance-report.html

# InfluxDB
K6_INFLUXDB_ORGANIZATION=agil
K6_INFLUXDB_BUCKET=k6
K6_INFLUXDB_TOKEN=your-token-here
K6_INFLUXDB_ADDR=http://localhost:8086

# API Configuration
API_BASE_URL_SANDBOX=https://api-sandbox.example.com
API_AUTHORIZATION_SANDBOX=Bearer your-token
```

### Test Data Configuration

Edit `data/users.sandbox.json`:

```json
{
  "users": [
    {
      "email": "user1@example.com",
      "password": "password123",
      "app_id": 3,
      "role": "functionary"
    }
  ],
  "functionary": {
    "apiBaseUrl": "https://api-sandbox.example.com",
    "authorization": "Bearer your-token",
    "timeout": 10000
  }
}
```

---

## 🏃 Running Tests

### Using the Run Script (Recommended)

```bash
# Basic smoke test
./scripts/run-test.sh

# Load test with dashboard
./scripts/run-test.sh --strategy load --dashboard

# Stress test on production
./scripts/run-test.sh -s stress -e production

# With InfluxDB output
./scripts/run-test.sh -s load -o influxdb

# Help
./scripts/run-test.sh --help
```

### Using NPM Scripts

```bash
# Smoke test
npm run test:smoke

# Load test
npm run test:load

# Stress test
npm run test:stress

# Spike test
npm run test:spike

# Soak test (long duration)
npm run test:soak

# With dashboard
npm run test:dashboard
```

### Direct K6 Commands

```bash
# Basic run
k6 run tests/functionary/front-functionary.test.js

# With specific strategy
STRATEGY=load k6 run tests/functionary/front-functionary.test.js

# With InfluxDB output
k6 run --out influxdb=http://localhost:8086 tests/functionary/front-functionary.test.js

# Multiple outputs
k6 run \
  --out json=results.json \
  --out influxdb=http://localhost:8086 \
  tests/functionary/front-functionary.test.js
```

---

## 📊 Test Strategies

### 1. 💨 Smoke Test
**Purpose**: Quick validation that system works  
**Use When**: CI/CD, quick checks, post-deployment  
**Configuration**:
- VUs: 2
- Duration: 1 minute
- Thresholds: 95th percentile < 2s

```bash
./scripts/run-test.sh --strategy smoke
```

### 2. 📈 Load Test
**Purpose**: Test under normal expected load  
**Use When**: Regular performance testing, baseline establishment  
**Configuration**:
- Stages: Ramp up → Steady → Ramp down
- Max VUs: 10
- Duration: 9 minutes

```bash
./scripts/run-test.sh --strategy load
```

### 3. 💪 Stress Test
**Purpose**: Find breaking point  
**Use When**: Capacity planning, finding limits  
**Configuration**:
- Progressive load increase
- Max VUs: 30
- Duration: 12 minutes

```bash
./scripts/run-test.sh --strategy stress
```

### 4. ⚡ Spike Test
**Purpose**: Test sudden traffic surge  
**Use When**: Marketing campaigns, flash sales  
**Configuration**:
- Sudden jump: 5 → 50 VUs
- Duration: 3 minutes

```bash
./scripts/run-test.sh --strategy spike
```

### 5. 🏊 Soak Test
**Purpose**: Long-duration stability testing  
**Use When**: Memory leak detection, degradation analysis  
**Configuration**:
- VUs: 10 (steady)
- Duration: 30+ minutes

```bash
./scripts/run-test.sh --strategy soak
```

---

## 📈 Metrics & Reporting

### Standard K6 Metrics

- `http_req_duration`: Request duration
- `http_req_failed`: Failed request rate
- `http_reqs`: Total HTTP requests
- `vus`: Active virtual users
- `iterations`: Completed iterations

### Custom Business Metrics

- **Authentication**:
  - `login_duration`: Login response time
  - `login_success_rate`: Login success percentage
  - `jwt_token_reuse`: Token cache hits

- **Business Operations**:
  - `expedients_fetch_duration`: Expedient fetch time
  - `signatures_fetch_duration`: Signature fetch time
  - `expedients_fetched`: Count of expedients
  - `signatures_pending_count`: Pending signatures

- **Errors**:
  - `http_errors_4xx`: Client errors
  - `http_errors_5xx`: Server errors
  - `check_failures`: Failed checks

### Report Formats

#### 1. HTML Dashboard (Interactive)
```bash
K6_WEB_DASHBOARD=true \
K6_WEB_DASHBOARD_EXPORT=./reports/report.html \
k6 run tests/functionary/front-functionary.test.js
```

#### 2. JSON Export
```bash
k6 run --out json=reports/results.json tests/functionary/front-functionary.test.js
```

#### 3. CSV Export
```bash
k6 run --out csv=reports/results.csv tests/functionary/front-functionary.test.js
```

#### 4. InfluxDB + Grafana (Real-time)
```bash
k6 run --out influxdb=http://localhost:8086 tests/functionary/front-functionary.test.js
```

---

## 📊 Grafana Dashboards

### Setup Grafana

1. **Start services**
   ```bash
   docker-compose up -d
   ```

2. **Access Grafana**
   - URL: http://localhost:3300
   - User: `admin`
   - Pass: `admin123`

3. **Configure InfluxDB data source**
   - Go to Configuration → Data Sources
   - Add InfluxDB
   - URL: `http://influxdb:8086`
   - Organization: `agil`
   - Token: `k6-admin-token-change-me`
   - Bucket: `k6`

4. **Import K6 dashboard**
   - Go to Dashboards → Import
   - Upload from `grafana/dashboards/`
   - Or use dashboard ID: `2587`

### Running with Real-time Monitoring

```bash
# Set InfluxDB output
export K6_OUT=influxdb=http://localhost:8086

# Run test
./scripts/run-test.sh --strategy load --output influxdb

# Watch in Grafana at http://localhost:3300
```

---

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Performance Tests

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  workflow_dispatch:

jobs:
  performance-test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Install K6
        run: |
          sudo gpg -k
          sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6
      
      - name: Run Smoke Test
        run: |
          STRATEGY=smoke \
          ENVIRONMENT=sandbox \
          k6 run tests/functionary/front-functionary.test.js
      
      - name: Upload Results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: k6-results
          path: reports/
```

### GitLab CI Example

```yaml
performance-test:
  image: grafana/k6:latest
  stage: test
  script:
    - k6 run 
        --out json=results.json 
        tests/functionary/front-functionary.test.js
  artifacts:
    paths:
      - results.json
    expire_in: 1 week
  only:
    - schedules
```

---

## 💡 Best Practices

### 1. Start Small
```bash
# Always start with smoke test
./scripts/run-test.sh --strategy smoke
```

### 2. Gradual Load Increase
```bash
# Use stages for realistic patterns
stages: [
  { duration: '2m', target: 10 },  # Ramp up
  { duration: '5m', target: 10 },  # Stay
  { duration: '2m', target: 0 },   # Ramp down
]
```

### 3. Monitor Server Resources
- CPU usage
- Memory consumption
- Database connections
- API response times

### 4. Set Realistic Thresholds
```javascript
thresholds: {
  http_req_duration: ['p(95)<2000'],  // 95% under 2s
  http_req_failed: ['rate<0.01'],     // <1% errors
  checks: ['rate>0.98'],               // >98% checks pass
}
```

### 5. Cache Authentication
- Reuse JWT tokens per VU
- Avoid login on every iteration
- Implemented in `auth.service.js`

### 6. Use Tags for Filtering
```javascript
http.get(url, {
  tags: { endpoint: 'expedients', type: 'business' }
});
```

### 7. Think Time
```javascript
// Add realistic pauses
sleep(1, 0.2);  // 0.8-1.2 seconds
```

---

## 🔧 Troubleshooting

### K6 Not Found
```bash
# Verify installation
k6 version

# Reinstall if needed
brew reinstall k6  # macOS
sudo dnf reinstall k6  # Fedora/RHEL
```

### Test Data Not Found
```bash
# Copy example file
cp data/users.sandbox.json.example data/users.sandbox.json

# Edit with real credentials
nano data/users.sandbox.json
```

### Docker Services Not Starting
```bash
# Check logs
docker-compose logs -f influxdb
docker-compose logs -f grafana

# Restart services
docker-compose down
docker-compose up -d
```

### InfluxDB Connection Issues
```bash
# Verify InfluxDB is running
curl http://localhost:8086/health

# Check token
docker exec -it k6-influxdb influx auth list
```

### High Error Rates
- Check API availability
- Verify credentials in `data/users.*.json`
- Review thresholds (might be too strict)
- Check server resources

### Slow Performance
- Reduce VUs
- Increase ramp-up time
- Check network latency
- Verify test data size

---

## 📚 Additional Resources

- [K6 Documentation](https://k6.io/docs/)
- [K6 Examples](https://k6.io/docs/examples/)
- [Grafana Dashboards](https://grafana.com/grafana/dashboards/)
- [InfluxDB Documentation](https://docs.influxdata.com/)

---

## 📄 License

MIT License - feel free to use this for your projects!

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

<div align="center">

Made with ❤️ for performance testing

**[⬆ back to top](#-k6-performance-testing-suite)**

</div>
