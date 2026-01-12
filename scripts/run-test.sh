#!/bin/bash

###############################################################################
# K6 Performance Test Execution Script
# 
# A professional wrapper script for running k6 tests with various configurations.
# Provides easy-to-use interface for different test strategies and environments.
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
STRATEGY="${STRATEGY:-smoke}"
ENVIRONMENT="${ENVIRONMENT:-sandbox}"
APPLICATION="${APPLICATION:-functionary}"
ENABLE_DASHBOARD="${ENABLE_DASHBOARD:-true}"
REPORTS_DIR="./reports"

# Create reports directory if it doesn't exist
mkdir -p "$REPORTS_DIR"

# Function to print colored messages
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to display usage
usage() {
    cat << EOF
${GREEN}K6 Performance Test Runner${NC}

Usage: $0 [OPTIONS]

Options:
    -s, --strategy STRATEGY      Test strategy: smoke, load, stress, spike, soak (default: smoke)
    -e, --environment ENV        Environment: sandbox, production, local (default: sandbox)
    -a, --application APP        Application: functionary, citizen (default: functionary)
    -d, --dashboard              Enable K6 web dashboard (default: true)
    -o, --output FORMAT          Additional output format: json, csv, influxdb
    -h, --help                   Show this help message

Examples:
    $0 --strategy smoke --environment sandbox
    $0 -s load -e production
    $0 -s stress -d -o influxdb
    
Strategies:
    smoke   - Quick validation (2 VUs, 1min)
    load    - Normal load (10 VUs, ramp up/down)
    stress  - High load (30 VUs, progressive)
    spike   - Sudden traffic spike
    soak    - Extended duration (30min)
    average - Quick realistic test (5 VUs, 5min)

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--strategy)
            STRATEGY="$2"
            shift 2
            ;;
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -a|--application)
            APPLICATION="$2"
            shift 2
            ;;
        -d|--dashboard)
            ENABLE_DASHBOARD="true"
            shift
            ;;
        -o|--output)
            OUTPUT_FORMAT="$2"
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Validate inputs
VALID_STRATEGIES=("smoke" "load" "stress" "spike" "soak" "average")
if [[ ! " ${VALID_STRATEGIES[@]} " =~ " ${STRATEGY} " ]]; then
    print_error "Invalid strategy: $STRATEGY"
    print_info "Valid strategies: ${VALID_STRATEGIES[*]}"
    exit 1
fi

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    print_error "k6 is not installed. Please install k6 first."
    print_info "Visit: https://k6.io/docs/getting-started/installation/"
    exit 1
fi

# Check if test file exists
TEST_FILE="./tests/${APPLICATION}/front-${APPLICATION}.test.js"
if [ ! -f "$TEST_FILE" ]; then
    print_error "Test file not found: $TEST_FILE"
    exit 1
fi

# Check if users data file exists
USERS_FILE="./data/users.${ENVIRONMENT}.json"
if [ ! -f "$USERS_FILE" ]; then
    print_warning "Users file not found: $USERS_FILE"
    print_info "Using example file. Copy users.${ENVIRONMENT}.json.example to users.${ENVIRONMENT}.json"
fi

# Print test configuration
echo ""
print_info "═══════════════════════════════════════════════════════"
print_info "  K6 Performance Test Configuration"
print_info "═══════════════════════════════════════════════════════"
echo "  🎯 Strategy:     $STRATEGY"
echo "  🌍 Environment:  $ENVIRONMENT"
echo "  📱 Application:  $APPLICATION"
echo "  📊 Dashboard:    $ENABLE_DASHBOARD"
echo "  📁 Test File:    $TEST_FILE"
print_info "═══════════════════════════════════════════════════════"
echo ""

# Build k6 command
K6_CMD="k6 run"

# Add environment variables
K6_ENV_VARS=(
    "STRATEGY=$STRATEGY"
    "ENVIRONMENT=$ENVIRONMENT"
    "APPLICATION=$APPLICATION"
)

# Add dashboard if enabled
if [ "$ENABLE_DASHBOARD" = "true" ]; then
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    REPORT_FILE="${REPORTS_DIR}/${APPLICATION}-${STRATEGY}-${ENVIRONMENT}-${TIMESTAMP}.html"
    K6_ENV_VARS+=(
        "K6_WEB_DASHBOARD=true"
        "K6_WEB_DASHBOARD_EXPORT=${REPORT_FILE}"
    )
    print_info "📊 Report will be saved to: $REPORT_FILE"
fi

# Add additional output format if specified
if [ -n "$OUTPUT_FORMAT" ]; then
    case $OUTPUT_FORMAT in
        influxdb)
            if [ -z "$K6_INFLUXDB_ADDR" ]; then
                print_warning "K6_INFLUXDB_ADDR not set. Using default: http://localhost:8086"
                K6_ENV_VARS+=("K6_INFLUXDB_ADDR=http://localhost:8086")
            fi
            K6_CMD+=" --out influxdb"
            ;;
        json)
            JSON_FILE="${REPORTS_DIR}/${APPLICATION}-${STRATEGY}-${ENVIRONMENT}-$(date +%Y%m%d-%H%M%S).json"
            K6_CMD+=" --out json=${JSON_FILE}"
            ;;
        csv)
            CSV_FILE="${REPORTS_DIR}/${APPLICATION}-${STRATEGY}-${ENVIRONMENT}-$(date +%Y%m%d-%H%M%S).csv"
            K6_CMD+=" --out csv=${CSV_FILE}"
            ;;
    esac
fi

# Combine command
FULL_CMD="${K6_ENV_VARS[*]} $K6_CMD $TEST_FILE"

# Execute test
print_info "🚀 Starting K6 test..."
echo ""

eval "$FULL_CMD"

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    print_success "Test execution completed successfully!"
    
    if [ "$ENABLE_DASHBOARD" = "true" ]; then
        print_success "Report generated: $REPORT_FILE"
        print_info "Open in browser: file://$PWD/$REPORT_FILE"
    fi
else
    print_error "Test execution failed with exit code: $EXIT_CODE"
    exit $EXIT_CODE
fi

echo ""
print_info "═══════════════════════════════════════════════════════"
print_success "  Test Complete!"
print_info "═══════════════════════════════════════════════════════"
echo ""
