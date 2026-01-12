#!/bin/bash

###############################################################################
# Grafana Setup Script
# 
# Configures Grafana data sources and dashboards for K6 metrics visualization.
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }

GRAFANA_URL="http://localhost:3300"
GRAFANA_USER="admin"
GRAFANA_PASS="admin123"

print_info "═══════════════════════════════════════════════════════"
print_info "  Grafana Setup for K6"
print_info "═══════════════════════════════════════════════════════"
echo ""

print_info "Grafana is accessible at: $GRAFANA_URL"
print_info "Username: $GRAFANA_USER"
print_info "Password: $GRAFANA_PASS"
echo ""

print_info "Manual Setup Steps:"
echo ""
echo "1. Open Grafana: $GRAFANA_URL"
echo "2. Login with credentials above"
echo "3. Go to Configuration → Data Sources"
echo "4. Click 'Add data source'"
echo "5. Select 'InfluxDB'"
echo "6. Configure:"
echo "   - Name: InfluxDB-K6"
echo "   - Query Language: Flux"
echo "   - URL: http://influxdb:8086"
echo "   - Organization: agil"
echo "   - Token: k6-admin-token-change-me"
echo "   - Default Bucket: k6"
echo "7. Click 'Save & Test'"
echo "8. Import K6 Dashboard (ID: 2587)"
echo ""

print_success "Ready to visualize K6 metrics in Grafana!"
