#!/usr/bin/env python3
"""
ConstructAI Professional Startup Script

This script manages the startup process for the Next.js application with integrated API routes:
1. Loads environment variables from .env files (.env, .env.local)
2. Validates that required environment variables are set
3. Gracefully terminates any existing process on port 3000
4. Validates Node.js dependencies
5. Starts the Next.js development server (frontend + API routes)
6. Verifies application health
7. Provides real-time status updates and error handling

Author: ConstructAI Team
Version: 2.0.0
Architecture: Next.js 15 with integrated API routes (no separate backend)
"""

# ============================================================================
# CRITICAL: Load environment variables BEFORE any other imports
# This ensures all modules have access to environment configuration
# ============================================================================
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Get project root
PROJECT_ROOT = Path(__file__).parent.absolute()

# Load environment variables with proper priority
# 1. .env (base configuration)
env_file = PROJECT_ROOT / ".env"
if env_file.exists():
    load_dotenv(env_file, override=False)
    print(f"✓ Loaded environment from: {env_file}")
else:
    print(f"ℹ No .env file found (optional)")

# 2. .env.local (local overrides - takes precedence)
env_local_file = PROJECT_ROOT / ".env.local"
if env_local_file.exists():
    load_dotenv(env_local_file, override=True)
    print(f"✓ Loaded local environment overrides from: {env_local_file}")
else:
    print(f"⚠ No .env.local file found - using .env.example as reference")
    print(f"  Run: cp .env.example .env.local")

print("✓ Environment variables loaded successfully\n")

# ============================================================================
# Now import everything else
# ============================================================================
import subprocess
import time
import signal
import platform
import psutil
import requests
from typing import Optional, List
from datetime import datetime


# Configuration - Load from environment with defaults
FRONTEND_PORT = int(os.getenv("PORT", os.getenv("FRONTEND_PORT", "3000")))
FRONTEND_HOST = os.getenv("FRONTEND_HOST", "localhost")
FRONTEND_URL = f"http://{FRONTEND_HOST}:{FRONTEND_PORT}"
MAX_HEALTH_CHECK_ATTEMPTS = int(os.getenv("MAX_HEALTH_CHECK_ATTEMPTS", "30"))
HEALTH_CHECK_INTERVAL = float(os.getenv("HEALTH_CHECK_INTERVAL", "2"))  # seconds
STARTUP_DELAY = float(os.getenv("STARTUP_DELAY", "5"))  # seconds for Next.js initialization


class Colors:
    """ANSI color codes for terminal output."""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


def print_header(message: str):
    """Print a formatted header message."""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*70}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{message.center(70)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*70}{Colors.ENDC}\n")


def print_success(message: str):
    """Print a success message."""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"{Colors.OKGREEN}✓ [{timestamp}] {message}{Colors.ENDC}")


def print_info(message: str):
    """Print an info message."""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"{Colors.OKCYAN}ℹ [{timestamp}] {message}{Colors.ENDC}")


def print_warning(message: str):
    """Print a warning message."""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"{Colors.WARNING}⚠ [{timestamp}] {message}{Colors.ENDC}")


def print_error(message: str):
    """Print an error message."""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"{Colors.FAIL}✗ [{timestamp}] {message}{Colors.ENDC}")


def validate_environment() -> bool:
    """
    Validate that required environment variables are set.
    
    Returns:
        True if all required variables are set, False otherwise
    """
    print_info("Validating environment variables...")
    
    required_vars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'NEXTAUTH_SECRET',
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print_error(f"Missing required environment variables:")
        for var in missing_vars:
            print_error(f"  - {var}")
        print_info("\nPlease create .env.local file with these variables.")
        print_info("See .env.example for reference.")
        return False
    
    print_success("All required environment variables are set")
    
    # Check optional but recommended variables
    optional_vars = ['OPENAI_API_KEY', 'GOOGLE_AI_API_KEY']
    missing_optional = [var for var in optional_vars if not os.getenv(var)]
    
    if missing_optional:
        print_warning("Optional AI API keys not set:")
        for var in missing_optional:
            print_warning(f"  - {var}")
        print_info("AI features may have limited functionality without API keys.")
    
    return True


