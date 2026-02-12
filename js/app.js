// feature/test-inline-edit
// Or use a debug flag if needed

/* =====================================================
   DSIGDT — MVP v3.4 (CLEAN + CELEBRATION)
   - Tabs: per-tab tasks
   - Add task: goes into active tab
   - Checkbox: marks complete (stored per tab)
   - Completed card: grouped by tab
   - Focus picker:
       1) PICK A LIST (ALL or one tab)
       2) PICK A TASK
   - Click a task row: sets CURRENT task + highlights it
   - Timer: minimal START/PAUSE/STOP wiring
   - Celebration:
       Confetti + prize modal fires ONLY when you finish ALL tasks in a tab
       (and can fire again if you add tasks later and re-finish)
===================================================== */

const STORAGE_KEY = "dsigdt_state_v1";

const TAB_ORDER = ["dueToday", "soon", "asSoonAsICan", "dontForget"];

const TAB_LABELS_DEFAULT = {
  dueToday: "DUE TODAY",
  soon: "NEXT UP",
  asSoonAsICan: "WHEN I CAN",
  dontForget: "DON'T FORGET",
};

let TAB_LABELS = { ...TAB_LABELS_DEFAULT };

// Default seed tasks — sassy for $H!T mode, friendly for PG mode
const DEFAULT_TASKS_PUNK = {
  dueToday: ["Shower (yes, today)", "Take your damn meds", "Answer that email you've been ignoring"],
  soon: ["Clean the kitchen before it becomes sentient", "Drag yourself to the grocery store"],
  asSoonAsICan: ["Organize closet (stop pretending you will)", "Call the dentist already"],
  dontForget: ["Buy cat food or face the consequences", "Pay credit card before they find you"],
};

const DEFAULT_TASKS_PG = {
  dueToday: ["Take a nice shower", "Take your vitamins", "Breathe & stretch for 5 min"],
  soon: ["Tidy up the kitchen", "Quick grocery run"],
  asSoonAsICan: ["Organize your closet", "Schedule a dentist appointment"],
  dontForget: ["Pick up pet food", "Pay credit card bill"],
};

let TASKS_BY_TAB = {
  dueToday: [],
  soon: [],
  asSoonAsICan: [],
  dontForget: [],
};

let COMPLETED_TASKS = {
  dueToday: [],
  soon: [],
  asSoonAsICan: [],
  dontForget: [],
};

let activeTabKey = "dueToday";

/* Focus UI state */
let focusScope = "dueToday"; // "all" or a tabKey
let selectedFocusValue = ""; // `${tabKey}::${taskText}`

/* Timer state */
let remainingSeconds = 0;
let intervalId = null;

/* -------------------------------
   Celebration (confetti + modal)
-------------------------------- */

// Track whether each tab WAS complete last time we checked.
// We only celebrate when it flips from false -> true.
let TAB_COMPLETE_LAST = {
  dueToday: false,
  soon: false,
  asSoonAsICan: false,
  dontForget: false,
};

function isTabComplete(tabKey) {
  const total = (TASKS_BY_TAB[tabKey] || []).length;
  const done = (COMPLETED_TASKS[tabKey] || []).length;
  return total > 0 && done >= total;
}

function syncTabCompleteLast(tabKey) {
  TAB_COMPLETE_LAST[tabKey] = isTabComplete(tabKey);
}

function initTabCompleteLast() {
  TAB_ORDER.forEach((k) => {
    TAB_COMPLETE_LAST[k] = isTabComplete(k);
  });
}

/* Roast messages (module-level so prize modal can use them) */
const ROAST_MESSAGES_PUNK = [
  "WOW YOU ACTUALLY DID SOMETHING 🎉",
  "LOOK AT YOU, BEING A FUNCTIONAL HUMAN 💅",
  "ONE DOWN, A MILLION TO GO 🔥",
  "THAT WASN'T SO HARD, WAS IT? 😏",
  "YOUR MOM WOULD BE SO PROUD RN 🥲",
  "OKAY OKAY, I SEE YOU WORKING 👀",
  "SOMEBODY GIVE THIS PERSON A COOKIE 🍪",
  "BET THAT FELT GOOD, DIDN'T IT? 😎",
  "NOW DO ANOTHER ONE. DON'T STOP. 💪",
  "ARE YOU... ACTUALLY BEING PRODUCTIVE?! 😱",
];

const ROAST_MESSAGES_PG = [
  "NICE WORK! YOU'RE DOING GREAT! 🌟",
  "ANOTHER ONE DONE — YOU'RE ON A ROLL! ✨",
  "LOOK AT THAT PROGRESS! 🎉",
  "YOU SHOULD BE PROUD OF YOURSELF! 💙",
  "KEEP GOING, YOU'RE AMAZING! 🙌",
  "ONE STEP CLOSER TO YOUR GOALS! 🚀",
  "WONDERFUL JOB! TREAT YOURSELF! 🍫",
  "PRODUCTIVITY LOOKS GOOD ON YOU! 😊",
  "YOU'RE MAKING IT HAPPEN! 💪",
  "THAT'S THE WAY TO DO IT! ⭐",
];

function openPrizeModal() {
  const overlay = document.getElementById("prizeOverlay");
  if (!overlay) return;

  // Show a roast message inside the prize modal
  const roastEl = document.getElementById("prizeRoast");
  if (roastEl) {
    const messages = window._pgMode ? ROAST_MESSAGES_PG : ROAST_MESSAGES_PUNK;
    roastEl.textContent = messages[Math.floor(Math.random() * messages.length)];
  }

  overlay.classList.remove("is-hidden");
}

function closePrizeModal() {
  const overlay = document.getElementById("prizeOverlay");
  if (!overlay) return;
  overlay.classList.add("is-hidden");
}

function openTimerPopup() {
  const overlay = document.getElementById("timerPopupOverlay");
  if (!overlay) return;
  overlay.classList.remove("is-hidden");
  syncTimerBubble(true);
  // Make timer icon faint while popup is open
  const timerBtn = document.getElementById("openTimerBtn");
  if (timerBtn) timerBtn.classList.add("timer--faint");
}

function isTimerPopupOpen() {
  const overlay = document.getElementById("timerPopupOverlay");
  return overlay && !overlay.classList.contains("is-hidden");
}

