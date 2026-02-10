# ⚡ Quick Reference Card - Copy & Paste These!

## 🎯 Most Common Commands (Use These Daily!)

### Check Status
```bash
git status
```
**What it does:** Shows what files changed

### Save Your Changes
```bash
git add .
git commit -m "describe your changes here"
git push origin main
```
**What it does:** Saves and uploads your changes to GitHub

### Get Latest Code
```bash
git pull origin main
```
**What it does:** Downloads latest changes from GitHub

### Switch to Main Branch
```bash
git checkout main
```
**What it does:** Switches you to the main branch

---

## 🚀 Complete Workflow (Copy This Whole Block!)

```bash
# Step 1: Make sure you're on main
git checkout main

# Step 2: Get latest code
git pull origin main

# Step 3: Make your changes in VS Code (edit files, save them)

# Step 4: Check what changed
git status

# Step 5: Add all changes
git add .

# Step 6: Save with a message
git commit -m "what I changed"

# Step 7: Upload to GitHub
git push origin main

# Step 8: Wait 1-2 minutes, then visit your site!
```

---

## 🌐 Your Live Website

**URL:** https://j3nniferF.github.io/dumbit/

After pushing changes:
1. Wait 1-2 minutes
2. Refresh with: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)

---

## 🆘 Emergency Commands

### "Undo changes to a file"
```bash
git checkout -- filename.html
```

### "See what branch I'm on"
```bash
git branch
```
(The one with * is current)

### "Start fresh"
```bash
git checkout main
git pull origin main
```

---

## 📍 Where Are You?

Run this to see your current situation:
```bash
git branch
git status
```

---

## 💡 Remember

1. **Save often:** `git add . && git commit -m "message" && git push origin main`
2. **Check before pushing:** `git status` (see what changed)
3. **Always work on main** (simpler for beginners)
4. **Website updates in 1-2 minutes** after pushing

---

**Keep this file open while coding!** 📌