def find_process_by_port(port: int) -> List[psutil.Process]:
    """
    Find processes using a specific port.
    
    Args:
        port: Port number to check
        
    Returns:
        List of Process objects using the port
    """
    processes = []
    for proc in psutil.process_iter(['pid', 'name']):
        try:
            if proc.pid in (0, 4):
                continue
            
            connections = proc.net_connections()
            for conn in connections:
                if hasattr(conn, 'laddr') and conn.laddr and conn.laddr.port == port:
                    processes.append(proc)
                    break
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess, AttributeError):
            continue
    
    return processes


def kill_processes_on_port(port: int, service_name: str) -> bool:
    """
    Kill all processes running on a specific port.
    
    Args:
        port: Port number to clear
        service_name: Name of the service for logging
        
    Returns:
        True if port was cleared successfully, False otherwise
    """
    print_info(f"Checking for existing {service_name} processes on port {port}...")
    
    processes = find_process_by_port(port)
    
    if not processes:
        print_success(f"Port {port} is available")
        return True
    
    print_warning(f"Found {len(processes)} process(es) on port {port}")
    
    for proc in processes:
        try:
            proc_info = f"PID {proc.pid} ({proc.name()})"
            print_info(f"Terminating {proc_info}...")
            proc.terminate()
            
            # Wait up to 5 seconds for graceful termination
            try:
                proc.wait(timeout=5)
                print_success(f"Process {proc_info} terminated gracefully")
            except psutil.TimeoutExpired:
                print_warning(f"Force killing {proc_info}...")
                proc.kill()
                proc.wait()
                print_success(f"Process {proc_info} force killed")
        except (psutil.NoSuchProcess, psutil.AccessDenied) as e:
            print_warning(f"Could not terminate process: {e}")
            continue
    
    # Verify port is now clear
    time.sleep(1)
    remaining = find_process_by_port(port)
    if remaining:
        print_error(f"Failed to clear port {port}")
        return False
    
    print_success(f"Successfully cleared port {port}")
    return True


def check_node_dependencies() -> bool:
    """
    Verify that Node.js dependencies are installed.
    
    Returns:
        True if dependencies are installed, False otherwise
    """
    print_info("Checking Node.js dependencies...")
    
    node_modules = PROJECT_ROOT / "node_modules"
    
    if not node_modules.exists():
        print_error("Node modules not installed")
        print_info("Run: npm install")
        return False
    
    # Check for critical Next.js dependencies
    critical_modules = ['next', 'react', 'react-dom']
    missing = []
    
    for module in critical_modules:
        module_path = node_modules / module
        if not module_path.exists():
            missing.append(module)
    
    if missing:
        print_error(f"Missing critical modules: {', '.join(missing)}")
        print_info("Run: npm install")
        return False
    
    print_success("Node.js dependencies are installed")
    return True


def check_health(url: str, max_attempts: int = MAX_HEALTH_CHECK_ATTEMPTS) -> bool:
    """
    Check if the application is responding to health checks.
    
    Args:
        url: Application URL to check
        max_attempts: Maximum number of health check attempts
        
    Returns:
        True if application is healthy, False otherwise
    """
    print_info(f"Waiting for application to be ready at {url}...")
    
    for attempt in range(1, max_attempts + 1):
        try:
            response = requests.get(url, timeout=5)
            if response.status_code in [200, 304]:
                print_success(f"Application is ready! (attempt {attempt}/{max_attempts})")
                return True
        except requests.RequestException:
            pass
        
        if attempt % 5 == 0:
            print_info(f"  Still waiting... (attempt {attempt}/{max_attempts})")
        
        time.sleep(HEALTH_CHECK_INTERVAL)
    
    print_error(f"Application failed to start after {max_attempts} attempts")
    return False


