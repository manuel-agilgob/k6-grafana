#!/bin/bash

###############################################################################
# Quick Test Script
# 
# Runs a quick smoke test to validate the setup.
###############################################################################

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
cat << "EOF"
  _  _____    ____            _      _     _____         _   
 | |/ / _ \  / __ \ _   _ ___| | __ | |   |_   _|__  ___| |_ 
 | ' / | | | | |  | | | | |/ __| |/ / | |    | |/ _ \/ __| __|
 | . \ |_| | | |__| | |_| | (__|   <| |    | |  __/\__ \ |_ 
 |_|\_\__\_\ \___\_\\__,_|\___|_|\_\_|    |_|\___||___/\__|
                                                             
EOF
echo -e "${NC}"

echo -e "${BLUE}🚀 Running quick validation test...${NC}"
echo ""

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo -e "${RED}❌ K6 is not installed${NC}"
    echo "Please install K6: https://k6.io/docs/getting-started/installation/"
    exit 1
fi

# Check if test file exists
if [ ! -f "tests/functionary/front-functionary.test.js" ]; then
    echo -e "${RED}❌ Test file not found${NC}"
    exit 1
fi

# Run smoke test
STRATEGY=smoke ENVIRONMENT=sandbox k6 run tests/functionary/front-functionary.test.js

echo ""
echo -e "${GREEN}✅ Quick test completed!${NC}"
