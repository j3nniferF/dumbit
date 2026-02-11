# DUMB SHIT I GOTTA DO TODAY 💥

A punk rock, grunge-style todo app to help you manage your tasks with attitude!

## ✨ Features

- Add tasks to different tabs (DUE TODAY, NEXT UP, WHEN I CAN, DON'T FORGET)
- Check off completed tasks
- Timer with START/PAUSE/STOP
- Prize modal when you complete all tasks in a tab
- Inline editing (double-click a task to edit it)
- Drag & drop reordering
- Move tasks between tabs
- Grunge/punk aesthetic with custom fonts and textures

## 🌐 Live Site

https://j3nniferF.github.io/dumbit/

## 💻 Run Locally

```bash
cd dumbit
python3 -m http.server 8000
```

Then visit `http://localhost:8000` in your browser.

## 🚀 Deploy

- Pushing to `main` automatically deploys to GitHub Pages via `.github/workflows/deploy-pages.yml`.
- Keep most work on `main` (you can make a temporary branch if you want to try something risky).

## 🔁 Quick Git Workflow

```bash
git status                # see what changed
git add .                 # stage updates
git commit -m "message"   # save a snapshot
git push origin main      # publish changes (triggers deploy)
```

## 📁 Project Structure

```
dumbit/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styles
├── js/
│   ├── app.js          # Main app logic
│   ├── tasks-edit.js   # Task editing features
│   └── enhanced-features.js  # Extra features
└── assets/
    ├── fonts/          # Custom punk fonts
    └── textures/       # Background textures
```
