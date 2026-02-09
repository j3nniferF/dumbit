console.log("enhanced-features.js loaded");

/* =====================================================
   ENHANCED FEATURES MODULE
   - Inline task editing
   - Clear completed tasks
   - Data export/import
   - Drag & drop reordering
   - Move tasks between tabs
===================================================== */

/* -------------------------------
   Feature 1: Inline Task Editing
-------------------------------- */

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
    };

    // Cancel function
    const cancelEdit = () => {
      taskText.textContent = originalContent;
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
      // Small delay to allow other events to process
      setTimeout(saveEdit, 100);
    });
  });
}

/* -------------------------------
   Feature 2: Clear Completed Tasks
-------------------------------- */

/**
 * Add "Clear Completed" button and functionality
 */
function addClearCompletedButton() {
  const tasksCard = document.getElementById("tasksCard");
  if (!tasksCard) return;

  // Check if button already exists
  if (document.getElementById("clearCompletedBtn")) return;

  // Create button
  const btn = document.createElement("button");
  btn.id = "clearCompletedBtn";
  btn.className = "btn btn--secondary clear-completed-btn";
  btn.type = "button";
  btn.textContent = "CLEAR COMPLETED";
  btn.style.marginTop = "12px";
  btn.style.width = "100%";

  // Add click handler
  btn.addEventListener("click", () => {
    // Get current active tab from the app
    const activeTab = document.querySelector(".tab--active")?.dataset?.tab || "dueToday";
    
    // Dispatch event to app.js to clear completed tasks
    const event = new CustomEvent("tasks:clearCompleted", {
      detail: { tabKey: activeTab },
    });
    document.dispatchEvent(event);
  });

  // Insert after the task add form
  const form = document.getElementById("taskAddForm");
  if (form && form.parentNode) {
    form.parentNode.insertBefore(btn, form.nextSibling);
  }
}

/* -------------------------------
   Feature 3: Data Export/Import
-------------------------------- */

/**
 * Export tasks data as JSON file
 */
function exportData() {
  try {
    // Get data from localStorage
    const STORAGE_KEY = "dsigdt_state_v1";
    const data = localStorage.getItem(STORAGE_KEY);
    
    if (!data) {
      alert("No data to export!");
      return;
    }

    // Create blob and download
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dumbit-tasks-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert("✅ Tasks exported successfully!");
  } catch (err) {
    console.error("Export failed:", err);
    alert("❌ Export failed: " + err.message);
  }
}

/**
 * Import tasks data from JSON file
 */
function importData(file) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target.result;
      const parsed = JSON.parse(content);

      // Validate structure
      if (!parsed.tasksByTab || !parsed.completedByTab) {
        throw new Error("Invalid data format");
      }

      // Confirm overwrite
      const ok = confirm(
        "⚠️ IMPORT DATA? ⚠️\n\nThis will REPLACE all current tasks!\n\nClick OK to proceed."
      );
      if (!ok) return;

      // Save to localStorage
      const STORAGE_KEY = "dsigdt_state_v1";
      localStorage.setItem(STORAGE_KEY, content);

      // Reload page to apply changes
      alert("✅ Data imported successfully! Reloading...");
      window.location.reload();
    } catch (err) {
      console.error("Import failed:", err);
      alert("❌ Import failed: " + err.message);
    }
  };
  reader.readAsText(file);
}

/**
 * Add export/import buttons to UI
 */
function addDataButtons() {
  const completedCard = document.getElementById("completedCard");
  if (!completedCard) return;

  // Check if buttons already exist
  if (document.getElementById("exportBtn")) return;

  // Create container
  const container = document.createElement("div");
  container.className = "data-buttons";
  container.style.marginTop = "16px";
  container.style.display = "flex";
  container.style.gap = "8px";
  container.style.flexWrap = "wrap";

  // Export button
  const exportBtn = document.createElement("button");
  exportBtn.id = "exportBtn";
  exportBtn.className = "btn btn--small";
  exportBtn.type = "button";
  exportBtn.textContent = "💾 EXPORT DATA";
  exportBtn.addEventListener("click", exportData);

  // Import button
  const importBtn = document.createElement("button");
  importBtn.id = "importBtn";
  importBtn.className = "btn btn--small";
  importBtn.type = "button";
  importBtn.textContent = "📥 IMPORT DATA";

  // Hidden file input
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".json";
  fileInput.style.display = "none";
  fileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      importData(e.target.files[0]);
    }
  });

  importBtn.addEventListener("click", () => fileInput.click());

  container.appendChild(exportBtn);
  container.appendChild(importBtn);
  container.appendChild(fileInput);

  // Insert before reset button
  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn && resetBtn.parentNode) {
    resetBtn.parentNode.insertBefore(container, resetBtn);
  }
}

