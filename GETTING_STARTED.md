# K6 Performance Testing - Getting Started Guide

## 🎯 First Time Setup

### 1. Install K6

**Linux (Fedora/RHEL)**:
```bash
sudo dnf install https://dl.k6.io/rpm/repo.rpm
sudo dnf install k6
```

**Linux (Ubuntu/Debian)**:
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**macOS**:
```bash
brew install k6
```

### 2. Configure Test Data

```bash
# Copy example file
cp data/users.sandbox.json.example data/users.sandbox.json

# Edit with your real user credentials
nano data/users.sandbox.json
```

Edit the file and replace with your actual test users:
```json
{
  "users": [
    {
      "email": "your-test-user@example.com",
      "password": "your-password",
      "app_id": 3,
      "role": "functionary"
    }
  ],
  "functionary": {
    "apiBaseUrl": "https://your-api-url.com",
    "authorization": "Bearer your-token",
    "timeout": 10000
  }
}
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env
nano .env
```

Update with your settings:
```bash
API_BASE_URL_SANDBOX=https://your-api-url.com
API_AUTHORIZATION_SANDBOX=Bearer your-token
```

### 4. Make Scripts Executable

```bash
chmod +x scripts/*.sh
```

## 🚀 Running Your First Test

### Quick Smoke Test (1 minute)
```bash
./scripts/run-test.sh --strategy smoke
```

### With Visual Dashboard
```bash
./scripts/run-test.sh --strategy smoke --dashboard
```

After the test, open the generated HTML report:
```bash
# The report location will be shown in the output
# Usually in: reports/functionary-smoke-sandbox-TIMESTAMP.html
```

## 📊 Viewing Results

### Console Output
Results are displayed in the terminal with:
- Request statistics (avg, min, max, p90, p95)
- Success rates
- Failed requests
- Custom metrics

### HTML Report
When using `--dashboard` flag:
- Interactive charts
- Request timeline
- Detailed metrics breakdown
- Error logs

### Example Output
```
✓ login: status is 200
✓ login: JWT token received  
✓ expedients by user: status 200
✓ pending signatures: status 200

checks.........................: 100.00% ✓ 40       ✗ 0  
http_req_duration..............: avg=234ms  p(95)=456ms
http_req_failed................: 0.00%   ✓ 0        ✗ 40 
iterations.....................: 10      0.166667/s
login_duration.................: avg=189ms  p(95)=234ms
```

## 🎪 Test Strategies Explained

### 1. Smoke Test (Recommended First)
- **Duration**: 1 minute
- **Users**: 2
- **Purpose**: Quick validation
- **Use**: Every code change, CI/CD

```bash
./scripts/run-test.sh --strategy smoke
```

### 2. Load Test
- **Duration**: 9 minutes
- **Users**: Ramps 0→10→0
- **Purpose**: Normal load behavior
- **Use**: Weekly performance checks

```bash
./scripts/run-test.sh --strategy load
```

### 3. Stress Test
- **Duration**: 12 minutes  
- **Users**: Ramps up to 30
- **Purpose**: Find breaking point
- **Use**: Before major releases

```bash
./scripts/run-test.sh --strategy stress
```

### 4. Spike Test
- **Duration**: 3 minutes
- **Users**: Sudden jump 5→50
- **Purpose**: Handle traffic spikes
- **Use**: Before marketing campaigns

```bash
./scripts/run-test.sh --strategy spike
```

## 🔧 Common Issues

### "Test file not found"
```bash
# Make sure you're in the project root
cd /path/to/k6-grafana
./scripts/run-test.sh
```

### "Users file not found"
```bash
# Copy and edit the example file
cp data/users.sandbox.json.example data/users.sandbox.json
nano data/users.sandbox.json
```

### "All requests failing"
- Check API URL in `data/users.sandbox.json`
- Verify authorization token is valid
- Ensure test user credentials are correct
- Check if API is accessible from your machine

### "k6 command not found"
```bash
# Reinstall k6
sudo dnf install k6  # Fedora/RHEL
brew install k6      # macOS
```

## 📚 Next Steps

1. **Start with smoke tests** to validate setup
2. **Review the HTML reports** to understand metrics
3. **Run load tests** to establish baseline
4. **Set up Grafana** for real-time monitoring (optional)
5. **Customize thresholds** in `config/strategies.js`
6. **Add more tests** for other workflows

## 🆘 Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Review test strategies in `config/strategies.js`
- Look at service implementations in `services/`
- Check environment configs in `config/environments.js`

## 💡 Pro Tips

1. **Always start with smoke tests** - they're fast and catch basic issues
2. **Use dashboard flag** - visual reports are much easier to understand
3. **Check server resources** - monitor your API server during tests
4. **Start small** - begin with low VU counts and increase gradually
5. **Cache auth tokens** - already implemented, reuses JWT per VU

---

Happy testing! 🚀
