# 🔄 How to Change the Default Branch to Main

## Current Status
- **Current default branch:** `gh-pages`
- **Target default branch:** `main`

The `main` branch already exists in your repository and is ready to become the default branch.

## Why Change to Main?

1. **Industry Standard:** Most repositories use `main` as the default branch
2. **Already Configured:** Your GitHub Pages workflow is set to deploy from `main`
3. **Simpler:** Having `main` as the default makes it easier to work with the repository

## How to Change the Default Branch (GitHub Web Interface)

### Step 1: Go to Repository Settings
1. Open your browser and go to: **https://github.com/j3nniferF/dumbit**
2. Click on **"Settings"** (you'll see this tab at the top of the page)
   - Note: You need to be the repository owner or have admin access

### Step 2: Navigate to Branches Section
1. In the left sidebar, click on **"Branches"** (under "Code and automation")
2. You'll see a section called **"Default branch"** at the top

### Step 3: Change the Default Branch
1. In the "Default branch" section, you'll see it currently shows `gh-pages`
2. Click the **two arrows** icon (⇄) or **"Switch to another branch"** button
3. A dropdown will appear with all your branches
4. Select **`main`** from the list
5. Click **"Update"** or **"I understand, update the default branch"**
6. A warning dialog will appear - read it and click **"I understand, update the default branch"**

### Step 4: Verify the Change
1. Go back to your repository homepage: **https://github.com/j3nniferF/dumbit**
2. You should now see `main` as the active branch (it will say "main" near the top)
3. The default branch is now `main`! ✅

## What This Changes

After changing the default branch to `main`:

✅ **What happens:**
- New pull requests will target `main` by default
- When people clone your repo, they'll get `main` by default
- The repository homepage will show `main` by default
- GitHub Pages will continue to deploy from `main` (already configured)

✅ **What doesn't change:**
- All your branches still exist
- All your commits are still safe
- Your live website at https://j3nniferF.github.io/dumbit/ keeps working
- Nothing breaks!

## After Changing the Default Branch

### Optional: Delete the `gh-pages` Branch
Since you're now using `main` as your default and for GitHub Pages deployment, you may want to delete the `gh-pages` branch:

1. Make sure all important code is on `main`
2. Go to: **https://github.com/j3nniferF/dumbit/branches**
3. Find `gh-pages` in the list
4. Click the **trash icon** 🗑️ next to it
5. Confirm the deletion

⚠️ **Before deleting:** Make sure you've merged any important changes from `gh-pages` to `main`!

### Update Your Local Repository
If you work on this repository locally, update your local copy:

```bash
# Fetch all changes from GitHub
git fetch origin

# Switch to the main branch
git checkout main

# Pull the latest changes
git pull origin main

# Update your local default branch tracking
git symbolic-ref refs/remotes/origin/HEAD refs/remotes/origin/main
```

## Troubleshooting

### "I don't see the Settings tab"
- You need to be the repository owner or have admin access
- Make sure you're logged into GitHub with the correct account

### "The Switch button is grayed out"
- Make sure the `main` branch exists (you can verify at https://github.com/j3nniferF/dumbit/branches)
- The branch you're switching to must have at least one commit

### "I accidentally changed to the wrong branch"
- Don't worry! Just follow the steps again and select the correct branch

### "Will this break my website?"
- No! Your GitHub Pages deployment is already configured to use `main`
- Check `.github/workflows/deploy-pages.yml` - it deploys from `main`
- Your site will continue working normally

## Quick Reference

**Current State:**
- Default branch: `gh-pages`
- Deployment source: `main` (via GitHub Actions workflow)
- Live site: https://j3nniferF.github.io/dumbit/

**Desired State:**
- Default branch: `main` ✨
- Deployment source: `main` (via GitHub Actions workflow)
- Live site: https://j3nniferF.github.io/dumbit/

**How to change:**
Settings → Branches → Default branch → Switch to `main` → Update

---

**That's it!** Once you change the default branch to `main`, your repository will be using the modern standard and everything will continue working smoothly! 🚀
