# Real Hunyuan3D-2 Integration

This directory contains the complete integration of Tencent's Hunyuan3D-2 repository for real 2D-to-3D blueprint conversion in the ConstructAI platform.

## 🚀 What's Included

- **Complete Hunyuan3D-2 Repository**: Full clone of the official Tencent repository
- **Real API Server**: Production-ready server using actual Hunyuan3D-2 models
- **Enhanced Service Integration**: Frontend service that connects to the real models
- **Setup Automation**: Scripts for easy installation and configuration
- **Fallback System**: Graceful degradation when real models are unavailable

## 📋 Prerequisites

### System Requirements
- **Python**: 3.8 or higher
- **CUDA**: 11.8+ (for GPU acceleration)
- **RAM**: 16GB+ recommended
- **GPU**: 8GB+ VRAM recommended (RTX 3080 or better)
- **Storage**: 50GB+ free space for models

### Required System Tools
- `ninja` (for C++ compilation)
- `gcc/g++` (Linux/Mac) or Visual Studio Build Tools (Windows)
- `git` for repository management

## 🔧 Installation

### 1. Quick Setup (Recommended)

```bash
# Navigate to the hunyuan3d directory
cd construction-ai-platform/hunyuan3d

# Run the automated setup script
python setup_hunyuan3d.py
```

This script will:
- Check system requirements
- Install Python dependencies
- Compile C++ extensions
- Download model weights
- Set up the environment

### 2. Manual Installation

If you prefer manual setup:

```bash
# Install Python dependencies
pip install -r requirements.txt

# Compile C++ extensions
cd hy3dgen/texgen/differentiable_renderer
python setup.py build_ext --inplace

cd ../custom_rasterizer
python setup.py build_ext --inplace

# Return to hunyuan3d directory
cd ../../..

# Download models (optional - done automatically on first use)
python -c "
from huggingface_hub import snapshot_download
snapshot_download('tencent/Hunyuan3D-2', cache_dir='./models')
snapshot_download('tencent/Hunyuan3D-2mini', cache_dir='./models')
"
```

## 🎮 Usage

### Starting the Real Server

```bash
# Start with default settings
python real_hunyuan3d_server.py

# Start with custom configuration
python real_hunyuan3d_server.py \
  --host 0.0.0.0 \
  --port 8000 \
  --model-path tencent/Hunyuan3D-2 \
  --enable-texture \
  --preload-models
```

### Server Options

- `--host`: Server host (default: 0.0.0.0)
- `--port`: Server port (default: 8000)
- `--model-path`: Hunyuan3D model to use (default: tencent/Hunyuan3D-2)
- `--enable-texture`: Enable texture generation (default: True)
- `--preload-models`: Load models at startup (slower start, faster inference)

### Available Models

- `tencent/Hunyuan3D-2`: Full model (best quality, slower)
- `tencent/Hunyuan3D-2mini`: Lightweight model (faster, good quality)
- `tencent/Hunyuan3D-2mv`: Multi-view model

## 🔌 API Integration

The real server provides the same API as the original Hunyuan3D repository with enhanced features:

### Endpoints

#### Health Check
```bash
GET http://localhost:8000/health
```

#### Analyze Blueprint
```bash
POST http://localhost:8000/analyze
Content-Type: multipart/form-data

file: [blueprint image]
```

#### Generate 3D Model
```bash
POST http://localhost:8000/generate3d
Content-Type: multipart/form-data

image: [blueprint image]
prompt: "A detailed 3D architectural building model"
style: "architectural"
quality: "standard"
include_textures: true
octree_resolution: 128
num_inference_steps: 5
guidance_scale: 5.0
max_face_count: 40000
seed: 1234
```

#### Check Job Status
```bash
GET http://localhost:8000/status/{job_id}
```

#### Download Results
```bash
GET http://localhost:8000/download/{job_id}/model_glb
GET http://localhost:8000/download/{job_id}/texture
```

## 🎯 Frontend Integration

The ConstructAI frontend automatically detects and uses the real Hunyuan3D server when available:

1. **Real Server Available**: Uses actual Hunyuan3D-2 models for conversion
2. **Fallback Mode**: Gracefully falls back to simulation when server is unavailable
3. **Hybrid Analysis**: Combines real AI analysis with browser-based computer vision

### Environment Variables

Add to your `.env.local`:

```env
# Real Hunyuan3D server URL
NEXT_PUBLIC_HUNYUAN3D_URL=http://localhost:8000
HUNYUAN3D_SERVER_URL=http://localhost:8000
```

