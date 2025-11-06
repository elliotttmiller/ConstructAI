# Uninstall Heavy Hunyuan3D Packages
# Run this to free up disk space by removing large AI/ML packages

Write-Host "🧹 Uninstalling heavy AI/ML packages to free disk space..." -ForegroundColor Cyan
Write-Host ""

$heavyPackages = @(
    "torch",
    "torchvision",
    "transformers",
    "diffusers",
    "accelerate",
    "xformers",
    "rembg",
    "onnxruntime",
    "onnxruntime-gpu",
    "open3d",
    "pymeshlab",
    "xatlas",
    "gradio",
    "gradio-client",
    "einops",
    "ninja",
    "pybind11"
)

$uninstalled = 0
$notFound = 0

foreach ($package in $heavyPackages) {
    Write-Host "Checking $package..." -NoNewline
    
    # Check if package is installed
    $installed = pip show $package 2>$null
    
    if ($installed) {
        Write-Host " [INSTALLED] Uninstalling..." -ForegroundColor Yellow
        pip uninstall -y $package 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Uninstalled $package" -ForegroundColor Green
            $uninstalled++
        } else {
            Write-Host "  ⚠️  Failed to uninstall $package" -ForegroundColor Red
        }
    } else {
        Write-Host " [NOT FOUND]" -ForegroundColor Gray
        $notFound++
    }
}

Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Uninstalled: $uninstalled packages" -ForegroundColor Green
Write-Host "  Not found: $notFound packages" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Cleanup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Install minimal requirements:" -ForegroundColor White
Write-Host "     pip install -r requirements-minimal.txt" -ForegroundColor Cyan
Write-Host "  2. Start server in simulation mode (no AI):" -ForegroundColor White
Write-Host "     python start_hunyuan3d.py --geometry-only" -ForegroundColor Cyan
Write-Host ""
