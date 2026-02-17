# dUMb shit I GOTta dO TODay

A fun, engaging task management web app to help you track and complete your daily tasks! Now with NASA's Astronomy Picture of the Day integration for cosmic inspiration!

## Project Description

This is a fully-featured task management application built with vanilla JavaScript, HTML, and CSS. The app helps users organize their daily tasks across multiple categories, track completion progress, and stay motivated with a built-in timer, reward system, and daily space images from NASA. The app features two distinct modes ($H!T MODE with punk vibes and PG MODE with friendly vibes), each maintaining separate task lists and styling.

## Capstone Features

This project implements the following features to meet capstone requirements:

### 1. **API Integration** (MANDATORY)
- **NASA APOD API**: Integrated NASA's Astronomy Picture of the Day API using `fetch()` to display daily space images and explanations
- Located in `stats.html` page
- Displays cosmic images, videos, titles, explanations, and copyright info
- Includes date navigation to browse previous days
- Error handling for failed API requests
- Uses free NASA demo API key (no registration needed)

### 2. **Data Analysis from Arrays/Objects**
- Analyzes task data stored in arrays and objects across multiple tabs
- Calculates statistics: total tasks, completed tasks, remaining tasks, and completion percentage
- Displays aggregated data from both $H!T MODE and PG MODE
- Real-time progress tracking with visual progress bars

### 3. **Input Validation**
- Prevents empty or whitespace-only task submissions
- Enforces minimum length (2 characters) for task descriptions
- Enforces maximum length (200 characters) to prevent overly long entries
- Detects and prevents duplicate tasks within the same tab
- Provides clear error messages for invalid input

### 4. **Date/External-Factor Calculations**
- Deadline calculator that computes days remaining until a target date
- Input validation ensures deadlines are in the future
- Visual countdown display with gradient styling
- Persists deadline selections using localStorage

### 5. **LocalStorage Persistence**
- All tasks, settings, and modes persist across browser sessions
- Separate storage keys for $H!T MODE and PG MODE
- Deadline preferences saved and restored on page load
- No data loss on page refresh

### 6. **Responsive Design**
- Multiple media queries for mobile (≤420px), tablet (≤768px), and desktop (≥1200px) viewports
- Flexbox and CSS Grid layouts for adaptive content arrangement
- Touch-friendly interface elements on mobile devices
- Optimized typography and spacing for different screen sizes
- Tested on various device sizes

## Features

