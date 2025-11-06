#!/bin/bash
# Startup script for Build123d CAD Service
# This script initializes and runs the parametric CAD modeling service

set -e

echo "=========================================="
echo "Build123d CAD Service Startup"
echo "=========================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    exit 1
fi

echo "✓ Python 3 found: $(python3 --version)"

# Check if build123d is installed
if ! python3 -c "import build123d" 2>/dev/null; then
    echo "⚠️  build123d not installed - will run in demo mode"
    echo "   Install with: pip install build123d"
    DEMO_MODE=true
else
    echo "✓ build123d installed"
    DEMO_MODE=false
fi

# Set environment variables
export CAD_SERVICE_PORT=${CAD_SERVICE_PORT:-8001}
export PYTHONUNBUFFERED=1

echo ""
echo "Configuration:"
echo "  Port: $CAD_SERVICE_PORT"
echo "  Demo Mode: $DEMO_MODE"
echo ""

# Change to the python-services directory
cd "$(dirname "$0")/.."
PYTHON_SERVICES_DIR="$(pwd)/python-services"

if [ ! -f "$PYTHON_SERVICES_DIR/build123d-cad-service.py" ]; then
    echo "❌ CAD service file not found at $PYTHON_SERVICES_DIR/build123d-cad-service.py"
    exit 1
fi

echo "Starting Build123d CAD Service..."
echo "=========================================="
echo ""

# Run the service
cd "$PYTHON_SERVICES_DIR"
exec python3 build123d-cad-service.py
