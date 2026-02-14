console.log("interactive-features.js loaded");

/* =====================================================
   INTERACTIVE FEATURES MODULE
   - Task shake animation
   - Task drag & drop reordering
   - Sound effects with mute toggle
===================================================== */

/* -------------------------------
   Feature 1: Sound Effects
-------------------------------- */

let soundEnabled = true;
const SOUND_STORAGE_KEY = "dsigdt_sound_enabled";

// Load sound preference
function loadSoundPreference() {
  const saved = localStorage.getItem(SOUND_STORAGE_KEY);
  soundEnabled = saved === null ? true : saved === "1";
  updateSoundButton();
}

// Save sound preference
function saveSoundPreference() {
  localStorage.setItem(SOUND_STORAGE_KEY, soundEnabled ? "1" : "0");
}

// Update sound button appearance
function updateSoundButton() {
  const btn = document.getElementById("soundToggle");
  if (!btn) return;
  const icon = btn.querySelector(".icon-button__icon");

  btn.classList.toggle("muted", !soundEnabled);
  if (icon) icon.textContent = soundEnabled ? "🔊" : "🔇";
  btn.title = soundEnabled ? "Mute sound effects" : "Unmute sound effects";
}

// Initialize sound toggle button
function initSoundToggle() {
  const btn = document.getElementById("soundToggle");
  if (!btn) return;
  
  btn.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    saveSoundPreference();
    updateSoundButton();
    
    // Play a test sound when enabling
    if (soundEnabled) {
      playClickSound();
    }
  });
}

// Generate click sound using Web Audio API
function playClickSound() {
  if (!soundEnabled) return;
  
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    
    const ctx = window._clickAudioCtx || (window._clickAudioCtx = new AudioCtx());
    const now = ctx.currentTime;
    
    // Different sounds for different modes
    const isPg = document.body.classList.contains("pg-mode");
    
    if (isPg) {
      // PG mode: gentle pop sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
      
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.15);
    } else {
      // SHIT mode: punchier click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "square";
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
      
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.08);
    }
  } catch (err) {
    console.warn("Sound playback failed:", err);
  }
}

// Timer completion sound
function playTimerCompleteSound() {
  if (!soundEnabled) return;
  
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    
    const ctx = window._clickAudioCtx || (window._clickAudioCtx = new AudioCtx());
    const now = ctx.currentTime;
    
    const isPg = document.body.classList.contains("pg-mode");
    
    if (isPg) {
      // PG mode: pleasant ascending chime
      [523, 659, 784].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.15);
        
        gain.gain.setValueAtTime(0, now + i * 0.15);
        gain.gain.linearRampToValueAtTime(0.3, now + i * 0.15 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.3);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now + i * 0.15);
        osc.stop(now + i * 0.15 + 0.3);
      });
    } else {
      // SHIT mode: punchy alert
      [300, 400, 300, 400].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        
        gain.gain.setValueAtTime(0.25, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.1);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.1);
      });
    }
  } catch (err) {
    console.warn("Timer sound failed:", err);
  }
}

/* -------------------------------
   Feature 2: Shake Animation
-------------------------------- */

function addShakeAnimation(taskRow) {
  taskRow.classList.add("completing");
  
  // Remove class after animation completes
  setTimeout(() => {
    taskRow.classList.remove("completing");
  }, 600);
}

// Hook into checkbox changes
function enableShakeOnComplete() {
  document.addEventListener("change", (e) => {
    if (e.target.classList.contains("task-checkbox")) {
      const taskRow = e.target.closest(".task-row");
      if (taskRow && e.target.checked) {
        addShakeAnimation(taskRow);
        playClickSound();
      }
    }
  });
}

/* -------------------------------
   Feature 3: Drag & Drop
-------------------------------- */

let draggedElement = null;
let draggedTabKey = null;
let draggedTaskText = null;

function enableDragAndDrop() {
  const taskList = document.getElementById("taskList");
  if (!taskList) return;
  
  // Use event delegation for drag events
  taskList.addEventListener("dragstart", handleDragStart);
  taskList.addEventListener("dragover", handleDragOver);
  taskList.addEventListener("drop", handleDrop);
  taskList.addEventListener("dragend", handleDragEnd);
  taskList.addEventListener("dragenter", handleDragEnter);
  taskList.addEventListener("dragleave", handleDragLeave);
  
  // Make existing task rows draggable
  updateDraggableItems();
}

function updateDraggableItems() {
  const taskRows = document.querySelectorAll(".task-row");
  taskRows.forEach(row => {
    row.setAttribute("draggable", "true");
  });
}

function handleDragStart(e) {
  const taskRow = e.target.closest(".task-row");
  if (!taskRow) return;
  
  draggedElement = taskRow;
  draggedTabKey = taskRow.dataset.tab;
  draggedTaskText = taskRow.dataset.task;
  
  taskRow.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/html", taskRow.innerHTML);
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = "move";
  return false;
}

function handleDragEnter(e) {
  const taskRow = e.target.closest(".task-row");
  if (taskRow && taskRow !== draggedElement) {
    taskRow.classList.add("drag-over");
  }
}

function handleDragLeave(e) {
  const taskRow = e.target.closest(".task-row");
  if (taskRow) {
    taskRow.classList.remove("drag-over");
  }
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  
  const targetRow = e.target.closest(".task-row");
  if (!targetRow || !draggedElement || targetRow === draggedElement) {
    return false;
  }
  
  // Get target task info
  const targetTabKey = targetRow.dataset.tab;
  const targetTaskText = targetRow.dataset.task;
  
  // Only allow reordering within the same tab
  if (draggedTabKey !== targetTabKey) {
    return false;
  }
  
  // Dispatch custom event to reorder tasks
  const event = new CustomEvent("task:reorder", {
    detail: {
      tabKey: draggedTabKey,
      fromTask: draggedTaskText,
      toTask: targetTaskText,
      insertBefore: true
    }
  });
  document.dispatchEvent(event);
  
  return false;
}

function handleDragEnd(e) {
  const taskRows = document.querySelectorAll(".task-row");
  taskRows.forEach(row => {
    row.classList.remove("dragging", "drag-over");
  });
  
  draggedElement = null;
  draggedTabKey = null;
  draggedTaskText = null;
}

/* -------------------------------
   Initialize All Features
-------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing interactive features...");
  
  // Wait for main app to initialize
  setTimeout(() => {
    loadSoundPreference();
    initSoundToggle();
    enableShakeOnComplete();
    enableDragAndDrop();
    
    // Listen for timer complete events to play sound
    document.addEventListener("timer:complete", () => {
      playTimerCompleteSound();
    });
    
    // Update draggable items when tasks change
    document.addEventListener("tasks:updated", () => {
      updateDraggableItems();
    });
    
    console.log("✅ Interactive features initialized");
  }, 150);
});

// Expose functions for debugging and external use
window.interactiveFeatures = {
  playClickSound,
  playTimerCompleteSound,
  toggleSound: () => {
    soundEnabled = !soundEnabled;
    saveSoundPreference();
    updateSoundButton();
  },
  isSoundEnabled: () => soundEnabled
};
