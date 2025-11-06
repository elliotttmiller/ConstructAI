#!/usr/bin/env python3
"""
Setup script for Real Hunyuan3D-2 Integration
Handles model downloads, C++ compilation, and environment setup
"""

import os
import sys
import subprocess
import platform
from pathlib import Path
import torch
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_system_requirements():
    """Check if system meets requirements"""
    logger.info("Checking system requirements...")

    # Check Python version
    python_version = sys.version_info
    logger.info(f"Python version: {python_version.major}.{python_version.minor}.{python_version.micro}")
    
    if python_version < (3, 8):
        raise RuntimeError(f"Python 3.8+ is required, but found {python_version.major}.{python_version.minor}.{python_version.micro}")
    
    logger.info(f"✅ Python {python_version.major}.{python_version.minor}.{python_version.micro} meets requirements")

    # Check CUDA availability
    cuda_available = torch.cuda.is_available()
    logger.info(f"CUDA available: {cuda_available}")

    if cuda_available:
        logger.info(f"CUDA version: {torch.version.cuda}")
        logger.info(f"GPU count: {torch.cuda.device_count()}")
        for i in range(torch.cuda.device_count()):
            logger.info(f"GPU {i}: {torch.cuda.get_device_name(i)}")

    # Check for required system tools
    required_tools = ['ninja', 'gcc', 'g++'] if platform.system() != 'Windows' else ['ninja']

    for tool in required_tools:
        try:
            subprocess.run([tool, '--version'], capture_output=True, check=True)
            logger.info(f"✅ {tool} is available")
        except (subprocess.CalledProcessError, FileNotFoundError):
            logger.warning(f"⚠️ {tool} not found. Some features may not work.")

    return True

def install_python_dependencies():
    """Install Python dependencies"""
    logger.info("Installing Python dependencies...")

    try:
        subprocess.run([
            sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'
        ], check=True)
        logger.info("✅ Python dependencies installed successfully")
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ Failed to install dependencies: {e}")
        raise

def compile_cpp_extensions():
    """Compile C++ extensions for differentiable renderer and custom rasterizer"""
    logger.info("Compiling C++ extensions...")

    extensions = [
        "hy3dgen/texgen/differentiable_renderer",
        "hy3dgen/texgen/custom_rasterizer"
    ]

    for ext_dir in extensions:
        if Path(ext_dir).exists():
            logger.info(f"Compiling extension in {ext_dir}")
            try:
                # Change to extension directory
                original_dir = os.getcwd()
                os.chdir(ext_dir)

                # Run setup.py if it exists
                if Path("setup.py").exists():
                    subprocess.run([
                        sys.executable, 'setup.py', 'build_ext', '--inplace'
                    ], check=True)
                    logger.info(f"✅ Compiled {ext_dir}")
                else:
                    logger.warning(f"⚠️ No setup.py found in {ext_dir}")

                os.chdir(original_dir)

            except subprocess.CalledProcessError as e:
                logger.error(f"❌ Failed to compile {ext_dir}: {e}")
                os.chdir(original_dir)
                # Don't raise here, some extensions might be optional
                logger.warning(f"⚠️ Continuing without {ext_dir}")
        else:
            logger.warning(f"⚠️ Extension directory {ext_dir} not found")

def download_models():
    """Download and cache Hunyuan3D models"""
    logger.info("Downloading Hunyuan3D models...")

    models_to_download = [
        "tencent/Hunyuan3D-2",
        "tencent/Hunyuan3D-2mini"
    ]

    try:
        from huggingface_hub import snapshot_download

        for model_name in models_to_download:
            logger.info(f"Downloading {model_name}...")
            try:
                cache_dir = snapshot_download(
                    repo_id=model_name,
                    cache_dir="./models",
                    resume_download=True
                )
                logger.info(f"✅ Downloaded {model_name} to {cache_dir}")
            except Exception as e:
                logger.error(f"❌ Failed to download {model_name}: {e}")
                logger.info("Models will be downloaded automatically when first used")

    except ImportError:
        logger.info("Installing huggingface_hub for model downloads...")
        subprocess.run([
            sys.executable, '-m', 'pip', 'install', 'huggingface_hub'
        ], check=True)

        # Retry download
        download_models()

def setup_environment():
    """Setup environment variables and configuration"""
    logger.info("Setting up environment...")

    # Create necessary directories
    directories = [
        "models",
        "outputs",
        "temp",
        "gradio_cache"
    ]

    for dir_name in directories:
        Path(dir_name).mkdir(exist_ok=True)
        logger.info(f"✅ Created directory: {dir_name}")

    # Set environment variables for better performance
    env_vars = {
        "TORCH_CUDNN_V8_API_ENABLED": "1",
        "CUDA_LAUNCH_BLOCKING": "0",
        "TOKENIZERS_PARALLELISM": "false"
    }

    for key, value in env_vars.items():
        os.environ[key] = value
        logger.info(f"Set {key}={value}")

def verify_installation():
    """Verify that installation was successful"""
    logger.info("Verifying installation...")

    try:
        # Test imports
        from hy3dgen.rembg import BackgroundRemover
        from hy3dgen.shapegen import Hunyuan3DDiTFlowMatchingPipeline
        from hy3dgen.texgen import Hunyuan3DPaintPipeline

        logger.info("✅ All core imports successful")

        # Test basic functionality
        logger.info("Testing basic functionality...")

        # Test background remover
        bg_remover = BackgroundRemover()
        logger.info("✅ Background remover initialized")

        logger.info("✅ Installation verification successful!")
        return True

    except Exception as e:
        logger.error(f"❌ Installation verification failed: {e}")
        return False

def main():
    """Main setup function"""
    logger.info("🚀 Starting Hunyuan3D-2 Real Integration Setup")

    try:
        # Step 1: Check system requirements
        check_system_requirements()

        # Step 2: Install Python dependencies
        install_python_dependencies()

        # Step 3: Compile C++ extensions
        compile_cpp_extensions()

        # Step 4: Setup environment
        setup_environment()

        # Step 5: Download models (optional, can be done later)
        download_models()

        # Step 6: Verify installation
        if verify_installation():
            logger.info("🎉 Hunyuan3D-2 Real Integration Setup Complete!")
            logger.info("Run 'python real_hunyuan3d_server.py' to start the server")
        else:
            logger.error("❌ Setup verification failed")
            sys.exit(1)

    except Exception as e:
        logger.error(f"❌ Setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