## 📊 Performance Optimization

### GPU Optimization
- **Memory Management**: Automatic GPU memory cleanup after each job
- **Batch Processing**: Queue multiple requests efficiently
- **Model Caching**: Keep models loaded for faster subsequent requests

### CPU Fallback
- **Automatic Detection**: Falls back to CPU if GPU is unavailable
- **Optimized Settings**: Reduced resolution and steps for CPU inference
- **Memory Monitoring**: Tracks and manages system resource usage

## 🐛 Troubleshooting

### Common Issues

#### CUDA Out of Memory
```bash
# Reduce model resolution
python real_hunyuan3d_server.py --model-path tencent/Hunyuan3D-2mini
```

#### C++ Compilation Errors
```bash
# Ensure proper build tools are installed
# Ubuntu/Debian:
sudo apt-get install build-essential ninja-build

# CentOS/RHEL:
sudo yum groupinstall "Development Tools"
sudo yum install ninja-build
```

#### Model Download Issues
```bash
# Manual model download
huggingface-cli download tencent/Hunyuan3D-2 --cache-dir ./models
```

### Debugging

Enable detailed logging:
```bash
export TORCH_SHOW_CPP_STACKTRACES=1
export CUDA_LAUNCH_BLOCKING=1
python real_hunyuan3d_server.py --log-level DEBUG
```

## 🔧 Configuration

### Server Configuration

Edit `real_hunyuan3d_server.py` to customize:

```python
# Model settings
DEFAULT_MODEL = "tencent/Hunyuan3D-2"
DEFAULT_QUALITY = "standard"
MAX_QUEUE_SIZE = 5
TIMEOUT_SECONDS = 120

# Resource limits
MAX_MEMORY_GB = 16
MAX_GPU_MEMORY_GB = 8
```

### Frontend Configuration

Update `src/lib/hunyuan3d-service.ts`:

```typescript
this.config = {
  baseUrl: 'http://localhost:8000',
  model: 'tencent/Hunyuan3D-2',
  enableTextures: true,
  quality: 'standard',
  timeout: 120000,
  fallbackMode: true
};
```

## 🚀 Deployment

### Development
```bash
# Start the server in development mode
python real_hunyuan3d_server.py
```

### Production

```bash
# Use gunicorn for production deployment
pip install gunicorn uvloop

gunicorn real_hunyuan3d_server:app \
  --worker-class uvicorn.workers.UvicornWorker \
  --workers 2 \
  --bind 0.0.0.0:8000 \
  --timeout 300
```

### Docker Deployment

```dockerfile
FROM nvidia/cuda:11.8-devel-ubuntu20.04

WORKDIR /app
COPY . .

RUN pip install -r requirements.txt
RUN python setup_hunyuan3d.py

EXPOSE 8000
CMD ["python", "real_hunyuan3d_server.py", "--host", "0.0.0.0"]
```

## 📈 Monitoring

### Health Monitoring
- **GPU Memory**: Tracked automatically
- **Processing Time**: Logged for each request
- **Queue Status**: Monitor processing backlog
- **Error Rates**: Track conversion failures

### Metrics Endpoints
```bash
# Server health
GET /health

# Processing statistics
GET /metrics

# Model information
GET /formats
```

## 🔐 Security

### API Security
- **Input Validation**: File type and size restrictions
- **Rate Limiting**: Prevent abuse (implement as needed)
- **Resource Limits**: Memory and processing time caps

### File Security
- **Temporary Files**: Automatic cleanup after processing
- **Input Sanitization**: Validate all uploaded files
- **Output Security**: Secure file serving

## 📚 Additional Resources

- [Official Hunyuan3D-2 Repository](https://github.com/Tencent-Hunyuan/Hunyuan3D-2)
- [Hunyuan3D-2 Paper](https://arxiv.org/abs/2501.12202)
- [Model Weights on Hugging Face](https://huggingface.co/tencent/Hunyuan3D-2)
- [Community Discord](https://discord.gg/dNBrdrGGMa)

## 🤝 Contributing

This integration follows the same contribution guidelines as the main ConstructAI project. When contributing:

1. Test with both real and fallback modes
2. Ensure backward compatibility
3. Update documentation for any API changes
4. Test GPU and CPU operation modes

## 📄 License

This integration respects the original Hunyuan3D-2 license (Tencent Hunyuan Non-Commercial License Agreement). The integration code follows the same license as the main ConstructAI project.

---

**🎉 Congratulations!** You now have a complete, production-ready integration of Tencent's Hunyuan3D-2 models in your ConstructAI platform!
