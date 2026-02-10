console.log("adhd-features.js loaded");

/* =====================================================
   ADHD/AUTISM-FRIENDLY FEATURES
   - Visual timer progress bar
   - Task priority system
   - Focus mode
   - Keyboard shortcuts
   - Accessibility preferences
   - Enhanced progress feedback
===================================================== */

const ADHD_STORAGE_KEY = "dsigdt_adhd_preferences";

let adhdPreferences = {
  reduceMotion: false,
  soundEnabled: true,
  focusMode: false,
  showProgressBar: true,
  highContrast: false,
};

// Load preferences
function loadAdhdPreferences() {
  try {
    const raw = localStorage.getItem(ADHD_STORAGE_KEY);
    if (raw) {
      adhdPreferences = { ...adhdPreferences, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn("Failed to load ADHD preferences:", e);
  }
}

// Save preferences
function saveAdhdPreferences() {
  try {
    localStorage.setItem(ADHD_STORAGE_KEY, JSON.stringify(adhdPreferences));
  } catch (e) {
    console.warn("Failed to save ADHD preferences:", e);
  }
}

/* -------------------------------
   Visual Timer Progress Bar
-------------------------------- */
function addTimerProgressBar() {
  const timerDisplay = document.getElementById("timerDisplay");
  if (!timerDisplay || document.getElementById("timerProgressBar")) return;

  const progressContainer = document.createElement("div");
  progressContainer.id = "timerProgressContainer";
  progressContainer.style.cssText = `
    width: 100%;
    height: 12px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    overflow: hidden;
    margin: 12px 0;
    position: relative;
  `;

  const progressBar = document.createElement("div");
  progressBar.id = "timerProgressBar";
  progressBar.style.cssText = `
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, #c51616, #ff3333);
    border-radius: 6px;
    transition: width 1s linear;
    box-shadow: 0 0 10px rgba(197, 22, 22, 0.5);
  `;

  progressContainer.appendChild(progressBar);
  timerDisplay.parentNode.insertBefore(progressContainer, timerDisplay.nextSibling);
}

function updateTimerProgressBar(remainingSeconds, totalSeconds) {
  const progressBar = document.getElementById("timerProgressBar");
  if (!progressBar || !adhdPreferences.showProgressBar) return;

  const percentage = (remainingSeconds / totalSeconds) * 100;
  progressBar.style.width = percentage + "%";

  // Change color as time runs out
  if (percentage < 25) {
    progressBar.style.background = "linear-gradient(90deg, #ff0000, #ff5555)";
    progressBar.style.animation = "pulseRed 0.5s ease-in-out infinite";
  } else if (percentage < 50) {
    progressBar.style.background = "linear-gradient(90deg, #ff6600, #ff8833)";
  } else {
    progressBar.style.background = "linear-gradient(90deg, #c51616, #ff3333)";
    progressBar.style.animation = "none";
  }
}

/* -------------------------------
   Task Priority System
-------------------------------- */
function addTaskPriorityUI() {
  // Add priority buttons to the task add form
  const taskAddForm = document.getElementById("taskAddForm");
  if (!taskAddForm || document.getElementById("priorityButtons")) return;

  const priorityContainer = document.createElement("div");
  priorityContainer.id = "priorityButtons";
  priorityContainer.style.cssText = `
    display: flex;
    gap: 8px;
    margin: 8px 0;
    justify-content: center;
  `;

  const priorities = [
    { level: "high", label: "🔥 Urgent", color: "#ff3333" },
    { level: "medium", label: "⚡ Soon", color: "#ff9933" },
    { level: "low", label: "💤 Later", color: "#3399ff" },
  ];

  priorities.forEach(({ level, label, color }) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "priority-btn";
    btn.dataset.priority = level;
    btn.textContent = label;
    btn.style.cssText = `
      padding: 6px 12px;
      border: 2px solid ${color};
      background: transparent;
      color: ${color};
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.2s;
      font-family: inherit;
    `;

    btn.addEventListener("click", () => {
      document.querySelectorAll(".priority-btn").forEach(b => {
        b.style.background = "transparent";
        b.style.fontWeight = "normal";
      });
      btn.style.background = color;
      btn.style.color = "#fff";
      btn.style.fontWeight = "bold";
      window.selectedPriority = level;
    });

    btn.addEventListener("mouseenter", () => {
      if (window.selectedPriority !== level) {
        btn.style.background = color;
        btn.style.color = "#fff";
      }
    });

    btn.addEventListener("mouseleave", () => {
      if (window.selectedPriority !== level) {
        btn.style.background = "transparent";
        btn.style.color = color;
      }
    });

    priorityContainer.appendChild(btn);
  });

  const taskInput = taskAddForm.querySelector("#taskInput");
  taskInput.parentNode.insertBefore(priorityContainer, taskInput.nextSibling);
}

/* -------------------------------
   Focus Mode
-------------------------------- */
function toggleFocusMode() {
  adhdPreferences.focusMode = !adhdPreferences.focusMode;
  saveAdhdPreferences();

  const body = document.body;
  if (adhdPreferences.focusMode) {
    body.classList.add("focus-mode");
    showNotification("🎯 Focus Mode ON - Distractions hidden!");
  } else {
    body.classList.remove("focus-mode");
    showNotification("👁️ Focus Mode OFF");
  }
}

function addFocusModeButton() {
  const tabs = document.getElementById("tabs");
  if (!tabs || document.getElementById("focusModeBtn")) return;

  const btn = document.createElement("button");
  btn.id = "focusModeBtn";
  btn.className = "tab";
  btn.textContent = "🎯";
  btn.title = "Toggle Focus Mode (F)";
  btn.style.cssText = `
    font-size: 1.4em;
    padding: 8px 12px;
  `;

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFocusMode();
  });

  tabs.appendChild(btn);
}