function closeTimerPopup() {
  const overlay = document.getElementById("timerPopupOverlay");
  if (!overlay) return;
  overlay.classList.add("is-hidden");
  syncTimerBubble();
  // Restore timer icon visibility
  const timerBtn = document.getElementById("openTimerBtn");
  if (timerBtn) timerBtn.classList.remove("timer--faint");
}

let timerPopupWired = false;

function wireTimerPopup() {
  if (timerPopupWired) return; // Prevent multiple wirings
  timerPopupWired = true;
  
  const overlay = document.getElementById("timerPopupOverlay");
  const closeXBtn = document.getElementById("closeTimerX");
  const openBtn = document.getElementById("openTimerBtn");
  
  if (openBtn) {
    openBtn.addEventListener("click", () => openTimerPopup());
  }

  if (closeXBtn) {
    closeXBtn.addEventListener("click", () => closeTimerPopup());
    closeXBtn.addEventListener("touchend", (e) => { e.preventDefault(); closeTimerPopup(); });
  }
  
  if (overlay) {
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) closeTimerPopup();
    });
    // Also handle touchend for mobile close
    overlay.addEventListener("touchend", (event) => {
      if (event.target === overlay) {
        event.preventDefault();
        closeTimerPopup();
      }
    });
  }
  
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay && !overlay.classList.contains("is-hidden")) {
      closeTimerPopup();
    }
  });
}

function openTimerModal(taskName) {
  const overlay = document.getElementById("timerOverlay");
  const taskText = document.getElementById("timerModalTask");
  if (!overlay || !taskText) return;

  taskText.textContent = `DONE WITH "${taskName || "THIS TASK"}"?`;
  overlay.classList.remove("is-hidden");
}

function closeTimerModal() {
  const overlay = document.getElementById("timerOverlay");
  if (!overlay) return;
  overlay.classList.add("is-hidden");
}

function wireTimerModal() {
  const overlay = document.getElementById("timerOverlay");
  const doneBtn = document.getElementById("timerDoneBtn");
  const notDoneBtn = document.getElementById("timerNotDoneBtn");

  if (doneBtn) {
    doneBtn.addEventListener("click", () => {
      if (selectedFocusValue) {
        const { tabKey, taskText } = parseTaskValue(selectedFocusValue);
        if (tabKey && taskText) completeTask(tabKey, taskText);
      }
      closeTimerModal();
      // Scroll to task input
      const taskInput = document.getElementById("taskInput");
      if (taskInput) {
        taskInput.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => taskInput.focus(), 500);
      }
    });
  }

  if (notDoneBtn) {
    notDoneBtn.addEventListener("click", () => {
      closeTimerModal();
      addTimeMinutes(5);
    });
  }

  if (overlay) {
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) closeTimerModal();
    });
  }

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeTimerModal();
  });
}

function wirePrizeModalClose() {
  const overlay = document.getElementById("prizeOverlay");
  const btn = document.getElementById("backToItBtn");
  const closeX = document.getElementById("closePrizeX");

  if (btn)
    btn.addEventListener("click", () => {
      closePrizeModal();
      // Scroll to task input
      const taskInput = document.getElementById("taskInput");
      if (taskInput) {
        taskInput.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => taskInput.focus(), 500);
      }
    });

  if (closeX) {
    closeX.addEventListener("click", () => {
      closePrizeModal();
    });
  }

  // click outside modal closes
  if (overlay) {
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) closePrizeModal();
    });
  }

  // ESC closes
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closePrizeModal();
  });
}