def start_nextjs() -> Optional[subprocess.Popen]:
    """
    Start the Next.js application (frontend + API routes).
    
    Returns:
        Process object if successful, None otherwise
    """
    print_info("Starting Next.js application (frontend + API routes)...")
    
    try:
        # Determine the npm command based on platform
        npm_cmd = "npm.cmd" if platform.system() == "Windows" else "npm"
        
        # Create environment with PORT set
        app_env = os.environ.copy()
        app_env["PORT"] = str(FRONTEND_PORT)
        
        # Start Next.js development server
        process = subprocess.Popen(
            [npm_cmd, "run", "dev"],
            cwd=str(PROJECT_ROOT),
            env=app_env,
            shell=True if platform.system() == "Windows" else False
        )
        
        print_success(f"Next.js process started (PID: {process.pid})")
        print_info("Next.js is running with Fast Refresh enabled")
        print_info("Changes to code will automatically refresh in the browser")
        
        # Wait for Next.js to initialize
        time.sleep(STARTUP_DELAY)
        
        # Check if process is still running
        if process.poll() is not None:
            print_error("Next.js process terminated unexpectedly")
            return None
        
        return process
        
    except Exception as e:
        print_error(f"Failed to start Next.js: {e}")
        return None


def cleanup_process(process: Optional[subprocess.Popen]):
    """
    Clean up running process on exit.
    
    Args:
        process: Process object to clean up
    """
    if not process or process.poll() is not None:
        return
    
    print_warning("\nShutting down application...")
    print_info("Stopping Next.js server...")
    
    process.terminate()
    
    try:
        process.wait(timeout=5)
        print_success("Next.js server stopped")
    except subprocess.TimeoutExpired:
        process.kill()
        print_warning("Next.js server force killed")


def monitor_process(process: subprocess.Popen):
    """
    Monitor running process and display status.
    
    Args:
        process: Process object to monitor
    """
    print_header("Application Running Successfully")
    print_success(f"Frontend + API: {FRONTEND_URL}")
    print_info(f"API Routes:     {FRONTEND_URL}/api/*")
    print_info("\nPress Ctrl+C to stop the application\n")
    
    try:
        while True:
            time.sleep(5)
    except KeyboardInterrupt:
        print_info("\nReceived shutdown signal (Ctrl+C)")
        return True


def main():
    """Main execution function."""
    print_header("ConstructAI Startup Script v2.0")
    print_info(f"Platform: {platform.system()}")
    print_info(f"Python: {sys.version.split()[0]}")
    print_info(f"Working Directory: {PROJECT_ROOT}")
    print_info(f"Architecture: Next.js 15 with integrated API routes")
    
    process = None
    
    try:
        # Step 1: Validate environment
        print_header("Step 1: Validating Environment")
        if not validate_environment():
            print_error("\nEnvironment validation failed!")
            print_info("Please set up your .env.local file with required variables.")
            print_info("See .env.example for reference.")
            return 1
        
        # Step 2: Clear existing processes
        print_header("Step 2: Clearing Existing Processes")
        if not kill_processes_on_port(FRONTEND_PORT, "Next.js"):
            print_error("Failed to clear port. Please manually close the process.")
            return 1
        
        # Step 3: Verify dependencies
        print_header("Step 3: Verifying Dependencies")
        if not check_node_dependencies():
            return 1
        
        # Step 4: Start Next.js
        print_header("Step 4: Starting Next.js Application")
        process = start_nextjs()
        if not process:
            return 1
        
        # Step 5: Verify application health
        print_header("Step 5: Verifying Application Health")
        if not check_health(FRONTEND_URL):
            return 1
        
        # Step 6: Monitor process
        monitor_process(process)
        
        return 0
        
    except Exception as e:
        print_error(f"Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return 1
        
    finally:
        # Always cleanup process
        cleanup_process(process)
        print_header("Shutdown Complete")


if __name__ == "__main__":
    sys.exit(main())
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"{Colors.OKCYAN}ℹ [{timestamp}] {message}{Colors.ENDC}")


def print_warning(message: str):
    """Print a warning message."""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"{Colors.WARNING}⚠ [{timestamp}] {message}{Colors.ENDC}")