/* -------------------------------
   Feature 4 & 5: Drag & Drop
-------------------------------- */

let draggedElement = null;
let draggedTaskData = null;

/**
 * Enable drag and drop for tasks
 */
function enableDragAndDrop() {
  const taskList = document.getElementById("taskList");
  if (!taskList) return;

  // Make task list a drop zone
  taskList.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    const afterElement = getDragAfterElement(taskList, e.clientY);
    const draggable = draggedElement;

    if (draggable && afterElement == null) {
      taskList.appendChild(draggable);
    } else if (draggable && afterElement) {
      taskList.insertBefore(draggable, afterElement);
    }
  });

  taskList.addEventListener("drop", (e) => {
    e.preventDefault();
    if (!draggedTaskData) return;

    // Get final position
    const items = Array.from(taskList.querySelectorAll(".task"));
    const newOrder = items.map((item) => {
      const row = item.querySelector(".task-row");
      return row ? row.dataset.task : null;
    }).filter(Boolean);

    // Dispatch reorder event
    const activeTab = document.querySelector(".tab--active")?.dataset?.tab;
    if (activeTab) {
      const event = new CustomEvent("tasks:reordered", {
        detail: {
          tabKey: activeTab,
          newOrder,
        },
      });
      document.dispatchEvent(event);
    }

    // Clean up
    if (draggedElement) {
      draggedElement.style.opacity = "1";
    }
    draggedElement = null;
    draggedTaskData = null;
  });

  // Use event delegation for task items
  taskList.addEventListener("dragstart", (e) => {
    const taskItem = e.target.closest(".task");
    if (!taskItem) return;

    const taskRow = taskItem.querySelector(".task-row");
    if (!taskRow) return;

    draggedElement = taskItem;
    draggedTaskData = {
      tabKey: taskRow.dataset.tab,
      taskText: taskRow.dataset.task,
    };

    taskItem.style.opacity = "0.5";
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", taskItem.innerHTML);
  });

  taskList.addEventListener("dragend", (e) => {
    if (draggedElement) {
      draggedElement.style.opacity = "1";
    }
    draggedElement = null;
    draggedTaskData = null;
  });
}

/**
 * Helper: Find element that should come after dragged item
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
 * Enable dragging tasks to tab buttons to move between tabs
 */
function enableDragToTabs() {
  const tabs = document.querySelectorAll(".tab");
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      tab.style.background = "rgba(197, 22, 22, 0.2)";
    });

    tab.addEventListener("dragleave", () => {
      tab.style.background = "";
    });

    tab.addEventListener("drop", (e) => {
      e.preventDefault();
      tab.style.background = "";

      if (!draggedTaskData) return;

      const targetTab = tab.dataset.tab;
      const sourceTab = draggedTaskData.tabKey;

      // Don't do anything if dropping on same tab
      if (targetTab === sourceTab) return;

      // Dispatch move event
      const event = new CustomEvent("tasks:movedToTab", {
        detail: {
          sourceTab,
          targetTab,
          taskText: draggedTaskData.taskText,
        },
      });
      document.dispatchEvent(event);

      draggedElement = null;
      draggedTaskData = null;
    });
  });
}

/**
 * Make tasks draggable by adding draggable attribute
 */
function makeTasksDraggable() {
  // Use MutationObserver to watch for task list changes
  const taskList = document.getElementById("taskList");
  if (!taskList) return;

  const observer = new MutationObserver(() => {
    const tasks = taskList.querySelectorAll(".task");
    tasks.forEach((task) => {
      if (!task.hasAttribute("draggable")) {
        task.setAttribute("draggable", "true");
        task.style.cursor = "move";
      }
    });
  });

  observer.observe(taskList, {
    childList: true,
    subtree: false,
  });

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

document.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing enhanced features...");

  // Wait a bit for the main app to initialize
  setTimeout(() => {
    enableInlineEditing();
    addClearCompletedButton();
    addDataButtons();
    enableDragAndDrop();
    enableDragToTabs();
    makeTasksDraggable();

    console.log("✅ Enhanced features initialized");
  }, 100);
});

// Expose functions for debugging
window.enhancedFeatures = {
  exportData,
  importData,
  enableInlineEditing,
  addClearCompletedButton,
  addDataButtons,
  enableDragAndDrop,
  enableDragToTabs,
  makeTasksDraggable,
};