/* -------------------------------
   Keyboard Shortcuts
-------------------------------- */
function setupKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    // Don't trigger if typing in input
    if (e.target.matches("input, textarea")) return;

    switch (e.key.toLowerCase()) {
      case "f":
        // Focus mode
        e.preventDefault();
        toggleFocusMode();
        break;

      case "s":
        // Start timer
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          document.getElementById("startBtn")?.click();
        }
        break;

      case "p":
        // Pause timer
        e.preventDefault();
        document.getElementById("pauseBtn")?.click();
        break;

      case "x":
        // Stop timer
        e.preventDefault();
        document.getElementById("stopBtn")?.click();
        break;

      case "n":
        // Focus on new task input
        e.preventDefault();
        document.getElementById("taskInput")?.focus();
        break;

      case "m":
        // Toggle sound
        e.preventDefault();
        toggleSound();
        break;

      case "r":
        // Toggle reduce motion
        e.preventDefault();
        toggleReduceMotion();
        break;

      case "?":
        // Show help
        e.preventDefault();
        showKeyboardHelp();
        break;
    }
  });

  console.log("⌨️ Keyboard shortcuts enabled");
}

function showKeyboardHelp() {
  const help = `
🎮 KEYBOARD SHORTCUTS:

F - Toggle Focus Mode
N - New task (focus input)
S - Start timer
P - Pause timer
X - Stop timer
M - Toggle sounds
R - Toggle reduce motion
? - Show this help

ESC - Close modals
ENTER - Confirm actions
  `.trim();

  alert(help);
}

/* -------------------------------
   Accessibility Toggles
-------------------------------- */
function toggleSound() {
  adhdPreferences.soundEnabled = !adhdPreferences.soundEnabled;
  saveAdhdPreferences();

  const icon = adhdPreferences.soundEnabled ? "🔊" : "🔇";
  showNotification(`${icon} Sounds ${adhdPreferences.soundEnabled ? "ON" : "OFF"}`);
}

function toggleReduceMotion() {
  adhdPreferences.reduceMotion = !adhdPreferences.reduceMotion;
  saveAdhdPreferences();

  if (adhdPreferences.reduceMotion) {
    document.body.classList.add("reduce-motion");
    showNotification("🎨 Reduced motion enabled");
  } else {
    document.body.classList.remove("reduce-motion");
    showNotification("🎨 Full animations enabled");
  }
}