def print_error(message: str):
    """Print an error message."""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"{Colors.FAIL}✗ [{timestamp}] {message}{Colors.ENDC}")


def get_project_root() -> Path:
    """Get the project root directory."""
    return Path(__file__).parent.absolute()


def find_process_by_port(port: int) -> List[psutil.Process]:
    """
    Find processes using a specific port.
    
    Args:
        port: Port number to check
        
    Returns:
        List of Process objects using the port
    """
    processes = []
    for proc in psutil.process_iter(['pid', 'name']):
        try:
            # Skip system processes (PID 0, 4) as they can't be terminated
            if proc.pid in (0, 4):
                continue
                
            # Get network connections for this process (using net_connections to avoid deprecation)
            try:
                connections = proc.net_connections()
            except AttributeError:
                # Fallback for older psutil versions
                connections = proc.connections()
            
            for conn in connections:
                if hasattr(conn, 'laddr') and conn.laddr and conn.laddr.port == port:
                    processes.append(proc)
                    break
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess, AttributeError):
            pass
    return processes


def kill_processes_on_port(port: int, service_name: str) -> bool:
    """
    Gracefully terminate processes using a specific port.
    
    Args:
        port: Port number to clear
        service_name: Name of the service for logging
        
    Returns:
        True if successful, False otherwise
    """
    print_info(f"Checking for existing {service_name} processes on port {port}...")
    
    processes = find_process_by_port(port)
    
    if not processes:
        print_success(f"No existing processes found on port {port}")
        return True
    
    print_warning(f"Found {len(processes)} process(es) on port {port}. Terminating...")
    
    for proc in processes:
        try:
            print_info(f"  Terminating PID {proc.pid} ({proc.name()})")
            proc.terminate()
        except (psutil.NoSuchProcess, psutil.AccessDenied) as e:
            print_warning(f"  Could not terminate PID {proc.pid}: {e}")
    
    # Wait for processes to terminate gracefully
    gone, alive = psutil.wait_procs(processes, timeout=5)
    
    # Force kill any remaining processes
    for proc in alive:
        try:
            print_warning(f"  Force killing PID {proc.pid}")
            proc.kill()
        except (psutil.NoSuchProcess, psutil.AccessDenied) as e:
            print_error(f"  Could not kill PID {proc.pid}: {e}")
    
    # Final verification
    time.sleep(1)
    remaining = find_process_by_port(port)
    if remaining:
        print_error(f"Failed to clear port {port}. {len(remaining)} process(es) still running.")
        return False
    
    print_success(f"Successfully cleared port {port}")
    return True


def check_python_dependencies() -> bool:
    """
    Verify that required Python packages are installed.
    
    Returns:
        True if all dependencies are installed, False otherwise
    """
    print_info("Checking Python dependencies...")
    
    # Map of package names to their import names (if different)
    required_packages = {
        'fastapi': 'fastapi',
        'uvicorn': 'uvicorn',
        'numpy': 'numpy',
        'pandas': 'pandas',
        'pyyaml': 'yaml',  # pyyaml is imported as 'yaml'
        'psutil': 'psutil',
        'requests': 'requests',
    }
    
    missing_packages = []
    
    for package_name, import_name in required_packages.items():
        try:
            __import__(import_name)
        except ImportError:
            missing_packages.append(package_name)
    
    if missing_packages:
        print_error(f"Missing Python packages: {', '.join(missing_packages)}")
        print_info("Install with: pip install -r requirements.txt")
        return False
    
    print_success("All Python dependencies are installed")
    return True


def check_node_dependencies() -> bool:
    """
    Verify that Node.js dependencies are installed.
    
    Returns:
        True if dependencies are installed, False otherwise
    """
    print_info("Checking Node.js dependencies...")
    
    frontend_dir = get_project_root() / "frontend"
    node_modules = frontend_dir / "node_modules"
    
    if not node_modules.exists():
        print_error("Node modules not installed")
        print_info("Run: cd frontend && npm install")
        return False
    
    print_success("Node.js dependencies are installed")
    return True

