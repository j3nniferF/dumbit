# dUMb shit I GotTA Do TODay (DSIGDT)

A small, focused task manager inspired by a physical notepad, designed to break large chores into satisfyingly small actions. The app helps you organize tasks across four priority tabs, focus on one task at a time with a built-in timer, and celebrate your progress.

![App Screenshot](https://github.com/user-attachments/assets/9517e1f4-1c39-4384-87f2-9719e12f4641)

## Core Features

- **Four Tabbed Task Lists**: Organize tasks by priority (Due Today / Next Up / When I Can / Don't Forget)
- **Add and Complete Tasks**: Easily add tasks and check them off when done
- **Focus Timer**: Set a timer for focused work sessions on specific tasks
- **Task Persistence**: All tasks are saved in localStorage and remain after closing the browser
- **Celebration System**: Get rewarded with confetti and prizes when you complete all tasks in a tab
- **Progress Tracking**: See your overall progress across all task lists

## How to Run the App

### Option 1: Open Directly (Simple)
1. Clone or download this repository
2. Open `index.html` in your web browser
   - Right-click the file and select "Open with" → Your browser
   - Or drag and drop the file into a browser window

### Option 2: Local Server (Recommended)
For the best experience, run a local web server:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if you have http-server installed)
npx http-server -p 8000
```

Then open your browser to: `http://localhost:8000`

### Option 3: GitHub Pages
The app can be deployed on GitHub Pages for easy access from anywhere.

## How to Use the App

### 1. Managing Tasks

**Adding a Task:**
1. Make sure you're on the tab where you want to add the task (Due Today, Next Up, etc.)
2. Type your task in the input field at the bottom of the task list
3. Click the "ADD" button or press Enter
4. The task will appear in the current tab's list

**Completing a Task:**
1. Click the checkbox next to any task to mark it complete
2. The task will move to the "SHIT I DID" section at the bottom
3. If you complete all tasks in a tab, you'll get confetti and a prize modal! 🎉

**Viewing Completed Tasks:**
1. Scroll down to the "SHIT I DID" section
2. Click on any tab heading (▸ DUE TODAY, etc.) to expand and see completed tasks

### 2. Using the Focus Timer

**Setting Up a Focus Session:**
1. **Choose your focus**: 
   - Select which tab to work on (or "ALL TABS")
   - Pick a specific task from the dropdown
   - OR click directly on a task in the list to select it
2. **Set your time**:
   - Choose a preset duration (5, 15, 30, 45, or 60 minutes)
   - OR enter a custom time using the HRS and MINS inputs
3. Click "START" to begin the timer

**Timer Controls:**
- **START**: Begin the countdown
- **PAUSE**: Pause the timer (click START again to resume)
- **STOP**: Stop and reset the timer to the selected duration

**When Time's Up:**
- A modal will appear asking if you're done with the task
- Click "YES, DONE" to mark the task complete
- Click "ADD 5 MIN" if you need more time
- Click "NOT YET" to close the modal without completing the task

### 3. Organizing Your Tasks

**Four Priority Tabs:**
- **DUE TODAY**: Urgent tasks that must be done today
- **NEXT UP**: Important tasks to tackle soon
- **WHEN I CAN**: Tasks to do when you have time
- **DON'T FORGET**: Reminders and tasks you don't want to forget

**Switching Tabs:**
- Click any tab button at the top to view and manage tasks in that tab
- Each tab maintains its own task list independently

### 4. Progress Tracking

- The "SHIT I DID" section shows your overall progress (e.g., "0/9 OF ALL TASKS DONE")
- Expand each tab in this section to see which specific tasks you've completed
- Complete all tasks in any tab to trigger a celebration! 🎊

### 5. Reset Everything

- Click the "🧨 RESET EVERYTHING" button at the bottom to clear all tasks and completed items
- You'll get a confirmation dialog before anything is deleted
- This action cannot be undone

## Tips for Best Results

1. **Start Small**: Break big tasks into smaller, manageable pieces
2. **Use the Tabs**: Organize tasks by urgency to avoid feeling overwhelmed
3. **Focus Mode**: Use the timer to focus on one task at a time without distractions
4. **Celebrate Wins**: Completing a full tab triggers confetti - enjoy the moment!
5. **Daily Reset**: Use the app to plan your day each morning

## Technical Details

- **No Installation Required**: Pure HTML/CSS/JavaScript - no build step needed
- **Works Offline**: Once loaded, the app works without an internet connection
- **Data Storage**: Tasks are saved in your browser's localStorage
- **Browser Support**: Works in all modern browsers (Chrome, Firefox, Safari, Edge)

## Privacy

All your tasks are stored locally in your browser. No data is sent to any server or third party. Your tasks stay private on your device.