/* JS-only confetti (no libraries) */
function fireConfettiBurst() {
  // inject keyframes once
  if (!document.getElementById("confettiStyles")) {
    const style = document.createElement("style");
    style.id = "confettiStyles";
    style.textContent = `
      @keyframes confettiFall {
        0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
        100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  const wrap = document.createElement("div");
  wrap.style.position = "fixed";
  wrap.style.inset = "0";
  wrap.style.pointerEvents = "none";
  wrap.style.zIndex = "9999";

  const colors = ["#c51616", "#111", "#f3f1e9", "#eaeaea", "#f0ecde"];
  // increased count and larger size range for bigger confetti
  for (let i = 0; i < 180; i++) {
    const bit = document.createElement("div");
    const size = Math.random() * 18 + 8; // bigger pieces

    bit.style.position = "absolute";
    bit.style.top = "-10vh";
    bit.style.left = Math.random() * 100 + "vw";
    bit.style.width = size + "px";
    bit.style.height = Math.max(4, size * (0.5 + Math.random() * 0.4)) + "px";
    bit.style.background = colors[Math.floor(Math.random() * colors.length)];
    bit.style.borderRadius = Math.random() > 0.6 ? "50%" : "3px";
    bit.style.opacity = "0.95";

    const duration = 2 + Math.random() * 2.2;
    const delay = Math.random() * 0.35;

    bit.style.transform = `rotate(${Math.random() * 360}deg)`;
    bit.style.animation = `confettiFall ${duration}s linear ${delay}s forwards`;

    wrap.appendChild(bit);
  }

  document.body.appendChild(wrap);

  // keep on screen longer so larger pieces finish animating
  setTimeout(() => {
    wrap.remove();
  }, 5000);
}

function celebrateIfTabJustCompleted(tabKey) {
  const nowComplete = isTabComplete(tabKey);
  const wasComplete = TAB_COMPLETE_LAST[tabKey];

  // DEBUG: show transition state in console
  console.debug(
    "[celebrate] tab:",
    tabKey,
    "wasComplete:",
    wasComplete,
    "nowComplete:",
    nowComplete,
  );

  // Only fire on transition: not complete -> complete
  if (!wasComplete && nowComplete) {
    // confetti + modal are non-critical — fail gracefully if something goes wrong
    try {
      fireConfettiBurst();
    } catch (e) {
      // no-op
    }
    openPrizeModal();
  }

  // update last-known state
  TAB_COMPLETE_LAST[tabKey] = nowComplete;
}

/* -------------------------------
   Persistence
-------------------------------- */
function normalizeState() {
  TAB_ORDER.forEach((k) => {
    if (!Array.isArray(TASKS_BY_TAB[k])) TASKS_BY_TAB[k] = [];
    if (!Array.isArray(COMPLETED_TASKS[k])) COMPLETED_TASKS[k] = [];
  });

  if (!TAB_ORDER.includes(activeTabKey)) activeTabKey = TAB_ORDER[0];
  if (focusScope !== "all" && !TAB_ORDER.includes(focusScope))
    focusScope = activeTabKey;
  if (typeof selectedFocusValue !== "string") selectedFocusValue = "";
}

function saveState() {
  const state = {
    tasksByTab: TASKS_BY_TAB,
    completedByTab: COMPLETED_TASKS,
    activeTabKey,
    focusScope,
    selectedFocusValue,
    tabLabels: TAB_LABELS,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // localStorage may be unavailable in some environments; keep app usable
    console.warn("Could not save state:", e);
  }
}

function seedDefaultTasks() {
  const defaults = window._pgMode ? DEFAULT_TASKS_PG : DEFAULT_TASKS_PUNK;
  TAB_ORDER.forEach((k) => {
    if (defaults[k]) TASKS_BY_TAB[k] = [...defaults[k]];
  });
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    seedDefaultTasks();
    return;
  }

  try {
    const parsed = JSON.parse(raw);

    if (parsed.tasksByTab && typeof parsed.tasksByTab === "object") {
      TASKS_BY_TAB = parsed.tasksByTab;
    }
    if (parsed.completedByTab && typeof parsed.completedByTab === "object") {
      COMPLETED_TASKS = parsed.completedByTab;
    }
    if (
      typeof parsed.activeTabKey === "string" &&
      TAB_ORDER.includes(parsed.activeTabKey)
    ) {
      activeTabKey = parsed.activeTabKey;
    }
    if (typeof parsed.focusScope === "string") focusScope = parsed.focusScope;
    if (typeof parsed.selectedFocusValue === "string")
      selectedFocusValue = parsed.selectedFocusValue;
    if (parsed.tabLabels && typeof parsed.tabLabels === "object") {
      TAB_LABELS = { ...TAB_LABELS_DEFAULT, ...parsed.tabLabels };
    }

    normalizeState();
    // Ensure the baseline for celebration logic reflects the loaded state
    initTabCompleteLast();
  } catch (err) {
    console.warn("Saved state corrupted; using defaults.", err);
    normalizeState();
    initTabCompleteLast();
  }
}

/* -------------------------------
   Helpers
-------------------------------- */
function makeTaskValue(tabKey, taskText) {
  return `${tabKey}::${taskText}`;
}

function parseTaskValue(value) {
  const [tabKey, ...rest] = (value || "").split("::");
  return { tabKey, taskText: rest.join("::") };
}

function getIncompleteTasks(tabKey) {
  const all = TASKS_BY_TAB[tabKey] || [];
  const done = COMPLETED_TASKS[tabKey] || [];
  return all.filter((t) => !done.includes(t));
}

/* -------------------------------
   UI sync
-------------------------------- */
function syncHeadings(tabKey) {
  const tasksHeading = document.getElementById("tasksHeading");
  const label = TAB_LABELS[tabKey] || tabKey;
  if (tasksHeading) tasksHeading.textContent = `${label}:`;
}

function syncActiveTabUI(tabsNodeList, tabKey) {
  tabsNodeList.forEach((t) => {
    const isActive = t.dataset.tab === tabKey;
    t.classList.toggle("tab--active", isActive);
    if (isActive) t.setAttribute("aria-current", "page");
    else t.removeAttribute("aria-current");
  });
}

function syncCurrentTaskText() {
  const wrap = document.getElementById("currentTaskText");
  if (!wrap) return;

  const tabEl = wrap.querySelector(".current-task__tab");
  const taskEl = wrap.querySelector(".current-task__task");
  if (!tabEl || !taskEl) return;

  if (!selectedFocusValue) {
    tabEl.textContent = "(none)";
    taskEl.textContent = "(none)";
    wrap.classList.add("is-hidden");
    return;
  }

  wrap.classList.remove("is-hidden");
  const { tabKey, taskText } = parseTaskValue(selectedFocusValue);
  tabEl.textContent = TAB_LABELS[tabKey] || tabKey || "(none)";
  taskEl.textContent = taskText || "(none)";
}

function updateProgress() {
  const progressText = document.getElementById("progressText");
  const completedCount = document.getElementById("completedCount");
  const breakdown = document.getElementById("progressBreakdown");
  const ring = document.getElementById("progressRing");
  const funBar = document.getElementById("funProgressBar");

  let total = 0;
  let done = 0;

  TAB_ORDER.forEach((tabKey) => {
    total += (TASKS_BY_TAB[tabKey] || []).length;
    done += (COMPLETED_TASKS[tabKey] || []).length;
  });

  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  if (completedCount) {
    completedCount.textContent = `${done}/${total}`;
  } else if (progressText) {
    progressText.textContent = `${done} / ${total} TASKS DONE`;
  }

  if (progressText) {
    progressText.setAttribute("aria-label", `${done} of ${total} tasks done`);
  }

  if (ring) {
    ring.style.setProperty("--progress", `${percent}`);
    ring.setAttribute("aria-label", `${percent}% complete`);
  }

  if (breakdown) {
    breakdown.innerHTML = "";
    TAB_ORDER.forEach((tabKey) => {
      const t = (TASKS_BY_TAB[tabKey] || []).length;
      const d = (COMPLETED_TASKS[tabKey] || []).length;
      const li = document.createElement("li");
      li.textContent = `${TAB_LABELS[tabKey]}: ${d} / ${t}`;
      breakdown.appendChild(li);
    });
  }

  // Fun progress bar
  if (funBar) {
    const fill = funBar.querySelector(".fun-progress__fill");
    const label = funBar.querySelector(".fun-progress__label");
    if (fill) fill.style.width = percent + "%";
    if (label) {
      const isPg = window._pgMode;
      let msg = "";
      if (total === 0) msg = isPg ? "Add some tasks!" : "ADD SOME SHIT!";
      else if (percent === 0) msg = isPg ? "Let's get started!" : "GET OFF YOUR ASS! 🔥";
      else if (percent < 25) msg = isPg ? "Good start! Keep going!" : "BABY STEPS... 👶";
      else if (percent < 50) msg = isPg ? "Making progress! ✨" : "OKAY NOT BAD... 🤔";
      else if (percent < 75) msg = isPg ? "Over halfway! 🎉" : "HALFWAY THERE, LEGEND 💪";
      else if (percent < 100) msg = isPg ? "Almost done! 🌟" : "SO CLOSE I CAN TASTE IT 🔥🔥";
      else msg = isPg ? "All done! Amazing! 🏆" : "YOU ABSOLUTE BEAST!! 🏆🎉💀";
      label.textContent = msg;
    }
  }
}

/* -------------------------------
   Completed render (grouped)
-------------------------------- */
function renderCompletedGrouped() {
  const groups = document.getElementById("completedGroups");
  if (!groups) return;

  groups.innerHTML = "";

  TAB_ORDER.forEach((tabKey) => {
    const done = COMPLETED_TASKS[tabKey] || [];
    const details = document.createElement("details");
    details.className = "completed-group";

    const summary = document.createElement("summary");
    summary.className = "completed-subheading";
    summary.textContent = TAB_LABELS[tabKey] || tabKey;

    const ul = document.createElement("ul");
    ul.className = "completed-list";

    done.forEach((taskText) => {
      const li = document.createElement("li");
      li.style.display = "flex";
      li.style.alignItems = "center";
      li.style.justifyContent = "space-between";

      const textSpan = document.createElement("span");
      textSpan.textContent = taskText;
      li.appendChild(textSpan);

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "task-delete completed-delete";
      deleteBtn.type = "button";
      deleteBtn.title = "Remove task";
      deleteBtn.setAttribute("aria-label", "Remove task");
      deleteBtn.textContent = "✕";
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteTask(tabKey, taskText);
      });
      li.appendChild(deleteBtn);

      ul.appendChild(li);
    });

    details.appendChild(summary);
    details.appendChild(ul);
    groups.appendChild(details);
  });
}

/* -------------------------------
   Focus dropdown builder
-------------------------------- */
function buildFocusSelect(valueToSelect) {
  const focusSelect = document.getElementById("focusSelect");
  const focusTabSelect = document.getElementById("focusTabSelect");
  if (!focusSelect) return;

  const desired = valueToSelect ?? selectedFocusValue ?? focusSelect.value;

  if (focusTabSelect) focusTabSelect.value = focusScope;

  focusSelect.innerHTML = "";
  const base = document.createElement("option");
  base.value = "";
  base.textContent = "(Pick a task)";
  focusSelect.appendChild(base);

  const addOption = (tabKey, taskText, parent) => {
    const opt = document.createElement("option");
    opt.value = makeTaskValue(tabKey, taskText);
    opt.textContent = taskText;
    parent.appendChild(opt);
  };

  if (focusScope === "all") {
    TAB_ORDER.forEach((tabKey) => {
      const tasks = getIncompleteTasks(tabKey);
      if (tasks.length === 0) return;

      const og = document.createElement("optgroup");
      og.label = TAB_LABELS[tabKey] || tabKey;

      tasks.forEach((taskText) => addOption(tabKey, taskText, og));
      focusSelect.appendChild(og);
    });
  } else {
    const tasks = getIncompleteTasks(focusScope);
    tasks.forEach((taskText) => addOption(focusScope, taskText, focusSelect));
  }

  const exists = Array.from(focusSelect.options).some(
    (o) => o.value === desired,
  );
  selectedFocusValue = exists ? desired : "";
  focusSelect.value = selectedFocusValue;

  syncCurrentTaskText();
  renderTasks(activeTabKey);
  saveState();
}

function setSelectedFocus(value) {
  selectedFocusValue = value || "";
  buildFocusSelect(selectedFocusValue);
  syncCurrentTaskText();
  renderTasks(activeTabKey);
  saveState();
  syncTimerBubble();
  
  // Don't auto-open timer popup - let users manually open it
  // This allows double-click editing to work without interference
}

function clearSelectedFocus() {
  setSelectedFocus("");
}

/* -------------------------------
   Tasks render
-------------------------------- */
function renderTasks(tabKey) {
  const taskList = document.getElementById("taskList");
  if (!taskList) return;

  taskList.innerHTML = "";

  const remaining = getIncompleteTasks(tabKey);

  remaining.forEach((taskText) => {
    const value = makeTaskValue(tabKey, taskText);

    const li = document.createElement("li");
    li.className = "task";
    li.dataset.tab = tabKey;
    li.dataset.task = taskText;
    if (value === selectedFocusValue) li.classList.add("task--selected");

    li.innerHTML = `
      <label class="task-row">
        <input class="task-checkbox" type="checkbox" />
        <span class="task-text"></span>
      </label>
      <button class="task-delete" type="button" title="Delete task" aria-label="Delete task">✕</button>
    `;

    // --- NEW: attach identifying data so inline editor can find and update this task ---
    const rowLabel = li.querySelector(".task-row");
    if (rowLabel) {
      rowLabel.dataset.tab = tabKey;
      rowLabel.dataset.task = taskText;
    }
    // -------------------------------------------------------------------------------

    const textEl = li.querySelector(".task-text");
    textEl.textContent = taskText;
    textEl.setAttribute("tabindex", "0");
    textEl.setAttribute("role", "textbox");
    taskList.appendChild(li);

    const checkbox = li.querySelector(".task-checkbox");

    // Prevent checkbox click from selecting the row
    checkbox.addEventListener("click", (event) => event.stopPropagation());

    // Click row selects CURRENT task (skip if inline-editing)
    li.addEventListener("click", () => {
      if (window.enhancedFeatures && window.enhancedFeatures.isEditingTask()) return;
      const focusTabSelect = document.getElementById("focusTabSelect");
      if (focusTabSelect && focusScope !== "all" && focusScope !== tabKey) {
        focusScope = "all";
        focusTabSelect.value = "all";
      }
      setSelectedFocus(value);
    });

    // Checkbox completes task
    checkbox.addEventListener("change", (event) => {
      if (!event.target.checked) return;
      completeTask(tabKey, taskText);
    });

    // Delete button removes task
    const deleteBtn = li.querySelector(".task-delete");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        deleteTask(tabKey, taskText);
      });
    }
  });
}

function completeTask(tabKey, taskText) {
  if (!COMPLETED_TASKS[tabKey]) COMPLETED_TASKS[tabKey] = [];
  if (!COMPLETED_TASKS[tabKey].includes(taskText)) {
    COMPLETED_TASKS[tabKey].push(taskText);
  }

  const value = makeTaskValue(tabKey, taskText);
  if (selectedFocusValue === value) selectedFocusValue = "";

  saveState();
  syncCurrentTaskText();
  renderTasks(tabKey);
  renderCompletedGrouped();
  buildFocusSelect();
  updateProgress();

  // ✅ celebration after UI updates
  celebrateIfTabJustCompleted(tabKey);
}

function deleteTask(tabKey, taskText) {
  const tasks = TASKS_BY_TAB[tabKey];
  if (!tasks) return;

  const idx = tasks.indexOf(taskText);
  if (idx > -1) tasks.splice(idx, 1);

  // Also remove from completed if present
  const completed = COMPLETED_TASKS[tabKey];
  if (completed) {
    const cIdx = completed.indexOf(taskText);
    if (cIdx > -1) completed.splice(cIdx, 1);
  }

  const value = makeTaskValue(tabKey, taskText);
  if (selectedFocusValue === value) selectedFocusValue = "";

  syncTabCompleteLast(tabKey);
  saveState();
  syncCurrentTaskText();
  renderTasks(activeTabKey);
  renderCompletedGrouped();
  buildFocusSelect();
  updateProgress();
}

/* -------------------------------
   Add task
-------------------------------- */
function wireAddTaskForm() {
  const form = document.getElementById("taskAddForm");
  const input = document.getElementById("taskInput");
  const error = document.getElementById("taskError");
  if (!form || !input) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const raw = input.value.trim();
    if (!raw) {
      if (error) error.textContent = "Type something first.";
      return;
    }
    if (error) error.textContent = "";

    if (!TASKS_BY_TAB[activeTabKey]) TASKS_BY_TAB[activeTabKey] = [];

    if (!TASKS_BY_TAB[activeTabKey].includes(raw)) {
      TASKS_BY_TAB[activeTabKey].push(raw);
    }

    // Adding a task can make a previously-complete tab incomplete again
    // Sync last-known completion so it can be celebrated again once re-finished
    syncTabCompleteLast(activeTabKey);

    const focusTabSelect = document.getElementById("focusTabSelect");
    if (focusTabSelect) {
      focusScope = activeTabKey;
      focusTabSelect.value = activeTabKey;
    }

    const newValue = makeTaskValue(activeTabKey, raw);
    selectedFocusValue = newValue;

    saveState();

    renderTasks(activeTabKey);
    renderCompletedGrouped();
    buildFocusSelect(newValue);
    syncCurrentTaskText();
    updateProgress();

    input.value = "";
    input.focus();
  });
}

/* -------------------------------
   Focus pickers
-------------------------------- */
function wireFocusPickers() {
  const focusTabSelect = document.getElementById("focusTabSelect");
  const focusSelect = document.getElementById("focusSelect");

  if (focusTabSelect) {
    focusTabSelect.addEventListener("change", () => {
      focusScope = focusTabSelect.value;
      buildFocusSelect();
    });
  }

  if (focusSelect) {
    focusSelect.addEventListener("change", () => {
      const val = focusSelect.value || "";
      if (!val) {
        clearSelectedFocus();
        return;
      }
      setSelectedFocus(val);
    });
  }
}

/* -------------------------------
   Reset
-------------------------------- */
function emptyState() {
  return { dueToday: [], soon: [], asSoonAsICan: [], dontForget: [] };
}

function wireResetButton(tabsNodeList) {
  const resetBtn = document.getElementById("resetBtn");
  if (!resetBtn) return;

  resetBtn.addEventListener("click", () => {
    const ok = confirm(
      "💣 YOU REALLY WANNA RE-SET EVERYTHING? 💣\nThis clears all tasks + completed items.",
    );
    if (!ok) return;

    TASKS_BY_TAB = emptyState();
    COMPLETED_TASKS = emptyState();

    activeTabKey = "dueToday";
    focusScope = "dueToday";
    selectedFocusValue = "";

    stopInterval();
    resetTimerToSelectedDuration();

    saveState();

    syncActiveTabUI(tabsNodeList, activeTabKey);
    syncHeadings(activeTabKey);

    renderTasks(activeTabKey);
    renderCompletedGrouped();
    buildFocusSelect();
    syncCurrentTaskText();
    updateProgress();

    initTabCompleteLast();
    closePrizeModal();
  });
}

/* -------------------------------
   Timer (minimal wiring)
-------------------------------- */
function formatTime(seconds) {
  const hh = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  if (hh === "00") return `${mm}:${ss}`;
  return `${hh}:${mm}:${ss}`;
}

function syncTimerBubble(forceHide = false) {
  const bubble = document.getElementById("timerBubble");
  const floatBtn = document.getElementById("openTimerBtn");
  const floatingCountdown = document.getElementById("floatingCountdown");
  const floatingTime = document.getElementById("floatingCountdownTime");
  const floatingTask = document.getElementById("floatingCountdownTask");
  if (!bubble || !floatBtn) return;

  const displaySeconds =
    remainingSeconds > 0 ? remainingSeconds : getSelectedDurationSeconds();

  bubble.textContent = formatTime(Math.max(0, displaySeconds));

  // Update floating countdown widget - show whenever timer is running
  const isRunning = intervalId !== null;
  if (floatingCountdown && floatingTime) {
    floatingCountdown.classList.toggle("is-visible", !!isRunning);
    if (isRunning) {
      floatingTime.textContent = formatTime(Math.max(0, displaySeconds));
      if (floatingTask && selectedFocusValue) {
        const { tabKey, taskText } = parseTaskValue(selectedFocusValue);
        floatingTask.textContent = `${TAB_LABELS[tabKey] || tabKey}: ${taskText}`;
      }
    }
  }

  // Hide timer bubble when floating countdown is visible (avoid duplicate timers)
  const shouldShow =
    !forceHide &&
    selectedFocusValue &&
    !isRunning;

  bubble.classList.toggle("is-hidden", !shouldShow);
  floatBtn.classList.toggle("is-running", intervalId !== null);
  // Hide timer icon entirely when timer is running (floating countdown is visible instead)
  floatBtn.classList.toggle("timer--hidden", isRunning);
}

function setTimerDisplay(seconds) {
  syncTimerBubble();
}

function getSelectedDurationSeconds() {
  if (!window._dialValues) return 0;
  const h = window._dialValues.hours || 0;
  const m = window._dialValues.minutes || 0;
  const s = window._dialValues.seconds || 0;
  return h * 3600 + m * 60 + s;
}

function resetTimerToSelectedDuration() {
  remainingSeconds = getSelectedDurationSeconds();
  setTimerDisplay(remainingSeconds);
  syncTimerBubble();
}

/* Scrollable Dial Picker */
function buildDialColumn(container, count, initialValue) {
  container.innerHTML = "";

  // Add top spacer so first item can be centered in the scroll view
  const topSpacer = document.createElement("div");
  topSpacer.className = "dial-spacer";
  container.appendChild(topSpacer);

  for (let i = 0; i < count; i++) {
    const item = document.createElement("div");
    item.className = "dial-item";
    item.dataset.value = i;
    item.textContent = String(i).padStart(2, "0");
    if (i === initialValue) item.classList.add("dial-item--selected");
    container.appendChild(item);
  }

  // Add bottom spacer so last item can be centered
  const bottomSpacer = document.createElement("div");
  bottomSpacer.className = "dial-spacer";
  container.appendChild(bottomSpacer);

  // Size spacers so first/last items can be centered (half container minus half item height)
    requestAnimationFrame(() => {
    const itemHeight = 40; // matches .dial-item height in CSS
    const spacerHeight = Math.max(0, container.offsetHeight / 2 - itemHeight / 2);
    topSpacer.style.height = spacerHeight + "px";
    bottomSpacer.style.height = spacerHeight + "px";

    const selected = container.querySelector(".dial-item--selected");
    if (selected) {
      container.scrollTop = selected.offsetTop - container.offsetHeight / 2 + selected.offsetHeight / 2;
    }
  });
}

function getDialValue(container) {
  const selected = container.querySelector(".dial-item--selected");
  return selected ? Number(selected.dataset.value) : 0;
}

function wireDialScroll(container, onChange) {
  let scrollTimeout = null;

  function snapToNearest() {
    const items = container.querySelectorAll(".dial-item");
    const containerRect = container.getBoundingClientRect();
    const centerY = containerRect.top + containerRect.height / 2;
    let closest = null;
    let closestDist = Infinity;

    items.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const itemCenter = rect.top + rect.height / 2;
      const dist = Math.abs(itemCenter - centerY);
      if (dist < closestDist) {
        closestDist = dist;
        closest = item;
      }
    });

    if (closest) {
      items.forEach((i) => i.classList.remove("dial-item--selected"));
      closest.classList.add("dial-item--selected");
      closest.scrollIntoView({ block: "center", behavior: "smooth" });
      if (onChange) onChange(Number(closest.dataset.value));
    }
  }

  container.addEventListener("scroll", () => {
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(snapToNearest, 120);
  });

  // Click to select
  container.addEventListener("click", (e) => {
    const item = e.target.closest(".dial-item");
    if (!item) return;
    container.querySelectorAll(".dial-item").forEach((i) => i.classList.remove("dial-item--selected"));
    item.classList.add("dial-item--selected");
    item.scrollIntoView({ block: "center", behavior: "smooth" });
    if (onChange) onChange(Number(item.dataset.value));
  });

  // Keyboard support
  container.addEventListener("keydown", (e) => {
    const current = container.querySelector(".dial-item--selected");
    if (!current) return;
    let next = null;
    if (e.key === "ArrowDown") {
      next = current.nextElementSibling;
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      next = current.previousElementSibling;
      e.preventDefault();
    }
    if (next && next.classList.contains("dial-item")) {
      container.querySelectorAll(".dial-item").forEach((i) => i.classList.remove("dial-item--selected"));
      next.classList.add("dial-item--selected");
      next.scrollIntoView({ block: "center", behavior: "smooth" });
      if (onChange) onChange(Number(next.dataset.value));
    }
  });
}

function wireDialPicker() {
  const hoursEl = document.getElementById("dialHours");
  const minutesEl = document.getElementById("dialMinutes");
  const secondsEl = document.getElementById("dialSeconds");
  if (!hoursEl || !minutesEl || !secondsEl) return;

  window._dialValues = { hours: 0, minutes: 0, seconds: 0 };

  const MAX_TIMER_HOURS = 9; // 0 through 8 hours
  buildDialColumn(hoursEl, MAX_TIMER_HOURS, 0);
  buildDialColumn(minutesEl, 60, 0); // 0-59 minutes, default 0
  buildDialColumn(secondsEl, 60, 0);  // 0-59 seconds

  wireDialScroll(hoursEl, (v) => { window._dialValues.hours = v; });
  wireDialScroll(minutesEl, (v) => { window._dialValues.minutes = v; });
  wireDialScroll(secondsEl, (v) => { window._dialValues.seconds = v; });
}

function playTimerBell() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = (window._timerAudioCtx =
      window._timerAudioCtx || new AudioCtx());
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.7);
    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.9);
  } catch (e) {
    console.warn("Timer bell failed", e);
  }
}

function startCountdown() {
  if (!selectedFocusValue) {
    alert("Pick a task first. That becomes your CURRENT task.");
    return;
  }

  if (intervalId !== null) return;
  if (remainingSeconds <= 0) resetTimerToSelectedDuration();

  // Still zero after reset means user hasn't set a duration on the dials
  if (remainingSeconds <= 0) {
    alert("Set a time first.");
    return;
  }

  // Auto-close timer popup when starting
  if (isTimerPopupOpen()) {
    closeTimerPopup();
  }

  intervalId = setInterval(() => {
    remainingSeconds -= 1;
    setTimerDisplay(remainingSeconds);

    if (remainingSeconds <= 0) {
      stopInterval();
      remainingSeconds = 0;
      setTimerDisplay(0);
      const { taskText } = parseTaskValue(selectedFocusValue);
      playTimerBell();
      fireConfettiBurst();
      // Show timer done modal first (prize comes after if task is completed)
      openTimerModal(taskText);
    }
  }, 1000);
  syncTimerBubble();
}

function addTimeMinutes(minutes) {
  const extra = Math.max(1, Number(minutes)) * 60;
  remainingSeconds = Math.max(0, remainingSeconds) + extra;
  setTimerDisplay(remainingSeconds);
  startCountdown();
}

function stopInterval() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
  syncTimerBubble();
}

function wireTimer() {
  const startBtn = document.getElementById("startBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const resetTimerBtn = document.getElementById("resetTimerBtn");

  if (!startBtn || !pauseBtn) {
    console.warn("Timer elements missing. Check IDs in index.html.");
    return;
  }

  wireDialPicker();
  resetTimerToSelectedDuration();

  startBtn.addEventListener("click", () => startCountdown());

  pauseBtn.addEventListener("click", () => {
    stopInterval();
  });

  if (resetTimerBtn) {
    resetTimerBtn.addEventListener("click", () => {
      stopInterval();
      // Reset dial values and rebuild dials to default
      window._dialValues = { hours: 0, minutes: 0, seconds: 0 };
      const hoursEl = document.getElementById("dialHours");
      const minutesEl = document.getElementById("dialMinutes");
      const secondsEl = document.getElementById("dialSeconds");
      if (hoursEl) buildDialColumn(hoursEl, 9, 0);
      if (minutesEl) buildDialColumn(minutesEl, 60, 0);
      if (secondsEl) buildDialColumn(secondsEl, 60, 0);
      resetTimerToSelectedDuration();
    });
  }
}

/* -------------------------------
   Draggable floating countdown
-------------------------------- */
function wireFloatingCountdown() {
  const el = document.getElementById("floatingCountdown");
  if (!el) return;

  let isDragging = false;
  let didDrag = false;
  let startX = 0, startY = 0, startLeft = 0, startTop = 0;

  el.addEventListener("mousedown", (e) => {
    isDragging = true;
    didDrag = false;
    el.classList.add("is-dragging");
    const rect = el.getBoundingClientRect();
    startX = e.clientX;
    startY = e.clientY;
    startLeft = rect.left;
    startTop = rect.top;
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    didDrag = true;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    el.style.left = (startLeft + dx) + "px";
    el.style.top = (startTop + dy) + "px";
    el.style.right = "auto";
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      el.classList.remove("is-dragging");
    }
  });

  // Touch support
  el.addEventListener("touchstart", (e) => {
    isDragging = true;
    didDrag = false;
    el.classList.add("is-dragging");
    const rect = el.getBoundingClientRect();
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    startLeft = rect.left;
    startTop = rect.top;
  }, { passive: true });

  document.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    didDrag = true;
    const touch = e.touches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    el.style.left = (startLeft + dx) + "px";
    el.style.top = (startTop + dy) + "px";
    el.style.right = "auto";
  }, { passive: true });

  document.addEventListener("touchend", () => {
    if (isDragging) {
      isDragging = false;
      el.classList.remove("is-dragging");
    }
  });

  // Click on countdown opens timer popup (only if not dragged)
  el.addEventListener("click", (e) => {
    if (e.target.closest(".floating-countdown__pause")) return;
    if (!didDrag) {
      openTimerPopup();
    }
  });

  // Pause button on floating countdown
  const pauseBtn = document.getElementById("floatingCountdownPause");
  if (pauseBtn) {
    pauseBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      stopInterval();
    });
  }
}

/* -------------------------------
   Boot
-------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab");

  loadState();
  normalizeState();
  initTabCompleteLast();

  // Apply custom tab labels to tab buttons and focus dropdown
  function applyTabLabels() {
    tabs.forEach((tab) => {
      const key = tab.dataset.tab;
      if (key && TAB_LABELS[key]) tab.textContent = TAB_LABELS[key];
    });
    // Update focus tab dropdown
    const fts = document.getElementById("focusTabSelect");
    if (fts) {
      Array.from(fts.options).forEach((opt) => {
        if (opt.value !== "all" && TAB_LABELS[opt.value]) {
          opt.textContent = TAB_LABELS[opt.value];
        }
      });
    }
  }
  applyTabLabels();

  // Double-click tab to rename
  tabs.forEach((tab) => {
    tab.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      const key = tab.dataset.tab;
      if (!key) return;
      const current = TAB_LABELS[key] || key;
      const newName = prompt("Rename this tab:", current);
      if (newName && newName.trim()) {
        TAB_LABELS[key] = newName.trim().toUpperCase();
        applyTabLabels();
        syncHeadings(activeTabKey);
        renderCompletedGrouped();
        buildFocusSelect(selectedFocusValue);
        saveState();
      }
    });
  });

  wirePrizeModalClose();
  wireTimerModal();
  wireTimerPopup();
  wireFloatingCountdown();
  wireResetButton(tabs);
  wireAddTaskForm();
  wireFocusPickers();
  wireTimer();

  // Tab click behavior
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Skip if this is the timer button
      if (tab.id === "openTimerBtn") return;
      
      activeTabKey = tab.dataset.tab;

      const focusTabSelect = document.getElementById("focusTabSelect");
      if (focusTabSelect) {
        focusScope = activeTabKey;
        focusTabSelect.value = activeTabKey;
      }

      syncActiveTabUI(tabs, activeTabKey);
      syncHeadings(activeTabKey);

      renderTasks(activeTabKey);
      renderCompletedGrouped();

      buildFocusSelect(selectedFocusValue);
      syncCurrentTaskText();

      updateProgress();
      saveState();
    });
  });

  // Initial paint
  const focusTabSelect = document.getElementById("focusTabSelect");
  if (focusTabSelect) focusTabSelect.value = focusScope;

  syncActiveTabUI(tabs, activeTabKey);
  syncHeadings(activeTabKey);

  renderTasks(activeTabKey);
  renderCompletedGrouped();
  buildFocusSelect(selectedFocusValue);
  syncCurrentTaskText();
  updateProgress();
  syncTimerBubble();

  // Listen for inline edits from tasks-edit.js or enhanced-features.js
  document.addEventListener("task:edited", (e) => {
    const { tabKey, originalText, newText, row } = e.detail || {};

    // If we don't have tab/original, bail
    if (!tabKey || typeof originalText !== "string") return;

    // Ensure tab exists
    if (!Array.isArray(TASKS_BY_TAB[tabKey])) TASKS_BY_TAB[tabKey] = [];

    const idx = TASKS_BY_TAB[tabKey].findIndex((t) => t === originalText);

    if (newText === "") {
      // delete task if empty
      if (idx > -1) TASKS_BY_TAB[tabKey].splice(idx, 1);
    } else {
      if (idx > -1) {
        TASKS_BY_TAB[tabKey][idx] = newText;
      } else {
        // fallback: add if original wasn't found
        TASKS_BY_TAB[tabKey].push(newText);
      }
    }

    // Persist and refresh UI
    saveState();

    // If current tab is the edited tab, re-render tasks for it; otherwise keep UI stable
    renderTasks(activeTabKey);
    renderCompletedGrouped();
    buildFocusSelect(selectedFocusValue);
    syncCurrentTaskText();
    updateProgress();
  });

  // ===== FUN FEATURE: Motivational roast toasts on task completion =====
  // (Roast message arrays are defined at module level for prize modal access)

  function showRoastToast() {
    // If prize modal is about to show, skip toast — roast appears in prize modal instead
    const prizeOverlay = document.getElementById("prizeOverlay");
    if (prizeOverlay && !prizeOverlay.classList.contains("is-hidden")) return;

    const messages = window._pgMode ? ROAST_MESSAGES_PG : ROAST_MESSAGES_PUNK;
    const msg = messages[Math.floor(Math.random() * messages.length)];
    const toast = document.createElement("div");
    toast.className = "roast-toast";
    toast.textContent = msg;
    document.body.appendChild(toast);
    // Trigger animation
    requestAnimationFrame(() => toast.classList.add("roast-toast--show"));
    setTimeout(() => {
      toast.classList.remove("roast-toast--show");
      toast.classList.add("roast-toast--hide");
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  // Hook into task completion via checkbox changes
  document.getElementById("taskList")?.addEventListener("change", (e) => {
    if (e.target.classList.contains("task-checkbox") && e.target.checked) {
      showRoastToast();
    }
  });

  // ===== FUN FEATURE: Task streak counter =====
  const MS_PER_DAY = 24 * 60 * 60 * 1000; // milliseconds in one day
  let streak = Number(localStorage.getItem("dsigdt_streak") || 0);
  const lastDate = localStorage.getItem("dsigdt_streak_date");
  const today = new Date().toDateString();
  if (lastDate !== today) {
    // Check if yesterday
    const yesterday = new Date(Date.now() - MS_PER_DAY).toDateString();
    if (lastDate !== yesterday) streak = 0;
  }

  function bumpStreak() {
    const now = new Date().toDateString();
    if (localStorage.getItem("dsigdt_streak_date") !== now) {
      streak++;
      localStorage.setItem("dsigdt_streak", streak);
      localStorage.setItem("dsigdt_streak_date", now);
    }
  }

  // Show streak in header
  const streakEl = document.createElement("div");
  streakEl.className = "streak-badge";
  const fireEmoji = document.createTextNode("🔥 ");
  const streakSpan = document.createElement("span");
  streakSpan.id = "streakCount";
  streakSpan.textContent = streak;
  const streakLabel = document.createTextNode(" DAY STREAK");
  streakEl.appendChild(fireEmoji);
  streakEl.appendChild(streakSpan);
  streakEl.appendChild(streakLabel);
  streakEl.title = "Complete a task each day to keep your streak!";
  const header = document.getElementById("header");
  if (header) header.appendChild(streakEl);

  // Bump streak on any task completion
  document.getElementById("taskList")?.addEventListener("change", (e) => {
    if (e.target.classList.contains("task-checkbox") && e.target.checked) {
      bumpStreak();
      const countEl = document.getElementById("streakCount");
      if (countEl) countEl.textContent = streak;
    }
  });

  // ===== PG MODE / $H!T MODE TOGGLE =====
  const PG_STORAGE_KEY = "dsigdt_pg_mode";

  const TEXT_MAP = {
    titleLine1:       { punk: "DUMB shit",                    pg: "SILLY STUFF" },
    titleLine2:       { punk: "I GOTta dO TODay",             pg: "TO DO TODAY" },
    completedHeading: { punk: "SHIT I DID:",                  pg: "COMPLETED:" },
    resetBtn:         { punk: "🧨 RESET EVERYTHING",          pg: "Reset Everything" },
    prizeLine1:       { punk: "GOOD JOB",                     pg: "GREAT JOB" },
    prizeLine2:       { punk: "DUMMY!",                       pg: "SUPERSTAR!" },
    prizeSubtitle:    { punk: "PICK A PRIZE",                 pg: "You earned a reward!" },
    prizeNote:        { punk: "or you can stare at this cute dumb cat", pg: "enjoy this cute cat!" },
    backToItBtn:      { punk: "NOW GET BACK TO WORK DUMMY",   pg: "KEEP UP THE GREAT WORK!" },
    timerChooseLabel: { punk: "CHOOSE VIOLENCE:",             pg: "SELECT YOUR TASK:" },
    timerChooseHint:  { punk: "(PICK A TAB / PICK A TASK)",   pg: "(Choose a tab / Choose a task)" },
    timerFooterMsg:   { punk: "→ MURDER TASKS! ✅ GET A PRIZE!", pg: "→ Complete tasks! ✅ Earn a reward!" },
  };

  const PLACEHOLDER_MAP = {
    taskInput: { punk: "+ ADD MORE SHIT", pg: "+ Add a new task" },
  };

  function applyThemeText(mode) {
    for (const [id, texts] of Object.entries(TEXT_MAP)) {
      const el = document.getElementById(id);
      if (el) el.textContent = texts[mode];
    }
    for (const [id, texts] of Object.entries(PLACEHOLDER_MAP)) {
      const el = document.getElementById(id);
      if (el) el.placeholder = texts[mode];
    }
    // Update prize list items
    const prizeList = document.getElementById("prizeList");
    if (prizeList) {
      const items = prizeList.querySelectorAll("li");
      const punkPrizes = ["GO FOR A WALK.", "TAKE A QUICK NAP.", "GO GET YOUR PRODUCTIVE ASS SOME SKITTLES."];
      const pgPrizes = ["Go for a nice walk.", "Take a quick nap.", "Treat yourself to a snack!"];
      const prizes = mode === "pg" ? pgPrizes : punkPrizes;
      items.forEach((li, i) => { if (prizes[i]) li.textContent = prizes[i]; });
    }
  }

  window._pgMode = false;

  function setPgMode(on) {
    const mode = on ? "pg" : "punk";
    document.body.classList.toggle("pg-mode", on);
    applyThemeText(mode);

    const label = document.getElementById("pgLabel");
    if (label) label.textContent = on ? "PG MODE" : "$H!T MODE";

    // Flipped: checked = shit mode, unchecked = PG mode
    const toggle = document.getElementById("pgToggle");
    if (toggle) toggle.checked = !on;

    localStorage.setItem(PG_STORAGE_KEY, on ? "1" : "0");

    window._pgMode = on;

    // Update fun progress label for current mode
    updateProgress();
  }

  // Wire toggle — flipped: checked means shit mode (not PG)
  const pgToggle = document.getElementById("pgToggle");
  if (pgToggle) {
    pgToggle.addEventListener("change", () => setPgMode(!pgToggle.checked));
  }

  // Restore saved preference (always call setPgMode to set toggle state)
  const savedPg = localStorage.getItem(PG_STORAGE_KEY);
  setPgMode(savedPg === "1");
});