function addAccessibilityMenu() {
  const layout = document.getElementById("layout");
  if (!layout || document.getElementById("a11yMenu")) return;

  const menu = document.createElement("div");
  menu.id = "a11yMenu";
  menu.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(242, 239, 231, 0.95);
    padding: 12px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    display: flex;
    gap: 8px;
    flex-direction: column;
    min-width: 200px;
  `;

  const title = document.createElement("div");
  title.textContent = "⚙️ Preferences";
  title.style.cssText = `
    font-weight: bold;
    margin-bottom: 8px;
    font-size: 0.9rem;
    text-align: center;
  `;
  menu.appendChild(title);

  const options = [
    { id: "soundToggle", label: "🔊 Sounds", pref: "soundEnabled", fn: toggleSound },
    { id: "motionToggle", label: "🎨 Reduce Motion", pref: "reduceMotion", fn: toggleReduceMotion },
    { id: "progressToggle", label: "📊 Progress Bar", pref: "showProgressBar", fn: () => {
      adhdPreferences.showProgressBar = !adhdPreferences.showProgressBar;
      saveAdhdPreferences();
      const progressContainer = document.getElementById("timerProgressContainer");
      if (progressContainer) {
        progressContainer.style.display = adhdPreferences.showProgressBar ? "block" : "none";
      }
    }},
  ];

  options.forEach(({ id, label, pref, fn }) => {
    const btn = document.createElement("button");
    btn.id = id;
    btn.className = "a11y-toggle";
    btn.textContent = label;
    btn.style.cssText = `
      padding: 8px 12px;
      border: 2px solid #111;
      background: ${adhdPreferences[pref] ? "#c51616" : "#fff"};
      color: ${adhdPreferences[pref] ? "#fff" : "#111"};
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.2s;
      text-align: left;
      font-family: inherit;
    `;

    btn.addEventListener("click", () => {
      fn();
      btn.style.background = adhdPreferences[pref] ? "#c51616" : "#fff";
      btn.style.color = adhdPreferences[pref] ? "#fff" : "#111";
    });

    menu.appendChild(btn);
  });

  const helpBtn = document.createElement("button");
  helpBtn.textContent = "❓ Keyboard Shortcuts";
  helpBtn.style.cssText = `
    padding: 8px 12px;
    border: 2px solid #3399ff;
    background: #3399ff;
    color: #fff;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
    margin-top: 4px;
    font-family: inherit;
  `;
  helpBtn.addEventListener("click", showKeyboardHelp);
  menu.appendChild(helpBtn);

  document.body.appendChild(menu);
}

/* -------------------------------
   Enhanced Progress Feedback
-------------------------------- */
function addStreakCounter() {
  const completedCard = document.querySelector(".card--completed");
  if (!completedCard || document.getElementById("streakCounter")) return;

  const streak = getStreak();
  const streakDiv = document.createElement("div");
  streakDiv.id = "streakCounter";
  streakDiv.style.cssText = `
    text-align: center;
    margin: 16px 0;
    padding: 12px;
    background: rgba(197, 22, 22, 0.1);
    border-radius: 8px;
    border: 2px solid #c51616;
  `;

  streakDiv.innerHTML = `
    <div style="font-size: 2rem; margin-bottom: 4px;">🔥</div>
    <div class="streak-number" style="font-size: 1.5rem; font-weight: bold; color: #c51616;">${streak} Day Streak!</div>
    <div style="font-size: 0.85rem; opacity: 0.8; margin-top: 4px;">Keep it going!</div>
  `;

  const heading = completedCard.querySelector(".card-title");
  heading.parentNode.insertBefore(streakDiv, heading.nextSibling);
}

function getStreak() {
  // Simple streak calculation - could be enhanced
  const stats = JSON.parse(localStorage.getItem("dsigdt_stats") || "{}");
  return stats.streak || 0;
}

function updateStreak() {
  const today = new Date().toDateString();
  const stats = JSON.parse(localStorage.getItem("dsigdt_stats") || "{}");
  
  if (stats.lastCompletionDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (stats.lastCompletionDate === yesterday) {
      stats.streak = (stats.streak || 0) + 1;
    } else {
      stats.streak = 1;
    }
    stats.lastCompletionDate = today;
    localStorage.setItem("dsigdt_stats", JSON.stringify(stats));
  }
  
  return stats.streak;
}

/* -------------------------------
   Celebration Encouragement
-------------------------------- */
function showEncouragement(message) {
  if (!adhdPreferences.soundEnabled) return;

  const encouragements = [
    "🎉 AWESOME JOB!",
    "💪 YOU'RE CRUSHING IT!",
    "🌟 HELL YEAH!",
    "🚀 KEEP GOING!",
    "⭐ YOU'RE A STAR!",
  ];

  const msg = message || encouragements[Math.floor(Math.random() * encouragements.length)];
  showNotification(msg);
}

// Notification helper
function showNotification(message) {
  let notification = document.getElementById("adhdNotification");

  if (!notification) {
    notification = document.createElement("div");
    notification.id = "adhdNotification";
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #c51616;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 10001;
      font-family: inherit;
      font-size: 1.1rem;
      font-weight: bold;
      opacity: 0;
      transition: opacity 0.3s;
      max-width: 300px;
    `;
    document.body.appendChild(notification);
  }

  notification.textContent = message;
  notification.style.opacity = "1";

  setTimeout(() => {
    notification.style.opacity = "0";
  }, 2500);
}

/* -------------------------------
   Initialize All ADHD Features
-------------------------------- */
function initAdhdFeatures() {
  loadAdhdPreferences();

  // Apply saved preferences
  if (adhdPreferences.reduceMotion) {
    document.body.classList.add("reduce-motion");
  }
  if (adhdPreferences.focusMode) {
    document.body.classList.add("focus-mode");
  }

  addTimerProgressBar();
  addTaskPriorityUI();
  addFocusModeButton();
  setupKeyboardShortcuts();
  addAccessibilityMenu();
  addStreakCounter();

  console.log("✅ ADHD-friendly features initialized");
}

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  // Delay to ensure main app and other modules are initialized
  setTimeout(initAdhdFeatures, 200);
});

// Listen for task completions to show encouragement
document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("change", (e) => {
    // Only trigger for task checkboxes
    if (e.target.matches(".task-checkbox") && 
        e.target.type === "checkbox" && 
        e.target.checked) {
      if (adhdPreferences.soundEnabled) {
        showEncouragement();
        updateStreak();
        const streakDiv = document.getElementById("streakCounter");
        if (streakDiv) {
          const streak = getStreak();
          const streakText = streakDiv.querySelector(".streak-number");
          if (streakText) {
            streakText.textContent = `${streak} Day Streak!`;
          }
        }
      }
    }
  });
});

// Export for debugging
window.adhdFeatures = {
  toggleFocusMode,
  toggleSound,
  toggleReduceMotion,
  showKeyboardHelp,
  updateTimerProgressBar,
  showEncouragement,
};