- 📋 **Multiple Task Lists**: Organize tasks by urgency (Due Today, Next Up, When I Can, Don't Forget)
- ✅ **Task Completion Tracking**: Mark tasks as done and see your progress
- ⏱️ **Built-in Timer**: Focus mode with task-specific timers
- 🎁 **Reward System**: Get fun rewards when you complete tasks
- 💾 **Local Storage**: Your tasks persist across browser sessions
- 🌌 **NASA APOD Integration**: Daily astronomy pictures for inspiration
- 📊 **Task Statistics**: View your productivity stats and completion rates
- 🎨 **Dual Modes**: Toggle between $H!T MODE (punk) and PG MODE (friendly)
- 📱 **Fully Responsive**: Works seamlessly on mobile, tablet, and desktop

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No build tools or dependencies required!

### Installation & Running

1. Clone this repository or download the files
   ```bash
   git clone https://github.com/j3nniferF/dumbit.git
   cd dumbit
   ```

2. Open `index.html` in your web browser
   - **Option 1**: Double-click `index.html` to open in your default browser
   - **Option 2**: Use a local server (recommended for best experience)
     - If you have Python installed:
       ```bash
       python -m http.server 8000
       ```
       Then open `http://localhost:8000` in your browser
     - If you have VS Code, use the Live Server extension

3. Start managing your tasks!
   - Add tasks using the input field
   - Switch between different task categories using the tabs
   - Check off tasks as you complete them
   - Click the 🌌 icon to view NASA's daily space image and your task stats

### NASA API
The app uses NASA's free APOD (Astronomy Picture of the Day) API with a demo key. No API key registration is required for basic use. The demo key has rate limits but is sufficient for typical personal use.

If you want your own API key for higher rate limits:
1. Visit https://api.nasa.gov/
2. Sign up for a free API key
3. Replace `DEMO_KEY` in `js/stats.js` with your key

## Project Structure

```
dumbit/
├── index.html              # Main task management page
├── stats.html              # Statistics and NASA APOD page
├── css/
│   ├── styles.css          # Main application styling
│   └── stats.css           # Statistics page styling
├── js/
│   ├── app.js              # Core app logic and task management
│   ├── stats.js            # NASA API integration and statistics
│   ├── tasks-edit.js       # Task editing functionality
│   ├── enhanced-features.js # Timer and additional features
│   └── interactive-features.js # Interactive UI features
├── assets/                 # Images and other assets
└── README.md              # This file
```

## How to Use

### Managing Tasks
1. Type in the input box and hit ADD (or press Enter) to create a task
2. Click a task to set it as your current IN PROGRESS task
3. Check the box to mark it done
4. Click EDIT to change a task's text
5. Click the ✕ button to delete a task

### Using Tabs
- Organize tasks across 4 tabs: DUE TODAY, NEXT UP, WHEN I CAN, DON'T FORGET
- Double-click any tab name to rename it
- Each mode ($H!T/PG) has separate tabs and tasks

### Timer Feature
- Double-click a task to open the timer for that task
- Or click the timer icon (🕐) to open the timer popup
- Set your time and hit START
- A floating countdown shows while you work
- When time's up: mark it done or add 5 more minutes

### Viewing Stats & Space Images
- Click the 🌌 icon in the top navigation
- View NASA's daily astronomy picture with explanation
- Browse previous days using arrow buttons
- See your task completion statistics
- Set deadlines and view countdown timers

### Modes
- Toggle the switch to flip between $H!T MODE and PG MODE
- $H!T MODE = punk vibes with explosions 💥
- PG MODE = clean and friendly with sparkles ✨
- Each mode has separate tabs and tasks

## Technologies Used

- **HTML5**: Semantic markup and structure
- **CSS3**: Responsive design with Flexbox and Grid, animations, media queries
- **Vanilla JavaScript**: No frameworks, pure ES6+ JavaScript
- **NASA APOD API**: External API integration using fetch()
- **LocalStorage API**: Client-side data persistence
- **Google Fonts**: Bangers font for punk aesthetic

## AI Usage Disclosure

AI tools (GitHub Copilot) were used in the development of this project to:
- Generate boilerplate code and HTML structure
- Assist with CSS styling and responsive design patterns
- Help implement NASA APOD API integration
- Suggest input validation patterns
- Debug and optimize JavaScript functions
- Write documentation and code comments

All AI-generated code was reviewed, tested, and customized to fit the specific requirements of this project.

## Development

This is a vanilla JavaScript project with no build process required. Simply edit the files and refresh your browser to see changes.

## Contributing

Want to contribute? Check out our [GitHub Copilot Guide](./COPILOT-GUIDE.md) for tips on using AI tools to help with code editing!

## GitHub Copilot Guide

If you're looking for help with code editing using AI assistants, we've created a comprehensive guide:

**[📖 GitHub Copilot Guide: Choosing the Right Tool for Code Editing](./COPILOT-GUIDE.md)**

This guide covers:
- Different GitHub Copilot tools (Chat, Workspace, CLI, etc.)
- Which tool is best for interactive editing with preview capabilities
- Comparison of features across all Copilot options
- Practical workflows and examples
- Tips for getting the best results

**TL;DR**: For interactive code editing with previews, use **GitHub Copilot Chat** in your IDE!

## License

This project is open source and available for personal use.

---

**Note**: This project was created as a capstone project demonstrating web development skills including API integration, responsive design, data analysis, input validation, and modern JavaScript practices.
