# Change Git Repository Guide

## Current Status
Your project is currently connected to: `https://github.com/rcbroo/constructai-platform.git`

## Option 1: Change to Your Own Existing Repository

If you already created a repository on GitHub:

```powershell
# 1. Change the remote URL to your repository
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 2. Verify the change
git remote -v

# 3. Push to your repository
git push -u origin main
```

## Option 2: Create a New Repository and Push

If you haven't created a repository yet:

### Step 1: Create Repository on GitHub
1. Go to https://github.com/new
2. Enter repository name (e.g., `my-constructai-platform`)
3. Choose Public or Private
4. **DO NOT** initialize with README, .gitignore, or license
5. Click "Create repository"

### Step 2: Change Remote and Push
```powershell
# Change the remote URL
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Verify the change
git remote -v

# Push all branches and tags
git push -u origin main
```

## Option 3: Start Fresh (Clean Slate)

If you want to completely disconnect from the old repository:

```powershell
# 1. Remove the existing Git remote
git remote remove origin

# 2. Add your new repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 3. Push to your repository
git push -u origin main
```

## Option 4: Fork on GitHub (Preserve History)

If you want to maintain connection to original repo for updates:

1. Go to https://github.com/rcbroo/constructai-platform
2. Click "Fork" button
3. This creates a copy under your account
4. Then change your remote:

```powershell
# Change to your forked repository
git remote set-url origin https://github.com/YOUR_USERNAME/constructai-platform.git

# Add original as upstream (for future updates)
git remote add upstream https://github.com/rcbroo/constructai-platform.git

# Verify
git remote -v
# Should show:
# origin    https://github.com/YOUR_USERNAME/constructai-platform.git
# upstream  https://github.com/rcbroo/constructai-platform.git
```

## Quick Command Reference

### Check Current Remote
```powershell
git remote -v
```

### Change Remote URL
```powershell
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

### Remove Remote
```powershell
git remote remove origin
```

### Add New Remote
```powershell
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

### Verify Connection
```powershell
git remote -v
```

### Push to New Remote
```powershell
git push -u origin main
```

## Important Notes

### Before Pushing to Your Own Repo

1. **Review .gitignore**
   ```powershell
   # Check if .env.local is ignored
   git check-ignore .env.local
   # Should output: .env.local
   ```

2. **Check for Sensitive Data**
   ```powershell
   # See what files are staged
   git status
   
   # Make sure no .env files are tracked
   git ls-files | Select-String "\.env"
   ```

3. **Commit Any Pending Changes**
   ```powershell
   # Add environment setup files
   git add .env.example ENV_SETUP_GUIDE.md ENVIRONMENT_MIGRATION.md verify-env.ps1
   
   # Commit changes
   git commit -m "Add environment variable configuration and migration"
   ```

### After Changing Remote

1. **Test the Connection**
   ```powershell
   git remote -v
   git fetch origin
   ```

2. **Push Your Code**
   ```powershell
   git push -u origin main
   ```

3. **Set Up Branch Tracking**
   ```powershell
   # If you have other branches
   git push -u origin --all
   
   # Push tags if any
   git push --tags
   ```

## Troubleshooting

### Error: "Permission denied"
**Solution:** Make sure you're authenticated with GitHub
```powershell
# Use GitHub CLI
gh auth login

# Or configure Git credentials
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

### Error: "Repository not found"
**Solution:** Verify the repository URL is correct and you have access

### Error: "Updates were rejected"
**Solution:** Pull first or force push (careful!)
```powershell
# Pull first
git pull origin main --rebase

# Or force push (overwrites remote)
git push -u origin main --force
```

### Want to Keep Original History?
Fork the repository on GitHub instead of creating a new one.

## Security Checklist Before Pushing

- [ ] `.env.local` is in `.gitignore`
- [ ] No API keys in committed code
- [ ] No hardcoded passwords (except demo in `.env.local` which is ignored)
- [ ] `.env.example` has placeholder values only
- [ ] Verified with: `git status` and `git diff`

## Next Steps After Changing Repository

1. Update repository URL in documentation
2. Configure GitHub Actions/CI if needed
3. Set up branch protection rules
4. Invite collaborators if it's a team project
5. Configure deployment settings (Vercel, Netlify, etc.)

---

**Need help?** Run `git remote -v` to see current configuration.