async def check_health_async(url: str, service_name: str, max_attempts: int = MAX_HEALTH_CHECK_ATTEMPTS, base_delay: float = HEALTH_CHECK_INTERVAL) -> bool:
    """
    Asynchronously check if a service is responding to health checks with exponential backoff.
    Args:
        url: Health check endpoint URL
        service_name: Name of the service for logging
        max_attempts: Maximum number of health check attempts
        base_delay: Initial delay between attempts (seconds)
    Returns:
        True if service is healthy, False otherwise
    """
    print_info(f"Waiting for {service_name} to be ready...")
    for attempt in range(1, max_attempts + 1):
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=5)
                print_info(f"[Health Check Attempt {attempt}] Status: {response.status_code}")
                print_info(f"[Health Check Attempt {attempt}] Body: {response.text}")
                if response.status_code == 200:
                    print_success(f"{service_name} is ready! (attempt {attempt}/{max_attempts})")
                    print_info(f"[Health Check] Received 200 OK. Proceeding with workflow.")
                    return True
        except Exception as e:
            print_warning(f"[Health Check Attempt {attempt}] Exception: {e}")
        if attempt % 5 == 0:
            print_info(f"  Still waiting... (attempt {attempt}/{max_attempts})")
        # Exponential backoff every 5 attempts
        await asyncio.sleep(base_delay * (2 ** ((attempt - 1) // 5)))
    print_error(f"{service_name} failed to start after {max_attempts} attempts")
    return False


def start_backend() -> Optional[subprocess.Popen]:
    """
    Start the FastAPI backend server.
    
    Returns:
        Process object if successful, None otherwise
    """
    print_info("Starting FastAPI backend server...")
    
    project_root = get_project_root()
    
    try:
        # Start uvicorn with the FastAPI app with auto-reload
        # Note: Output is not captured so you can see reload messages in real-time
        process = subprocess.Popen(
            [
                sys.executable,
                "-m",
                "uvicorn",
                "constructai.web.fastapi_app:app",
                "--host", BACKEND_HOST,
                "--port", str(BACKEND_PORT),
                "--reload",
                "--reload-dir", "constructai"  # Only watch constructai directory for changes
            ],
            cwd=str(project_root)
        )

        print_success(f"Backend process started (PID: {process.pid})")
        print_info("Backend is running with auto-reload enabled")
        print_info("Changes to Python files will automatically reload the server")

        # Wait a moment for the process to initialize
        time.sleep(STARTUP_DELAY)

        if process.poll() is not None:
            print_error("Backend process terminated unexpectedly during startup")
            return None
            
        print_info("Backend process appears to be running. Continuing health checks.")
        return process

    except Exception as e:
        print_error(f"Failed to start backend: {e}")
        import traceback
        print_error(traceback.format_exc())
        return None


def start_frontend() -> Optional[subprocess.Popen]:
    """
    Start the Next.js frontend server.
    
    Returns:
        Process object if successful, None otherwise
    """
    print_info("Starting Next.js frontend server...")
    
    frontend_dir = get_project_root() / "frontend"
    
    try:
        # Determine the npm command based on platform
        npm_cmd = "npm.cmd" if platform.system() == "Windows" else "npm"
        
        # Create environment with PORT set to FRONTEND_PORT to prevent conflicts
        frontend_env = os.environ.copy()
        frontend_env["PORT"] = str(FRONTEND_PORT)
        
        # Start Next.js development server
        # Note: Output is not captured so you can see HMR messages in real-time
        process = subprocess.Popen(
            [npm_cmd, "run", "dev"],
            cwd=str(frontend_dir),
            env=frontend_env,
            shell=True if platform.system() == "Windows" else False
        )
        
        print_success(f"Frontend process started (PID: {process.pid})")
        print_info("Frontend is running with Fast Refresh enabled")
        print_info("Changes to frontend files will automatically refresh in the browser")
        
        # Wait a moment for the process to initialize
        time.sleep(STARTUP_DELAY)
        
        # Check if process is still running
        if process.poll() is not None:
            print_error("Frontend process terminated unexpectedly")
            return None
        
        return process
        
    except Exception as e:
        print_error(f"Failed to start frontend: {e}")
        return None


def cleanup_processes(backend_process: Optional[subprocess.Popen], 
                     frontend_process: Optional[subprocess.Popen]):
    """
    Clean up running processes on exit.
    
    Args:
        backend_process: Backend process object
        frontend_process: Frontend process object
    """
    print_warning("\nShutting down servers...")
    
    if backend_process and backend_process.poll() is None:
        print_info("Stopping backend server...")
        backend_process.terminate()
        try:
            backend_process.wait(timeout=5)
            print_success("Backend server stopped")
        except subprocess.TimeoutExpired:
            backend_process.kill()
            print_warning("Backend server force killed")
    
    if frontend_process and frontend_process.poll() is None:
        print_info("Stopping frontend server...")
        frontend_process.terminate()
        try:
            frontend_process.wait(timeout=5)
            print_success("Frontend server stopped")
        except subprocess.TimeoutExpired:
            frontend_process.kill()
            print_warning("Frontend server force killed")


def monitor_processes(backend_process: subprocess.Popen, 
                      frontend_process: subprocess.Popen):
    """
    Monitor running processes and display status.
    
    Args:
        backend_process: Backend process object
        frontend_process: Frontend process object
    """
    print_header("Servers Running Successfully")
    print_success(f"Backend:  http://{BACKEND_HOST}:{BACKEND_PORT}")
    print_success(f"Frontend: http://{FRONTEND_HOST}:{FRONTEND_PORT}")
    print_info("\nPress Ctrl+C to stop all servers\n")
    
    try:
        while True:
            # Note: We don't check process.poll() because uvicorn --reload 
            # will spawn child processes that exit and restart on file changes.
            # The parent reloader process stays alive. Same for Next.js with HMR.
            # We simply wait for Ctrl+C to shut down.
            time.sleep(5)
            
    except KeyboardInterrupt:
        print_info("\nReceived shutdown signal (Ctrl+C)")
        return True


def main():
    """Main execution function."""
    print_header("ConstructAI Startup Script")
    print_info(f"Platform: {platform.system()}")
    print_info(f"Python: {sys.version.split()[0]}")
    print_info(f"Working Directory: {get_project_root()}")
    
    backend_process = None
    frontend_process = None
    
    try:
        # Step 1: Kill existing processes
        print_header("Step 1: Clearing Existing Processes")
        if not kill_processes_on_port(BACKEND_PORT, "Backend"):
            print_error("Failed to clear backend port. Please manually close the process.")
            return 1
        
        if not kill_processes_on_port(FRONTEND_PORT, "Frontend"):
            print_error("Failed to clear frontend port. Please manually close the process.")
            return 1
        
        # Step 2: Verify dependencies
        print_header("Step 2: Verifying Dependencies")
        if not check_python_dependencies():
            return 1
        
        if not check_node_dependencies():
            return 1
        
        # Step 3: Start backend
        print_header("Step 3: Starting Backend Server")
        backend_process = start_backend()
        if not backend_process:
            return 1
        
        print_info("Backend started, proceeding to health check...")
        # Step 4: Verify backend health
        print_header("Step 4: Verifying Backend Health")
        if not asyncio.run(check_health_async(BACKEND_HEALTH_ENDPOINT, "Backend")):
            return 1

        # Step 5: Start frontend
        print_header("Step 5: Starting Frontend Server")
        frontend_process = start_frontend()
        if not frontend_process:
            return 1

        # Step 6: Verify frontend health
        print_header("Step 6: Verifying Frontend Health")
        if not asyncio.run(check_health_async(FRONTEND_HEALTH_ENDPOINT, "Frontend")):
            return 1

        # Step 7: Monitor processes
        monitor_processes(backend_process, frontend_process)
        
        return 0
        
    except Exception as e:
        print_error(f"Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return 1
        
    finally:
        # Always cleanup processes
        cleanup_processes(backend_process, frontend_process)
        print_header("Shutdown Complete")


if __name__ == "__main__":
    sys.exit(main())
