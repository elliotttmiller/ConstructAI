# Hunyuan3D Server - Quick Start Guide

## 🎯 Seamless Configuration with .env.local

All server settings are now configured in your project's `.env.local` file!

### Configuration Variables

Add these to your `.env.local`:

```bash
# Hunyuan3D AI Server Configuration
HUNYUAN3D_HOST=0.0.0.0
HUNYUAN3D_PORT=8000
HUNYUAN3D_MODEL_PATH=tencent/Hunyuan3D-2mini
HUNYUAN3D_ENABLE_TEXTURE=true
HUNYUAN3D_PRELOAD_MODELS=false
```

## 🚀 Starting the Server

### Option 1: Python Launcher (Recommended - Cross-platform)
```powershell
cd hunyuan3d
python start_hunyuan3d.py
```

### Option 2: PowerShell (Windows)
```powershell
cd hunyuan3d
.\start_hunyuan3d.ps1
```

### Option 3: Direct Python
```powershell
cd hunyuan3d
python real_hunyuan3d_server.py
```

## ⚙️ Configuration Modes

### 🎨 Full Quality (Photo-realistic textures)
```bash
# In .env.local:
HUNYUAN3D_ENABLE_TEXTURE=true
HUNYUAN3D_MODEL_PATH=tencent/Hunyuan3D-2
```
Or command-line:
```powershell
python start_hunyuan3d.py --enable-texture --full-model
```

### ⚡ Fast Mode (Geometry only, no textures)
```bash
# In .env.local:
HUNYUAN3D_ENABLE_TEXTURE=false
HUNYUAN3D_MODEL_PATH=tencent/Hunyuan3D-2mini
```
Or command-line:
```powershell
python start_hunyuan3d.py --geometry-only
# or
.\start_hunyuan3d.ps1 -GeometryOnly
```

## 🎛️ Command-Line Options

Command-line arguments **override** .env.local settings:

### Python Version
```bash
python start_hunyuan3d.py --help

Options:
  --host HOST              Server host
  --port PORT              Server port
  --model-path MODEL       Model variant
  --enable-texture         Enable photo-realistic textures
  --disable-texture        Geometry only (faster)
  --geometry-only          Same as --disable-texture
  --preload-models         Load models at startup
  --full-model             Use full model (high VRAM)
```

### PowerShell Version
```powershell
.\start_hunyuan3d.ps1 -Help

Options:
  -ServerHost <host>       Server host
  -Port <port>             Server port
  -Model <model>           Model path
  -EnableTexture           Enable textures
  -DisableTexture          Disable textures
  -GeometryOnly            Geometry only mode
  -Preload                 Preload models
  -FullModel               Use full model
```

## 📊 Model Variants

| Model | VRAM | Speed | Quality |
|-------|------|-------|---------|
| `tencent/Hunyuan3D-2mini` | ~12GB | Fast | Good |
| `tencent/Hunyuan3D-2` | ~24GB | Slower | Best |
| `tencent/Hunyuan3D-2mv` | ~18GB | Medium | Specialized |

## 🔍 Understanding Modes

### Texture Enabled (Default)
- ✅ Photo-realistic materials
- ✅ UV-mapped textures
- ✅ Detailed surfaces
- ⏱️ Slower generation (~60-120s)
- 💾 More VRAM required

### Geometry Only (Fast)
- ✅ Full 3D mesh with faces
- ✅ Basic materials/colors
- ✅ All geometry details
- ❌ No photo-realistic textures
- ⚡ Faster generation (~30-60s)
- 💾 Less VRAM required

**Note:** Geometry-only is **NOT** wireframe - you still get solid 3D models!

## 🌐 API Endpoints

Once running:
- **Health Check:** `http://localhost:8000/health`
- **API Docs:** `http://localhost:8000/docs`
- **Generate 3D:** `POST http://localhost:8000/generate`
- **Job Status:** `GET http://localhost:8000/status/{job_id}`

## 🔄 Typical Workflow

1. **Configure once in .env.local**
   ```bash
   HUNYUAN3D_ENABLE_TEXTURE=false  # Start with fast mode
   HUNYUAN3D_MODEL_PATH=tencent/Hunyuan3D-2mini
   ```

2. **Start server**
   ```powershell
   python start_hunyuan3d.py
   ```

3. **Server runs with your settings automatically** - no need to pass flags every time!

4. **Override when needed**
   ```powershell
   # Need high quality for one session?
   python start_hunyuan3d.py --enable-texture --full-model
   ```

## ✅ Examples

### Basic Start (uses .env.local settings)
```powershell
python start_hunyuan3d.py
```

### Fast Development Mode
```powershell
python start_hunyuan3d.py --geometry-only --preload-models
```

### Production Quality Mode
```powershell
python start_hunyuan3d.py --full-model --enable-texture --preload-models
```

### Custom Port
```powershell
python start_hunyuan3d.py --port 9000
```

### PowerShell Examples
```powershell
# Fast mode
.\start_hunyuan3d.ps1 -GeometryOnly

# Full quality
.\start_hunyuan3d.ps1 -FullModel -EnableTexture -Preload

# Custom configuration
.\start_hunyuan3d.ps1 -Port 9000 -Model "tencent/Hunyuan3D-2"
```
