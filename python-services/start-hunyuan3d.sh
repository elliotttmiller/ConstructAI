#!/bin/bash
# Startup script for Hunyuan3D-2 service

echo "🚀 Starting Hunyuan3D-2 service for ConstructAI..."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ to run Hunyuan3D-2 service."
    exit 1
fi

# Check if pip is available
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip to manage Python packages."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing Python dependencies..."
pip install -r requirements.txt

# Check for GPU support
if python3 -c "import torch; print('✅ GPU available:' if torch.cuda.is_available() else '⚠️ CPU only mode:')" 2>/dev/null; then
    python3 -c "import torch; print(f'   Device: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else \"CPU\"}')" 2>/dev/null
else
    echo "⚠️ PyTorch not installed - will install CPU version"
    pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
fi

# Start the service
echo "🎯 Starting Hunyuan3D-2 API server on port 8000..."
echo "📊 Service will be available at: http://localhost:8000"
echo "🔍 API documentation: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the service"
echo "----------------------------------------"

python3 hunyuan3d-server.py
