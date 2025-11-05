#!/usr/bin/env python3
"""
ConstructAI Professional Startup Script

- Loads and validates environment variables from .env/.env.local
- Scans and kills any running processes on the app port (default 3000)
- Verifies Node.js dependencies
- Starts the Next.js server (npm run dev)
- Waits for server to be healthy before finishing
- Provides clear, color-coded status and error messages
- Handles graceful shutdown on Ctrl+C

Author: ConstructAI Team
Version: 3.0.0
"""
import os
import sys
import time
import signal
import platform
import subprocess
from pathlib import Path
from dotenv import load_dotenv
from datetime import datetime
import psutil
import requests

# =====================
# Utility: Colors
# =====================
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

# =====================
# Utility: Printing
# =====================
def print_status(msg, color=Colors.OKCYAN):
    print(f"{color}[{datetime.now().strftime('%H:%M:%S')}] {msg}{Colors.ENDC}")

def print_success(msg):
    print_status(f"✓ {msg}", Colors.OKGREEN)

def print_warning(msg):
    print_status(f"⚠ {msg}", Colors.WARNING)

def print_error(msg):
    print_status(f"✗ {msg}", Colors.FAIL)

def print_header(msg):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*70}\n{msg.center(70)}\n{'='*70}{Colors.ENDC}\n")

# =====================
# Step 1: Load Environment
# =====================
PROJECT_ROOT = Path(__file__).parent.absolute()
ENV_FILES = [PROJECT_ROOT / ".env", PROJECT_ROOT / ".env.local"]
for env_file in ENV_FILES:
    if env_file.exists():
        load_dotenv(env_file, override=True)
        print_success(f"Loaded environment: {env_file}")

# =====================
# Step 2: Validate Environment
# =====================
REQUIRED_VARS = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXTAUTH_SECRET',
]
missing = [v for v in REQUIRED_VARS if not os.getenv(v)]
if missing:
    print_error(f"Missing required environment variables: {', '.join(missing)}")
    print_error("Please update your .env.local file.")
    sys.exit(1)
print_success("All required environment variables are set.")

# =====================
# Step 3: Kill Existing Processes on Port
# =====================
PORT = int(os.getenv("PORT", os.getenv("FRONTEND_PORT", "3000")))

def find_processes_on_port(port):
    procs = []
    for proc in psutil.process_iter(['pid', 'name']):
        try:
            for conn in proc.net_connections():
                if conn.laddr and conn.laddr.port == port:
                    procs.append(proc)
                    break
        except Exception:
            continue
    return procs

def kill_processes_on_port(port):
    procs = find_processes_on_port(port)
    if not procs:
        print_success(f"Port {port} is free.")
        return
    print_warning(f"Killing {len(procs)} process(es) on port {port}...")
    for proc in procs:
        try:
            print_status(f"Terminating PID {proc.pid} ({proc.name()})...")
            proc.terminate()
        except Exception as e:
            print_warning(f"Could not terminate PID {proc.pid}: {e}")
    gone, alive = psutil.wait_procs(procs, timeout=5)
    for proc in alive:
        try:
            print_warning(f"Force killing PID {proc.pid}")
            proc.kill()
        except Exception as e:
            print_error(f"Could not kill PID {proc.pid}: {e}")
    time.sleep(1)
    if find_processes_on_port(port):
        print_error(f"Failed to clear port {port}.")
        sys.exit(1)
    print_success(f"Port {port} cleared.")

kill_processes_on_port(PORT)

# =====================
# Step 4: Check Node.js Dependencies
# =====================
node_modules = PROJECT_ROOT / "node_modules"
if not node_modules.exists():
    print_error("Node modules not installed. Run: npm install")
    sys.exit(1)
for mod in ["next", "react", "react-dom"]:
    if not (node_modules / mod).exists():
        print_error(f"Missing critical module: {mod}. Run: npm install")
        sys.exit(1)
print_success("Node.js dependencies are installed.")

# =====================
# Step 5: Start Next.js Server
# =====================
def start_nextjs():
    npm_cmd = "npm.cmd" if platform.system() == "Windows" else "npm"
    env = os.environ.copy()
    env["PORT"] = str(PORT)
    print_status("Starting Next.js server...")
    proc = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=str(PROJECT_ROOT),
        env=env,
        shell=True if platform.system() == "Windows" else False
    )
    print_success(f"Next.js process started (PID: {proc.pid})")
    return proc

proc = start_nextjs()

# =====================
# Step 6: Health Check
# =====================
FRONTEND_HOST = os.getenv("FRONTEND_HOST", "localhost")
FRONTEND_URL = f"http://{FRONTEND_HOST}:{PORT}"
MAX_ATTEMPTS = int(os.getenv("MAX_HEALTH_CHECK_ATTEMPTS", "30"))
INTERVAL = float(os.getenv("HEALTH_CHECK_INTERVAL", "2"))
STARTUP_DELAY = float(os.getenv("STARTUP_DELAY", "5"))

def wait_for_health(url, max_attempts=MAX_ATTEMPTS, interval=INTERVAL):
    print_status(f"Waiting for app to be ready at {url}...")
    time.sleep(STARTUP_DELAY)
    for attempt in range(1, max_attempts+1):
        try:
            r = requests.get(url, timeout=5)
            if r.status_code in [200, 304]:
                print_success(f"App is ready! (attempt {attempt})")
                return True
        except Exception:
            pass
        if attempt % 5 == 0:
            print_status(f"Still waiting... (attempt {attempt})")
        time.sleep(interval)
    print_error(f"App failed to start after {max_attempts} attempts.")
    proc.terminate()
    sys.exit(1)

wait_for_health(FRONTEND_URL)

# =====================
# Step 7: Monitor and Graceful Shutdown
# =====================
def shutdown(signum, frame):
    print_warning("\nShutting down Next.js server...")
    proc.terminate()
    try:
        proc.wait(timeout=5)
        print_success("Next.js server stopped.")
    except subprocess.TimeoutExpired:
        proc.kill()
        print_warning("Next.js server force killed.")
    sys.exit(0)

signal.signal(signal.SIGINT, shutdown)
signal.signal(signal.SIGTERM, shutdown)

print_header("Application Running Successfully")
print_success(f"Frontend: {FRONTEND_URL}")
print_status("Press Ctrl+C to stop the application.")

while True:
    time.sleep(5)
