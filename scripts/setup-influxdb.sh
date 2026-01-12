#!/bin/bash

###############################################################################
# InfluxDB Setup Script for K6
# 
# Automatically configures InfluxDB v2 for K6 integration.
# Creates authentication tokens and configures permissions.
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

# Configuration
INFLUX_CONTAINER="k6-influxdb"
INFLUX_ORG="agil"
INFLUX_BUCKET="k6"
INFLUX_USERNAME="k6-user"
INFLUX_PASSWORD="k6-password"

print_info "═══════════════════════════════════════════════════════"
print_info "  InfluxDB Setup for K6"
print_info "═══════════════════════════════════════════════════════"
echo ""

# Check if Docker is running
if ! docker ps &> /dev/null; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Check if InfluxDB container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${INFLUX_CONTAINER}$"; then
    print_warning "InfluxDB container is not running."
    print_info "Starting docker-compose services..."
    docker-compose up -d influxdb
    
    print_info "Waiting for InfluxDB to be ready..."
    sleep 10
fi

print_info "Checking InfluxDB health..."
for i in {1..30}; do
    if docker exec $INFLUX_CONTAINER influx ping &> /dev/null; then
        print_success "InfluxDB is healthy!"
        break
    fi
    
    if [ $i -eq 30 ]; then
        print_error "InfluxDB failed to start properly"
        exit 1
    fi
    
    echo -n "."
    sleep 1
done
echo ""

# Get bucket ID
print_info "Getting K6 bucket ID..."
BUCKET_ID=$(docker exec $INFLUX_CONTAINER influx bucket list --name $INFLUX_BUCKET --json | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$BUCKET_ID" ]; then
    print_error "Could not find K6 bucket. Is InfluxDB properly initialized?"
    exit 1
fi

print_success "Found K6 bucket: $BUCKET_ID"

# Create V1 auth for K6
print_info "Creating V1 authentication for K6..."

# Check if auth already exists
if docker exec $INFLUX_CONTAINER influx v1 auth list --json | grep -q "\"username\":\"$INFLUX_USERNAME\""; then
    print_warning "V1 auth for '$INFLUX_USERNAME' already exists"
    print_info "Deleting existing auth..."
    AUTH_ID=$(docker exec $INFLUX_CONTAINER influx v1 auth list --json | grep -B 5 "\"username\":\"$INFLUX_USERNAME\"" | grep '"id"' | cut -d'"' -f4)
    docker exec $INFLUX_CONTAINER influx v1 auth delete --id $AUTH_ID
fi

# Create new auth
docker exec $INFLUX_CONTAINER influx v1 auth create \
    --username $INFLUX_USERNAME \
    --password $INFLUX_PASSWORD \
    --org $INFLUX_ORG \
    --read-bucket $BUCKET_ID \
    --write-bucket $BUCKET_ID > /dev/null

print_success "V1 authentication created successfully!"

# Display configuration
echo ""
print_info "═══════════════════════════════════════════════════════"
print_success "  InfluxDB Configuration Complete!"
print_info "═══════════════════════════════════════════════════════"
echo ""
echo "  📊 Organization: $INFLUX_ORG"
echo "  🗄️  Bucket: $INFLUX_BUCKET"
echo "  👤 Username: $INFLUX_USERNAME"
echo "  🔑 Password: $INFLUX_PASSWORD"
echo "  🌐 URL: http://localhost:8086"
echo ""
print_info "═══════════════════════════════════════════════════════"
echo ""

print_info "Add these to your .env file:"
echo ""
echo "K6_INFLUXDB_ORGANIZATION=$INFLUX_ORG"
echo "K6_INFLUXDB_BUCKET=$INFLUX_BUCKET"
echo "K6_INFLUXDB_ADDR=http://localhost:8086"
echo ""

print_info "To run K6 with InfluxDB output:"
echo ""
echo "k6 run --out influxdb=http://${INFLUX_USERNAME}:${INFLUX_PASSWORD}@localhost:8086/${INFLUX_BUCKET} tests/functionary/front-functionary.test.js"
echo ""

print_success "Setup complete! You can now run K6 tests with InfluxDB output."
