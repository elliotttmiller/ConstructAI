# ConstructAI Environment Verification Script
# Run this to check your environment setup

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "ConstructAI Environment Checker" -ForegroundColor Cyan
Write-Host "==================================`n" -ForegroundColor Cyan

$errors = @()
$warnings = @()
$success = @()

# Check if .env.local exists
Write-Host "Checking environment files..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    $success += "✓ .env.local file exists"
} else {
    $errors += "✗ .env.local file not found"
    Write-Host "`n❌ .env.local not found!" -ForegroundColor Red
    Write-Host "Run: Copy-Item .env.example .env.local" -ForegroundColor Yellow
}

# Check if .env.example exists
if (Test-Path ".env.example") {
    $success += "✓ .env.example template exists"
} else {
    $warnings += "⚠ .env.example template not found"
}

# Check .gitignore
if (Test-Path ".gitignore") {
    $gitignoreContent = Get-Content ".gitignore" -Raw
    if ($gitignoreContent -match "\.env") {
        $success += "✓ .gitignore properly configured for .env files"
    } else {
        $warnings += "⚠ .gitignore may not protect .env files"
    }
}

# Check for Node modules
Write-Host "`nChecking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    $success += "✓ Node modules installed"
} else {
    $warnings += "⚠ Node modules not found - run 'npm install'"
}

# Check for package.json
if (Test-Path "package.json") {
    $success += "✓ package.json exists"
} else {
    $errors += "✗ package.json not found"
}

# Try to parse .env.local if it exists
if (Test-Path ".env.local") {
    Write-Host "`nChecking environment variables..." -ForegroundColor Yellow
    $envContent = Get-Content ".env.local" | Where-Object { $_ -notmatch "^#" -and $_ -match "=" }
    
    $requiredVars = @(
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY",
        "NEXTAUTH_SECRET"
    )
    
    $optionalVars = @(
        "OPENAI_API_KEY",
        "GOOGLE_AI_API_KEY",
        "NEXT_PUBLIC_HUNYUAN3D_URL",
        "DEMO_PASSWORD"
    )
    
    foreach ($var in $requiredVars) {
        $found = $envContent | Where-Object { $_ -match "^$var=" }
        if ($found) {
            $value = ($found -split "=", 2)[1].Trim()
            if ($value -and $value -ne "" -and $value -notmatch "placeholder|your-|change") {
                $success += "✓ $var is set"
            } else {
                $warnings += "⚠ $var is set but may be placeholder value"
            }
        } else {
            $errors += "✗ $var is missing"
        }
    }
    
    foreach ($var in $optionalVars) {
        $found = $envContent | Where-Object { $_ -match "^$var=" }
        if ($found) {
            $value = ($found -split "=", 2)[1].Trim()
            if ($value -and $value -ne "") {
                $success += "✓ $var is set (optional)"
            }
        }
    }
}

# Check for common security issues
Write-Host "`nSecurity checks..." -ForegroundColor Yellow

# Check if .env.local would be committed
$gitCheck = git check-ignore .env.local 2>$null
if ($LASTEXITCODE -eq 0) {
    $success += "✓ .env.local is ignored by Git"
} else {
    $errors += "✗ .env.local is NOT ignored by Git! Risk of committing secrets!"
}

# Display results
Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "Results" -ForegroundColor Cyan
Write-Host "==================================`n" -ForegroundColor Cyan

if ($success.Count -gt 0) {
    Write-Host "✅ PASSED ($($success.Count)):" -ForegroundColor Green
    foreach ($item in $success) {
        Write-Host "  $item" -ForegroundColor Green
    }
}

if ($warnings.Count -gt 0) {
    Write-Host "`n⚠️  WARNINGS ($($warnings.Count)):" -ForegroundColor Yellow
    foreach ($item in $warnings) {
        Write-Host "  $item" -ForegroundColor Yellow
    }
}

if ($errors.Count -gt 0) {
    Write-Host "`n❌ ERRORS ($($errors.Count)):" -ForegroundColor Red
    foreach ($item in $errors) {
        Write-Host "  $item" -ForegroundColor Red
    }
    Write-Host "`nPlease fix the errors above before proceeding.`n" -ForegroundColor Red
    exit 1
}

# Final verdict
Write-Host "`n==================================" -ForegroundColor Cyan
if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "🎉 ALL CHECKS PASSED!" -ForegroundColor Green
    Write-Host "Your environment is properly configured.`n" -ForegroundColor Green
} elseif ($errors.Count -eq 0) {
    Write-Host "✅ READY WITH WARNINGS" -ForegroundColor Yellow
    Write-Host "Review warnings above for improvements.`n" -ForegroundColor Yellow
} else {
    Write-Host "❌ SETUP INCOMPLETE" -ForegroundColor Red
    Write-Host "Fix errors above before running the app.`n" -ForegroundColor Red
}

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Review ENV_SETUP_GUIDE.md for detailed instructions" -ForegroundColor White
Write-Host "2. Fill in your actual values in .env.local" -ForegroundColor White
Write-Host "3. Run 'npm run dev' to start the development server`n" -ForegroundColor White
