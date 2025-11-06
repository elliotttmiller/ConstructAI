#!/usr/bin/env python3
"""
Hunyuan3D Server Launcher with .env.local support
Automatically loads configuration from parent .env.local file
"""

import os
import sys
import argparse
from pathlib import Path
from dotenv import load_dotenv

# Colors for terminal output
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    CYAN = '\033[96m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_status(msg):
    print(f"{Colors.GREEN}✅ {msg}{Colors.END}")

def print_warning(msg):
    print(f"{Colors.YELLOW}⚠️  {msg}{Colors.END}")

def print_error(msg):
    print(f"{Colors.RED}❌ {msg}{Colors.END}")

def print_header(msg):
    print(f"\n{Colors.CYAN}{Colors.BOLD}🚀 {msg}{Colors.END}\n")

def load_env_config():
    """Load environment variables from .env.local in parent directory"""
    # Get parent directory (project root)
    parent_dir = Path(__file__).parent.parent
    env_file = parent_dir / ".env.local"
    
    if env_file.exists():
        load_dotenv(env_file, override=False)  # Don't override existing env vars
        print_status(f"Configuration loaded from {env_file}")
        return True
    else:
        print_warning("No .env.local found, using defaults")
        return False

def main():
    print_header("Real Hunyuan3D-2 Server Launcher")
    
    # Load environment configuration first
    load_env_config()
    
    # Parse command-line arguments (these override .env.local)
    parser = argparse.ArgumentParser(description="Start Hunyuan3D-2 server with auto-configuration")
    parser.add_argument(
        "--host",
        type=str,
        default=os.getenv("HUNYUAN3D_HOST", "0.0.0.0"),
        help="Server host (default: from .env.local or 0.0.0.0)"
    )
    parser.add_argument(
        "--port",
        type=int,
        default=int(os.getenv("HUNYUAN3D_PORT", "8000")),
        help="Server port (default: from .env.local or 8000)"
    )
    parser.add_argument(
        "--model-path",
        type=str,
        default=os.getenv("HUNYUAN3D_MODEL_PATH", "tencent/Hunyuan3D-2mini"),
        help="Model path (default: from .env.local or mini model)"
    )
    parser.add_argument(
        "--enable-texture",
        action="store_true",
        default=None,
        help="Enable photo-realistic textures"
    )
    parser.add_argument(
        "--disable-texture",
        action="store_true",
        help="Disable textures (geometry only, faster)"
    )
    parser.add_argument(
        "--geometry-only",
        action="store_true",
        help="Same as --disable-texture"
    )
    parser.add_argument(
        "--preload-models",
        action="store_true",
        default=os.getenv("HUNYUAN3D_PRELOAD_MODELS", "false").lower() == "true",
        help="Preload models at startup"
    )
    parser.add_argument(
        "--full-model",
        action="store_true",
        help="Use full Hunyuan3D-2 model (requires more VRAM)"
    )
    
    args = parser.parse_args()
    
    # Handle full model flag
    if args.full_model:
        args.model_path = "tencent/Hunyuan3D-2"
    
    # Determine texture mode
    if args.disable_texture or args.geometry_only:
        texture_enabled = False
    elif args.enable_texture:
        texture_enabled = True
    else:
        # Use environment variable default
        texture_enabled = os.getenv("HUNYUAN3D_ENABLE_TEXTURE", "true").lower() == "true"
    
    # Display configuration
    print("Configuration:")
    print(f"  Host: {args.host}")
    print(f"  Port: {args.port}")
    print(f"  Model: {args.model_path}")
    print(f"  Texture: {'✅ Enabled (Photo-realistic)' if texture_enabled else '⚡ Disabled (Geometry Only - Faster)'}")
    print(f"  Preload: {'Yes' if args.preload_models else 'No'}")
    print()
    
    # Check if server script exists
    server_script = Path(__file__).parent / "real_hunyuan3d_server.py"
    if not server_script.exists():
        print_error("real_hunyuan3d_server.py not found!")
        print_error("Please run this script from the hunyuan3d directory")
        sys.exit(1)
    
    # Build command
    cmd = [
        sys.executable,  # Python executable
        str(server_script),
        "--host", args.host,
        "--port", str(args.port),
        "--model-path", args.model_path
    ]
    
    if texture_enabled:
        cmd.append("--enable-texture")
    else:
        cmd.append("--disable-texture")
    
    if args.preload_models:
        cmd.append("--preload-models")
    
    print_header("Starting Server")
    print(f"Command: {' '.join(cmd)}")
    print()
    print(f"{Colors.CYAN}Server will be available at: http://{args.host}:{args.port}{Colors.END}")
    print(f"{Colors.CYAN}Health check: http://{args.host}:{args.port}/health{Colors.END}")
    print(f"{Colors.CYAN}API docs: http://{args.host}:{args.port}/docs{Colors.END}")
    print()
    print(f"{Colors.YELLOW}Press Ctrl+C to stop the server{Colors.END}")
    print()
    
    # Execute the server
    import subprocess
    try:
        subprocess.run(cmd)
    except KeyboardInterrupt:
        print()
        print_status("Server stopped")
        sys.exit(0)
    except Exception as e:
        print_error(f"Failed to start server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
