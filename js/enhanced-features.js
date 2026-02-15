console.log("enhanced-features.js loaded");

/* =====================================================
   ENHANCED FEATURES MODULE
   - Timer animations + sound-adjacent enhancements
===================================================== */

// Inline editing moved to app.js; keep API for compatibility.
function enableInlineEditing() {}

function isEditingTask() {
  return false;
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
  isEditingTask,
};
