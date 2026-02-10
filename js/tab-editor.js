console.log("tab-editor.js loaded");

/* =====================================================
   TAB EDITOR MODULE
   - Edit tab names via double-click
   - Hide/show tabs via right-click context menu
===================================================== */

// Store custom tab names (persisted to localStorage)
let customTabNames = {};
let hiddenTabs = [];

const TAB_STORAGE_KEY = "dsigdt_tab_customization";

// Load tab customizations
function loadTabCustomizations() {
  try {
    const raw = localStorage.getItem(TAB_STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      customTabNames = data.customTabNames || {};
      hiddenTabs = data.hiddenTabs || [];
    }
  } catch (e) {
    console.warn("Failed to load tab customizations:", e);
  }
}

// Save tab customizations
function saveTabCustomizations() {
  try {
    const data = {
      customTabNames,
      hiddenTabs,
    };
    localStorage.setItem(TAB_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to save tab customizations:", e);
  }
}

// Get display name for a tab
function getTabDisplayName(tabKey, defaultLabel) {
  return customTabNames[tabKey] || defaultLabel;
}

// Update tab display
function updateTabDisplay(tab) {
  const tabKey = tab.dataset.tab;
  const defaultLabel = tab.getAttribute("data-default-label") || tab.textContent.trim();
  
  // Store default label if not already stored
  if (!tab.getAttribute("data-default-label")) {
    tab.setAttribute("data-default-label", defaultLabel);
  }

  const displayName = getTabDisplayName(tabKey, defaultLabel);
  tab.textContent = displayName;

  // Apply hidden state
  if (hiddenTabs.includes(tabKey)) {
    tab.style.display = "none";
  } else {
    tab.style.display = "";
  }
}

// Enable double-click to edit tab name
function enableTabNameEditing() {
  const tabs = document.querySelectorAll(".tab");
  
  tabs.forEach((tab) => {
    tab.addEventListener("dblclick", (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const tabKey = tab.dataset.tab;
      const currentText = tab.textContent.trim();
      
      // Create input for editing
      const input = document.createElement("input");
      input.type = "text";
      input.value = currentText;
      input.className = "tab-edit-input";
      input.style.cssText = `
        font-family: inherit;
        font-size: inherit;
        letter-spacing: inherit;
        text-transform: inherit;
        background: rgba(255, 255, 255, 0.9);
        border: 2px solid #c51616;
        padding: 8px 12px;
        border-radius: 4px;
        width: 150px;
        text-align: center;
      `;
      
      // Replace tab text with input
      tab.textContent = "";
      tab.appendChild(input);
      input.focus();
      input.select();
      
      // Save function
      const saveEdit = () => {
        const newText = input.value.trim();
        
        if (newText && newText !== currentText) {
          customTabNames[tabKey] = newText;
          saveTabCustomizations();
        } else if (!newText) {
          // If empty, restore default
          delete customTabNames[tabKey];
          saveTabCustomizations();
        }
        
        updateTabDisplay(tab);
        
        // Dispatch event to update other parts of UI if needed
        const event = new CustomEvent("tab:renamed", {
          detail: { tabKey, newName: newText }
        });
        document.dispatchEvent(event);
      };
      
      // Cancel function
      const cancelEdit = () => {
        updateTabDisplay(tab);
      };
      
      // Handle Enter (save) and Escape (cancel)
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          saveEdit();
        } else if (e.key === "Escape") {
          e.preventDefault();
          cancelEdit();
        }
      });
      
      // Save on blur
      input.addEventListener("blur", saveEdit);
    });
  });
}

// Create context menu for tabs
function createTabContextMenu() {
  // Create menu element if it doesn't exist
  let menu = document.getElementById("tabContextMenu");
  if (!menu) {
    menu = document.createElement("div");
    menu.id = "tabContextMenu";
    menu.className = "context-menu";
    menu.style.cssText = `
      position: fixed;
      background: #f2efe7;
      border: 2px solid #111;
      border-radius: 8px;
      padding: 8px 0;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      display: none;
      min-width: 160px;
    `;
    
    menu.innerHTML = `
      <button class="context-menu-item" data-action="edit">✏️ Edit Name</button>
      <button class="context-menu-item" data-action="hide">👁️ Hide Tab</button>
      <button class="context-menu-item" data-action="reset">🔄 Reset Name</button>
    `;
    
    document.body.appendChild(menu);
    
    // Style menu items
    const style = document.createElement("style");
    style.textContent = `
      .context-menu-item {
        display: block;
        width: 100%;
        padding: 10px 16px;
        border: none;
        background: transparent;
        text-align: left;
        cursor: pointer;
        font-family: inherit;
        font-size: 14px;
        transition: background 0.2s;
      }
      .context-menu-item:hover {
        background: rgba(197, 22, 22, 0.1);
      }
    `;
    document.head.appendChild(style);
  }
  
  return menu;
}

