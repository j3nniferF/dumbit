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
   REMOVED per user request - they want completed tasks to remain visible in "SHIT I DID"
-------------------------------- */

/* -------------------------------
   Feature 3: Data Export/Import
   REMOVED per user request - export/import functionality not needed
-------------------------------- */

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
    // addClearCompletedButton(); // REMOVED - user wants to keep completed tasks visible
    // addDataButtons(); // REMOVED - user doesn't want export/import
    enableDragAndDrop();
    enableDragToTabs();
    makeTasksDraggable();

    console.log("✅ Enhanced features initialized");
  }, 100);
});

// Expose functions for debugging
window.enhancedFeatures = {
  enableInlineEditing,
  enableDragAndDrop,
  enableDragToTabs,
  makeTasksDraggable,
};
