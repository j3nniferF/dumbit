# 🔄 How to Change the Default Branch to Main

## Current Status
- **Current default branch:** `gh-pages`
- **Target default branch:** `main`

The `main` branch already exists and is ready to become your default branch.

## Why Change to Main?

1. **Industry Standard:** Most repositories use `main` as the default branch
2. **Already Configured:** Your GitHub Pages workflow deploys from `main`
3. **Simpler:** Makes your repo easier to work with

## How to Change the Default Branch

### Step 1: Go to Repository Settings
1. Go to: **https://github.com/j3nniferF/dumbit**
2. Click **"Settings"** at the top

### Step 2: Navigate to Branches
1. In the left sidebar, click **"Branches"**
2. You'll see the **"Default branch"** section at the top

### Step 3: Switch to Main
1. The default branch currently shows `gh-pages`
2. Click the **switch button** (⇄)
3. Select **`main`** from the dropdown
4. Click **"Update"**
5. Confirm by clicking **"I understand, update the default branch"**

### Step 4: Done! ✅
Go back to https://github.com/j3nniferF/dumbit and you'll see `main` is now the default branch.

## What This Changes

✅ **What happens:**
- New PRs target `main` by default
- Cloning the repo gets `main` by default
- Repository homepage shows `main` by default

✅ **What doesn't change:**
- All your branches still exist
- Your commits are all safe
- Your live site keeps working at https://j3nniferF.github.io/dumbit/

## After Changing

### Optional: Delete `gh-pages`
Once `main` is your default, you can delete the old `gh-pages` branch:

1. Go to: **https://github.com/j3nniferF/dumbit/branches**
2. Find `gh-pages` and click the trash icon 🗑️
3. Confirm

⚠️ Only do this after you're sure everything you need is on `main`!

### Update Local Repo
If you work locally, update your local copy:

```bash
git fetch origin
git checkout main
git pull origin main
```

## Troubleshooting

**"I don't see the Settings tab"**
- You need to be the repo owner or have admin access

**"Will this break my website?"**
- No! Your deployment is already set to use `main`

---

**That's it!** Once `main` is your default branch, everything will be simpler! 🚀
