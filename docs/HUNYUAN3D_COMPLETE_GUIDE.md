# Hunyuan3D-2 Complete Integration & Deployment Guide

## 🎯 Overview

ConstructAI features **real AI-powered 2D to 3D conversion** using Tencent's Hunyuan3D-2 model. This guide covers everything from basic setup to enterprise production deployment.

### Key Features
- **Real AI Conversion**: Actual Tencent Hunyuan3D-2 neural network (not simulation)
- **GPU Acceleration**: CUDA-optimized inference for production speed
- **Multiple Models**: Full, mini, and multi-view model variants
- **High Quality Output**: Professional-grade 3D models (OBJ, GLTF, PLY, FBX)
- **Intelligent Analysis**: Automatic detection of architectural elements
- **Graceful Fallback**: Continues working when AI service unavailable

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [System Requirements](#system-requirements)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Production Deployment](#production-deployment)
6. [Docker Deployment](#docker-deployment)
7. [Kubernetes Deployment](#kubernetes-deployment)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### For Development (Local Setup)

```bash
# 1. Navigate to Hunyuan3D directory
cd hunyuan3d

# 2. Run automated setup (one-time)
python setup_hunyuan3d.py
# This will:
# - Install Python dependencies
# - Compile C++ extensions
# - Download AI models (~2-4GB)
# - Configure CUDA (if available)

# 3. Start the AI server
./start_hunyuan3d.sh
# Server starts on http://localhost:8000

# 4. In another terminal, start the main app
cd ..
npm run dev
# App runs on http://localhost:3000
```

### Testing the Integration

1. Navigate to **BIM Viewer** page
2. Click **"Upload Blueprint"**
3. Select a 2D blueprint (JPG, PNG, PDF, DWG)
4. Watch real-time AI conversion
5. View 3D model in interactive viewer

---

## 💻 System Requirements

### Development Environment

#### Minimum (Testing Only)
- **CPU**: 8+ cores (Intel/AMD)
- **RAM**: 16GB DDR4
- **GPU**: NVIDIA RTX 3060 (8GB VRAM)
- **Storage**: 50GB SSD
- **OS**: Ubuntu 20.04+ / Windows 10+

#### Recommended (Development)
- **CPU**: 12+ cores
- **RAM**: 24GB DDR4
- **GPU**: NVIDIA RTX 3080 (10GB VRAM)
- **Storage**: 100GB SSD
- **OS**: Ubuntu 22.04 LTS

### Production Environment

#### Small-Scale Production (<100 users)
- **CPU**: 16 cores (Intel Xeon/AMD EPYC)
- **RAM**: 32GB DDR4/DDR5
- **GPU**: NVIDIA RTX 4080 (16GB VRAM)
- **Storage**: 100GB NVMe SSD
- **Network**: 1Gbps ethernet
- **OS**: Ubuntu 22.04 LTS

#### Medium-Scale Production (100-1000 users)
- **CPU**: 32 cores, multiple sockets
- **RAM**: 64GB DDR5
- **GPU**: NVIDIA A100 (40GB VRAM)
- **Storage**: 500GB NVMe SSD RAID
- **Network**: 10Gbps ethernet
- **OS**: Ubuntu 22.04 LTS

#### Enterprise-Scale (1000+ users)
- **Multiple Servers** for load balancing
- **GPU Cluster**: Multiple NVIDIA A100/H100
- **Distributed Storage**: Multi-TB NVMe arrays
- **High-Availability**: Redundant systems
- **Network**: 25Gbps+ ethernet with load balancers

### Software Dependencies

```bash
# Core Requirements
Python 3.8+
CUDA Toolkit 11.8+
cuDNN 8.6+
NVIDIA Driver 520+

# Build Tools
gcc/g++ 9+
cmake 3.18+
ninja-build
git

# Python Packages (installed automatically)
torch>=2.0.0
torchvision>=0.15.0
diffusers>=0.24.0
transformers>=4.35.0
xformers>=0.0.22
trimesh>=4.0.0
pillow>=10.0.0
```

---

## 🔧 Installation

### 1. Prerequisites Setup

#### Ubuntu/Debian
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install build essentials
sudo apt install -y build-essential cmake ninja-build git wget curl

# Install NVIDIA Driver (if not installed)
sudo apt install -y nvidia-driver-520 nvidia-utils-520

# Install CUDA Toolkit
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-ubuntu2204.pin
sudo mv cuda-ubuntu2204.pin /etc/apt/preferences.d/cuda-repository-pin-600
sudo apt-key adv --fetch-keys https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/3bf863cc.pub
sudo add-apt-repository "deb https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/ /"
sudo apt update
sudo apt install -y cuda-toolkit-11-8

# Verify installation
nvidia-smi
nvcc --version
```

#### CentOS/RHEL
```bash
# Install development tools
sudo yum groupinstall -y "Development Tools"
sudo yum install -y cmake ninja-build git wget

# Install NVIDIA Driver
sudo yum install -y nvidia-driver-latest-dkms
sudo yum install -y cuda-11-8
```

### 2. Hunyuan3D Setup

```bash
# Clone/Navigate to project
cd /path/to/ConstructAI

# Run automated setup
cd hunyuan3d
python setup_hunyuan3d.py --install-all

# The setup script will:
# 1. Create Python virtual environment
# 2. Install PyTorch with CUDA support
# 3. Install all dependencies
# 4. Compile C++ extensions (faster inference)
# 5. Download model weights (~2-4GB)
# 6. Verify GPU availability
# 7. Run basic tests
```

### 3. Manual Setup (If Automated Fails)

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# OR
venv\Scripts\activate  # Windows

# Install PyTorch with CUDA
pip install torch==2.0.1+cu118 torchvision==0.15.2+cu118 --index-url https://download.pytorch.org/whl/cu118

# Install dependencies
pip install -r requirements.txt

# Compile extensions
cd hy3dgen
python setup.py build_ext --inplace
cd ..

# Download models
python download_models.py --all
```

---

## ⚙️ Configuration

### Environment Variables

Create `.env` file in project root:

```bash
# Hunyuan3D Service Configuration
NEXT_PUBLIC_HUNYUAN3D_URL=http://localhost:8000
HUNYUAN3D_MODEL_PATH=/path/to/models
HUNYUAN3D_CACHE_DIR=/path/to/cache
HUNYUAN3D_GPU_MEMORY_LIMIT=8GB
HUNYUAN3D_BATCH_SIZE=1
HUNYUAN3D_NUM_WORKERS=4

# Model Settings
HUNYUAN3D_MODEL_VARIANT=full  # Options: full, mini, multi-view
HUNYUAN3D_QUALITY=standard    # Options: fast, standard, high
HUNYUAN3D_ENABLE_TEXTURE=true
HUNYUAN3D_OUTPUT_FORMAT=obj   # Options: obj, gltf, ply, fbx

# Performance Settings
HUNYUAN3D_MAX_QUEUE_SIZE=10
HUNYUAN3D_TIMEOUT=120
HUNYUAN3D_ENABLE_MONITORING=true
```

### Service Configuration

Edit `hunyuan3d/config.yaml`:

```yaml
server:
  host: "0.0.0.0"
  port: 8000
  workers: 4
  timeout: 120

models:
  base_path: "./models"
  variant: "full"  # full, mini, multi-view
  precision: "fp16"  # fp16, fp32
  enable_xformers: true

processing:
  max_queue_size: 10
  batch_size: 1
  gpu_memory_fraction: 0.8
  enable_caching: true
  cache_ttl: 3600

output:
  default_format: "obj"
  quality: "standard"  # fast, standard, high
  enable_texture: true
  texture_resolution: 1024

monitoring:
  enable_metrics: true
  log_level: "INFO"
  health_check_interval: 30
```

---

## 🚀 Production Deployment

### Option 1: Bare Metal Deployment

#### 1. Production Setup
```bash
# Create production user
sudo useradd -m -s /bin/bash hunyuan3d
sudo usermod -aG docker hunyuan3d

# Setup directories
sudo mkdir -p /opt/hunyuan3d/{models,cache,logs}
sudo chown -R hunyuan3d:hunyuan3d /opt/hunyuan3d

# Copy application
sudo cp -r hunyuan3d /opt/hunyuan3d/app
sudo chown -R hunyuan3d:hunyuan3d /opt/hunyuan3d/app

# Setup Python environment
cd /opt/hunyuan3d/app
sudo -u hunyuan3d python -m venv venv
sudo -u hunyuan3d venv/bin/pip install -r requirements.txt
```

#### 2. Systemd Service
Create `/etc/systemd/system/hunyuan3d.service`:

```ini
[Unit]
Description=Hunyuan3D AI Service
After=network.target

[Service]
Type=simple
User=hunyuan3d
WorkingDirectory=/opt/hunyuan3d/app
Environment="CUDA_VISIBLE_DEVICES=0"
Environment="PATH=/opt/hunyuan3d/app/venv/bin:$PATH"
ExecStart=/opt/hunyuan3d/app/venv/bin/python real_hunyuan3d_server.py
Restart=always
RestartSec=10
StandardOutput=append:/opt/hunyuan3d/logs/service.log
StandardError=append:/opt/hunyuan3d/logs/error.log

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable hunyuan3d
sudo systemctl start hunyuan3d
sudo systemctl status hunyuan3d
```

#### 3. Nginx Reverse Proxy
Create `/etc/nginx/sites-available/hunyuan3d`:

```nginx
upstream hunyuan3d_backend {
    server localhost:8000;
    keepalive 32;
}

server {
    listen 80;
    server_name your-domain.com;

    # Increase timeouts for AI processing
    proxy_connect_timeout 600;
    proxy_send_timeout 600;
    proxy_read_timeout 600;
    send_timeout 600;

    # File upload limits
    client_max_body_size 100M;

    location /api/hunyuan3d/ {
        proxy_pass http://hunyuan3d_backend/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/hunyuan3d /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### Option 2: Docker Deployment

#### 1. Create Dockerfile
```dockerfile
FROM nvidia/cuda:11.8.0-cudnn8-devel-ubuntu22.04

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3.10 python3-pip python3-dev \
    build-essential cmake ninja-build git wget \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install Python packages
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Compile C++ extensions
RUN cd hy3dgen && python3 setup.py build_ext --inplace

# Download models (or mount volume)
RUN python3 download_models.py --all

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python3 -c "import requests; requests.get('http://localhost:8000/health')"

# Start server
CMD ["python3", "real_hunyuan3d_server.py", "--host", "0.0.0.0", "--port", "8000"]
```

#### 2. Docker Compose
Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  hunyuan3d:
    build:
      context: ./hunyuan3d
      dockerfile: Dockerfile
    container_name: hunyuan3d-service
    restart: unless-stopped
    ports:
      - "8000:8000"
    volumes:
      - ./models:/app/models:ro
      - ./cache:/app/cache
      - ./logs:/app/logs
    environment:
      - CUDA_VISIBLE_DEVICES=0
      - HUNYUAN3D_MODEL_PATH=/app/models
      - HUNYUAN3D_CACHE_DIR=/app/cache
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    container_name: nginx-proxy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - hunyuan3d
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

#### 3. Deploy with Docker
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f hunyuan3d

# Check status
docker-compose ps

# Restart service
docker-compose restart hunyuan3d

# Stop all
docker-compose down
```

---

### Option 3: Kubernetes Deployment

#### 1. Create Deployment
`k8s/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hunyuan3d
  labels:
    app: hunyuan3d
spec:
  replicas: 2
  selector:
    matchLabels:
      app: hunyuan3d
  template:
    metadata:
      labels:
        app: hunyuan3d
    spec:
      containers:
      - name: hunyuan3d
        image: your-registry/hunyuan3d:latest
        ports:
        - containerPort: 8000
        env:
        - name: CUDA_VISIBLE_DEVICES
          value: "0"
        - name: HUNYUAN3D_MODEL_PATH
          value: "/models"
        resources:
          requests:
            memory: "16Gi"
            cpu: "8"
            nvidia.com/gpu: "1"
          limits:
            memory: "32Gi"
            cpu: "16"
            nvidia.com/gpu: "1"
        volumeMounts:
        - name: models
          mountPath: /models
          readOnly: true
        - name: cache
          mountPath: /cache
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 60
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
      volumes:
      - name: models
        persistentVolumeClaim:
          claimName: hunyuan3d-models
      - name: cache
        emptyDir: {}
      nodeSelector:
        nvidia.com/gpu: "true"
```

#### 2. Create Service
`k8s/service.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: hunyuan3d-service
spec:
  type: LoadBalancer
  selector:
    app: hunyuan3d
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8000
```

#### 3. Deploy to Kubernetes
```bash
# Apply configurations
kubectl apply -f k8s/

# Check deployment
kubectl get pods -l app=hunyuan3d
kubectl get services

# View logs
kubectl logs -f deployment/hunyuan3d

# Scale deployment
kubectl scale deployment/hunyuan3d --replicas=4
```

---

## 📊 Monitoring & Maintenance

### Health Monitoring

#### Check Service Status
```bash
# HTTP health check
curl http://localhost:8000/health

# Detailed metrics
curl http://localhost:8000/metrics

# GPU utilization
nvidia-smi -l 1

# Service logs
tail -f /opt/hunyuan3d/logs/service.log
```

#### Prometheus Metrics
Add to `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'hunyuan3d'
    static_configs:
      - targets: ['localhost:8000']
    metrics_path: '/metrics'
    scrape_interval: 15s
```

### Performance Tuning

#### GPU Memory Optimization
```python
# In config.yaml or environment
processing:
  gpu_memory_fraction: 0.8  # Use 80% of GPU memory
  enable_memory_growth: true
  clear_cache_after_inference: true
```

#### Batch Processing
```python
processing:
  batch_size: 2  # Process 2 blueprints simultaneously
  max_queue_size: 20
  worker_threads: 4
```

### Backup & Recovery

```bash
# Backup models
tar -czf models-backup-$(date +%Y%m%d).tar.gz /opt/hunyuan3d/models

# Backup configuration
cp /opt/hunyuan3d/app/config.yaml config-backup-$(date +%Y%m%d).yaml

# Restore from backup
tar -xzf models-backup-20250101.tar.gz -C /opt/hunyuan3d/
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. CUDA Out of Memory
```
Error: CUDA out of memory
```

**Solution:**
- Reduce `gpu_memory_fraction` in config
- Decrease `batch_size` to 1
- Use `mini` model variant instead of `full`
- Clear cache: `rm -rf /opt/hunyuan3d/cache/*`

#### 2. Model Download Fails
```
Error: Failed to download model weights
```

**Solution:**
```bash
# Manual download
cd hunyuan3d
python download_models.py --all --force

# Or download from mirrors
wget https://huggingface.co/tencent/Hunyuan3D-2/resolve/main/weights.bin
```

#### 3. Slow Inference
```
Warning: Inference taking > 60 seconds
```

**Solution:**
- Enable xFormers: `pip install xformers`
- Use FP16 precision instead of FP32
- Ensure GPU is not being used by other processes
- Check GPU temperature: `nvidia-smi`

#### 4. Service Won't Start
```
Error: Address already in use
```

**Solution:**
```bash
# Kill existing process
sudo lsof -i :8000
sudo kill -9 <PID>

# Or change port in config
# port: 8001
```

### Diagnostic Commands

```bash
# Check GPU availability
python -c "import torch; print(torch.cuda.is_available())"

# Test basic inference
python test_inference.py --input sample.jpg

# Verify dependencies
pip list | grep -E "torch|diffusers|transformers"

# Check system resources
htop
nvidia-smi
df -h
```

### Getting Help

- **Documentation**: Check `/docs` folder
- **Logs**: `/opt/hunyuan3d/logs/service.log`
- **GitHub Issues**: Report bugs and get support
- **Community**: Join discussions

---

## 📈 Performance Benchmarks

### Typical Performance (RTX 4080)
- **Blueprint Upload**: < 1 second
- **Preprocessing**: 1-2 seconds
- **AI Inference**: 15-30 seconds
- **Texture Generation**: 15-30 seconds (optional)
- **Total Time**: 30-60 seconds per blueprint

### Optimization Tips
1. Use `mini` model for faster results (10-15s)
2. Disable textures for 2x speed boost
3. Use FP16 precision for 30% speedup
4. Enable xFormers for 20% memory reduction
5. Batch multiple blueprints together

---

## ✅ Production Checklist

Before going live:

- [ ] GPU drivers and CUDA installed
- [ ] All dependencies installed
- [ ] Models downloaded and verified
- [ ] Configuration optimized for production
- [ ] Systemd service configured (or Docker)
- [ ] Reverse proxy set up (Nginx/Apache)
- [ ] SSL certificates configured
- [ ] Monitoring enabled
- [ ] Backup procedures in place
- [ ] Load testing completed
- [ ] Documentation reviewed
- [ ] Health checks passing

---

## 🎉 Success!

You now have a fully functional Hunyuan3D-2 integration! The platform can:

✅ Convert 2D blueprints to 3D models using real AI
✅ Process multiple files with GPU acceleration
✅ Handle production workloads with monitoring
✅ Scale horizontally with Kubernetes
✅ Gracefully fallback when AI unavailable

For questions or issues, refer to the troubleshooting section or check the main documentation.

---

*Last Updated: November 5, 2025*  
*Version: 2.0 (Production-Ready)*
