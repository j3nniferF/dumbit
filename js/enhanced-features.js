console.log("enhanced-features.js loaded");

/* =====================================================
   ENHANCED FEATURES MODULE
   - Inline task editing
   - Drag & drop reordering
   - Move tasks between tabs
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


let draggedElement = null;
let draggedTaskData = null;

function enableDragAndDrop() {
  const taskList = document.getElementById("taskList");
  if (!taskList) return;

  // Make task list a drop zone
  let draggedItem = null;

  // Dragstart
  taskList.addEventListener("dragstart", (e) => {
    const task = e.target.closest(".task");
    if (!task) return;

    draggedItem = task;
    task.style.opacity = "0.5";
  });

  // Dragend
  taskList.addEventListener("dragend", (e) => {
    const task = e.target.closest(".task");
    if (task) {
      task.style.opacity = "1";
    }
    draggedItem = null;
  });

  // Dragover
  taskList.addEventListener("dragover", (e) => {
    e.preventDefault();

    const afterElement = getDragAfterElement(taskList, e.clientY);
    if (afterElement == null) {
      taskList.appendChild(draggedItem);
    } else {
      taskList.insertBefore(draggedItem, afterElement);
    }
  });

  // Drop
  taskList.addEventListener("drop", (e) => {
    e.preventDefault();

    // Dispatch event to save new order
    const tasks = Array.from(taskList.children);
    const tabKey =
      tasks.find((task) => task.dataset.tab)?.dataset.tab ||
      document.querySelector(".tab--active")?.dataset.tab;
    const event = new CustomEvent("tasks:reordered", {
      detail: {
        tabKey,
        newOrder: tasks.map((task) => task.dataset.task).filter(Boolean),
      },
    });
    document.dispatchEvent(event);
  });
}

/**
 * Helper: Find element after which to insert dragged item
 */
function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".task:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

/**
 * Enable dragging tasks to different tabs
 */
function enableDragToTabs() {
  const taskList = document.getElementById("taskList");
  const tabs = document.querySelectorAll(".tab");
  if (!taskList || !tabs.length) return;

  let draggedTask = null;

  // Track dragged task
  taskList.addEventListener("dragstart", (e) => {
    const task = e.target.closest(".task");
    if (task) {
      draggedTask = {
        text: task.dataset.task,
        tab: task.dataset.tab,
        completed: task.querySelector("input[type='checkbox']")?.checked || false,
      };
    }
  });

  taskList.addEventListener("dragend", () => {
    draggedTask = null;
    tabs.forEach((tab) => {
      tab.style.backgroundColor = "";
    });
  });

  // Tab hover effects
  tabs.forEach((tab) => {
    tab.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (draggedTask && tab.dataset.tab !== draggedTask.tab) {
        tab.style.backgroundColor = "#c51616";
      }
    });

    tab.addEventListener("dragleave", () => {
      tab.style.backgroundColor = "";
    });

    tab.addEventListener("drop", (e) => {
      e.preventDefault();
      tab.style.backgroundColor = "";

      if (!draggedTask) return;

      const targetTab = tab.dataset.tab;
      if (targetTab === draggedTask.tab) return;

      // Dispatch event to move task
      const event = new CustomEvent("task:movedToTab", {
        detail: {
          taskText: draggedTask.text,
          sourceTab: draggedTask.tab,
          targetTab,
          completed: draggedTask.completed,
        },
      });
      document.dispatchEvent(event);
    });
  });
}

/**
 * Make tasks draggable (called after rendering)
 */
function makeTasksDraggable() {
  const taskList = document.getElementById("taskList");
  if (!taskList) return;

  // Observer to make new tasks draggable
  const observer = new MutationObserver(() => {
    const tasks = taskList.querySelectorAll(".task");
    tasks.forEach((task) => {
      if (!task.getAttribute("draggable")) {
        task.setAttribute("draggable", "true");
        task.style.cursor = "move";
      }
    });
  });

  observer.observe(taskList, { childList: true, subtree: true });

  // Initial application
  const tasks = taskList.querySelectorAll(".task");
  tasks.forEach((task) => {
    task.setAttribute("draggable", "true");
    task.style.cursor = "move";
  });
}

/* -------------------------------
   Initialize All Features
-------------------------------- */

/**
 * Add visual feedback when timer is running
 */
function enableTimerAnimations() {
  const startBtn = document.getElementById("startBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const stopBtn = document.getElementById("stopBtn");
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

  if (stopBtn) {
    stopBtn.addEventListener("click", () => {
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

document.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing enhanced features...");

  // Wait a bit for the main app to initialize
  setTimeout(() => {
    // enableInlineEditing(); // REMOVED - inline editing disabled for now
    enableDragAndDrop();
    // enableDragToTabs(); // REMOVED - cross-tab drag disabled per user request
    makeTasksDraggable();
    enableTimerAnimations();

    console.log("✅ Enhanced features initialized");
  }, 100);
});

// Expose functions for debugging
window.enhancedFeatures = {
  enableInlineEditing,
  enableDragAndDrop,
  enableDragToTabs,
  makeTasksDraggable,
  enableTimerAnimations,
  isEditingTask: () => isEditingTask,
};
