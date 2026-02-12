console.log("enhanced-features.js loaded");

/* =====================================================
   ENHANCED FEATURES MODULE
   - Inline task editing
===================================================== */

/* -------------------------------
   Feature 1: Inline Task Editing
-------------------------------- */

let isEditingTask = false;

/**
 * Enable double-click to edit task text inline
 */
function enableInlineEditing() {
  // Use event delegation on the task list
  const taskList = document.getElementById("taskList");
  if (!taskList) return;

  taskList.addEventListener("dblclick", (e) => {
    const taskText = e.target.closest(".task-text");
    if (!taskText) return;

    const taskRow = e.target.closest(".task-row");
    if (!taskRow) return;

    // Prevent the task selection from happening
    e.stopPropagation();
    e.preventDefault();
    
    // Set editing flag
    isEditingTask = true;

    const tabKey = taskRow.dataset.tab;
    const originalText = taskRow.dataset.task;

    if (!tabKey || !originalText) return;

    // Prevent editing if already editing
    if (taskText.querySelector("input")) return;

    // Store original content
    const originalContent = taskText.textContent;

    // Create input field
    const input = document.createElement("input");
    input.type = "text";
    input.className = "task-edit-input";
    input.value = originalContent;
    input.style.width = "100%";
    input.style.fontSize = "inherit";
    input.style.fontFamily = "inherit";
    input.style.padding = "2px 4px";
    input.style.border = "2px solid #c51616";
    input.style.borderRadius = "4px";
    input.style.background = "#fff";

    // Replace text with input
    taskText.textContent = "";
    taskText.appendChild(input);
    input.focus();
    input.select();

    // Save function
    const saveEdit = () => {
      const newText = input.value.trim();
      
      // Restore original if empty or unchanged
      if (!newText || newText === originalText) {
        taskText.textContent = originalContent;
        isEditingTask = false;
        return;
      }

      // Dispatch custom event to update the task
      const event = new CustomEvent("task:edited", {
        detail: {
          tabKey,
          originalText,
          newText,
          row: taskRow,
        },
      });
      document.dispatchEvent(event);
      isEditingTask = false;
    };

    // Cancel function
    const cancelEdit = () => {
      taskText.textContent = originalContent;
      isEditingTask = false;
    };

    // Handle Enter key (save)
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        saveEdit();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancelEdit();
      }
    });

    // Handle blur (save)
    input.addEventListener("blur", () => {
      saveEdit();
    });
  });
}

/**
 * Add visual feedback when timer is running
 */
function enableTimerAnimations() {
  const startBtn = document.getElementById("startBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const floatingCountdown = document.getElementById("floatingCountdown");

  if (!startBtn) return;

  // Add running class to floating countdown when timer starts
  startBtn.addEventListener("click", () => {
    if (floatingCountdown) floatingCountdown.classList.add("timer--running");
  });

  if (pauseBtn) {
    pauseBtn.addEventListener("click", () => {
      if (floatingCountdown) floatingCountdown.classList.remove("timer--running");
    });
  }

  // Listen for timer completion (when modal opens)
  const timerOverlay = document.getElementById("timerOverlay");
  if (timerOverlay) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const isHidden = timerOverlay.classList.contains("is-hidden");
          if (!isHidden) {
            if (floatingCountdown) floatingCountdown.classList.remove("timer--running");
          }
        }
      });
    });
    observer.observe(timerOverlay, { attributes: true });
  }
}

/* -------------------------------
   Initialize All Features
-------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing enhanced features...");

  // Wait a bit for the main app to initialize
  setTimeout(() => {
    enableInlineEditing();
    enableTimerAnimations();

    console.log("✅ Enhanced features initialized");
  }, 100);
});

// Expose functions for debugging
window.enhancedFeatures = {
  enableInlineEditing,
  enableTimerAnimations,
  isEditingTask: () => isEditingTask,
};