// Enable right-click context menu on tabs
function enableTabContextMenu() {
  const menu = createTabContextMenu();
  const tabs = document.querySelectorAll(".tab");
  let currentTab = null;
  
  tabs.forEach((tab) => {
    tab.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      currentTab = tab;
      
      // Position menu at cursor
      menu.style.left = e.pageX + "px";
      menu.style.top = e.pageY + "px";
      menu.style.display = "block";
    });
  });
  
  // Handle menu actions
  menu.addEventListener("click", (e) => {
    const action = e.target.dataset.action;
    if (!action || !currentTab) return;
    
    const tabKey = currentTab.dataset.tab;
    
    switch (action) {
      case "edit":
        // Trigger double-click behavior
        currentTab.dispatchEvent(new Event("dblclick"));
        break;
        
      case "hide":
        if (!hiddenTabs.includes(tabKey)) {
          hiddenTabs.push(tabKey);
          saveTabCustomizations();
          updateTabDisplay(currentTab);
          
          // Show notification
          showNotification(`Tab hidden. Right-click "Show Hidden Tabs" to restore.`);
        }
        break;
        
      case "reset":
        delete customTabNames[tabKey];
        saveTabCustomizations();
        updateTabDisplay(currentTab);
        break;
    }
    
    menu.style.display = "none";
  });
  
  // Hide menu on click outside
  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target)) {
      menu.style.display = "none";
    }
  });
}

// Add "Show Hidden Tabs" button
function addShowHiddenTabsButton() {
  const tabs = document.getElementById("tabs");
  if (!tabs) return;
  
  let btn = document.getElementById("showHiddenTabsBtn");
  if (btn) return; // Already exists
  
  btn = document.createElement("button");
  btn.id = "showHiddenTabsBtn";
  btn.className = "tab";
  btn.textContent = "👁️";
  btn.title = "Show hidden tabs";
  btn.style.cssText = `
    opacity: 0.3;
    font-size: 1.2em;
  `;
  
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    showHiddenTabsMenu();
  });
  
  tabs.appendChild(btn);
  
  // Update button visibility based on hidden tabs
  updateShowHiddenButton();
}

function updateShowHiddenButton() {
  const btn = document.getElementById("showHiddenTabsBtn");
  if (btn) {
    btn.style.display = hiddenTabs.length > 0 ? "" : "none";
  }
}

function showHiddenTabsMenu() {
  if (hiddenTabs.length === 0) {
    showNotification("No hidden tabs");
    return;
  }
  
  const tabButtons = document.querySelectorAll(".tab");
  const tabMap = {};
  tabButtons.forEach(tab => {
    const key = tab.dataset.tab;
    if (key) tabMap[key] = tab;
  });
  
  const message = hiddenTabs.map(key => {
    const tab = tabMap[key];
    const name = tab ? tab.getAttribute("data-default-label") : key;
    return `• ${name}`;
  }).join("\n");
  
  const restore = confirm(`Hidden tabs:\n${message}\n\nRestore all hidden tabs?`);
  
  if (restore) {
    hiddenTabs = [];
    saveTabCustomizations();
    
    // Update all tab displays
    tabButtons.forEach(updateTabDisplay);
    updateShowHiddenButton();
    
    showNotification("All tabs restored!");
  }
}

// Simple notification system
function showNotification(message) {
  let notification = document.getElementById("tabNotification");
  
  if (!notification) {
    notification = document.createElement("div");
    notification.id = "tabNotification";
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #c51616;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      font-family: inherit;
      font-size: 14px;
      opacity: 0;
      transition: opacity 0.3s;
    `;
    document.body.appendChild(notification);
  }
  
  notification.textContent = message;
  notification.style.opacity = "1";
  
  setTimeout(() => {
    notification.style.opacity = "0";
  }, 3000);
}

// Initialize tab editor features
function initTabEditor() {
  loadTabCustomizations();
  
  // Update all tab displays on load
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach(updateTabDisplay);
  
  enableTabNameEditing();
  enableTabContextMenu();
  addShowHiddenTabsButton();
  
  console.log("✅ Tab editor initialized");
}

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(initTabEditor, 150);
});

// Expose for debugging
window.tabEditor = {
  loadTabCustomizations,
  saveTabCustomizations,
  getTabDisplayName,
  updateTabDisplay,
  showNotification,
};
