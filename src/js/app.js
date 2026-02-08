console.log("App loaded — feature/test-inline-edit");

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

const TAB_LABELS = {
  dueToday: "DUE TODAY",
  soon: "NEXT UP",
  asSoonAsICan: "WHEN I CAN",
  dontForget: "DON'T FORGET",
};

// Default seed (only used if no localStorage state exists)
let TASKS_BY_TAB = {
  dueToday: ["Email landlord", "Finish capstone work", "Take meds"],
  soon: ["Clean kitchen", "Grocery run"],
  asSoonAsICan: ["Organize closet", "Call dentist"],
  dontForget: ["Buy cat food", "Pay credit card"],
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

function openPrizeModal() {
  const overlay = document.getElementById("prizeOverlay");
  if (!overlay) return;
  overlay.classList.remove("is-hidden");
}

function closePrizeModal() {
  const overlay = document.getElementById("prizeOverlay");
  if (!overlay) return;
  overlay.classList.add("is-hidden");
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
  const addTimeBtn = document.getElementById("timerAddTimeBtn");
  const addTimeSelect = document.getElementById("timerAddSelect");
  const notDoneBtn = document.getElementById("timerNotDoneBtn");

  if (doneBtn) {
    doneBtn.addEventListener("click", () => {
      if (selectedFocusValue) {
        const { tabKey, taskText } = parseTaskValue(selectedFocusValue);
        if (tabKey && taskText) completeTask(tabKey, taskText);
      }
      closeTimerModal();
    });
  }

  if (notDoneBtn) {
    notDoneBtn.addEventListener("click", () => closeTimerModal());
  }

  if (addTimeBtn) {
    addTimeBtn.addEventListener("click", () => {
      const seconds = Number(addTimeSelect?.value ?? 300);
      const minutes = Math.max(1, Math.round(seconds / 60));
      addTimeMinutes(minutes);
      closeTimerModal();
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

  if (btn) btn.addEventListener("click", () => closePrizeModal());

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
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // localStorage may be unavailable in some environments; keep app usable
    console.warn("Could not save state:", e);
  }
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

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

  let total = 0;
  let done = 0;

  TAB_ORDER.forEach((tabKey) => {
    total += (TASKS_BY_TAB[tabKey] || []).length;
    done += (COMPLETED_TASKS[tabKey] || []).length;
  });

  if (completedCount) {
    completedCount.textContent = `${done}/${total}`;
  } else if (progressText) {
    progressText.textContent = `${done} / ${total} TASKS DONE`;
  }

  if (progressText) {
    progressText.setAttribute("aria-label", `${done} of ${total} tasks done`);
  }

  if (ring) {
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
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
      li.textContent = taskText;
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
    if (value === selectedFocusValue) li.classList.add("task--selected");

    li.innerHTML = `
      <label class="task-row">
        <input class="task-checkbox" type="checkbox" />
        <span class="task-text"></span>
      </label>
    `;

    // --- NEW: attach identifying data so inline editor can find and update this task ---
    const rowLabel = li.querySelector(".task-row");
    if (rowLabel) {
      rowLabel.dataset.tab = tabKey;
      rowLabel.dataset.task = taskText;
    }
    // -------------------------------------------------------------------------------

    li.querySelector(".task-text").textContent = taskText;
    taskList.appendChild(li);

    const checkbox = li.querySelector(".task-checkbox");

    // Prevent checkbox click from selecting the row
    checkbox.addEventListener("click", (event) => event.stopPropagation());

    // Click row selects CURRENT task
    li.addEventListener("click", () => {
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
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function setTimerDisplay(seconds) {
  const el = document.getElementById("timerDisplay");
  if (el) el.textContent = formatTime(seconds);
}

function getSelectedDurationSeconds() {
  const durationSelect = document.getElementById("durationSelect");
  const n = Number(durationSelect?.value ?? 900);
  return Number.isFinite(n) ? n : 900;
}

function resetTimerToSelectedDuration() {
  remainingSeconds = getSelectedDurationSeconds();
  setTimerDisplay(remainingSeconds);
}

function startCountdown() {
  if (!selectedFocusValue) {
    alert("Pick a task first. That becomes your CURRENT task.");
    return;
  }

  if (intervalId !== null) return;
  if (remainingSeconds <= 0) resetTimerToSelectedDuration();

  intervalId = setInterval(() => {
    remainingSeconds -= 1;
    setTimerDisplay(remainingSeconds);

    if (remainingSeconds <= 0) {
      stopInterval();
      remainingSeconds = 0;
      setTimerDisplay(0);
      const { taskText } = parseTaskValue(selectedFocusValue);
      openTimerModal(taskText);
    }
  }, 1000);
}

function addTimeMinutes(minutes) {
  const extra = Math.max(1, Number(minutes)) * 60;
  remainingSeconds = Math.max(0, remainingSeconds) + extra;
  setTimerDisplay(remainingSeconds);
  startCountdown();
}

function parseCustomDuration(input) {
  if (!input) return null;
  const trimmed = String(input).trim();

  if (trimmed.includes(":")) {
    const [mmStr, ssStr] = trimmed.split(":");
    const mm = Number(mmStr);
    const ss = Number(ssStr);
    if (!Number.isFinite(mm) || !Number.isFinite(ss)) return null;
    if (mm < 0 || ss < 0 || ss > 59) return null;
    return mm * 60 + ss;
  }

  const minutes = Number(trimmed);
  if (!Number.isFinite(minutes) || minutes <= 0) return null;
  return Math.round(minutes * 60);
}

function stopInterval() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function wireTimer() {
  const startBtn = document.getElementById("startBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const stopBtn = document.getElementById("stopBtn");
  const durationSelect = document.getElementById("durationSelect");
  const customHoursInput = document.getElementById("customHoursInput");
  const customMinutesInput = document.getElementById("customMinutesInput");

  if (!startBtn || !pauseBtn || !stopBtn || !durationSelect) {
    console.warn("Timer elements missing. Check IDs in index.html.");
    return;
  }

  resetTimerToSelectedDuration();

  durationSelect.addEventListener("change", () => {
    if (intervalId === null) resetTimerToSelectedDuration();
  });

  function applyCustomTimerStart() {
    if (!customHoursInput || !customMinutesInput) return;
    const hours = Number(customHoursInput.value || 0);
    const minutes = Number(customMinutesInput.value || 0);
    const seconds = Math.max(0, hours * 3600 + minutes * 60);
    if (seconds <= 0) return;
    stopInterval();
    remainingSeconds = seconds;
    setTimerDisplay(remainingSeconds);
    startCountdown();
  }

  if (customHoursInput) {
    customHoursInput.addEventListener("change", () => applyCustomTimerStart());
  }
  if (customMinutesInput) {
    customMinutesInput.addEventListener("change", () =>
      applyCustomTimerStart(),
    );
  }

  startBtn.addEventListener("click", () => startCountdown());

  pauseBtn.addEventListener("click", () => stopInterval());

  stopBtn.addEventListener("click", () => {
    stopInterval();
    resetTimerToSelectedDuration();
  });
}

/* -------------------------------
   Boot
-------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab");

  loadState();
  normalizeState();
  initTabCompleteLast();

  wirePrizeModalClose();
  wireTimerModal();
  wireResetButton(tabs);
  wireAddTaskForm();
  wireFocusPickers();
  wireTimer();

  // MAYBE TO DELETE LATER?

  document.addEventListener("DOMContentLoaded", () => {
    const element = document.querySelector("section#tasksCard");

    if (element) {
      const parallaxSpeed = 0.3; // Adjust this value for different speeds

      function updateParallax() {
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        const yPos = -(scrollTop - element.offsetTop) * parallaxSpeed;
        element.style.backgroundPosition = `center ${yPos}px`;
      }

      window.addEventListener("scroll", updateParallax);
      updateParallax(); // Set initial position
      console.log(
        "JavaScript parallax effect applied with dirty paper background.",
      );
    } else {
      console.warn(
        "Element section#tasksCard not found, parallax not applied.",
      );
    }
  });

  // Tab click behavior
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
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

  // Listen for inline edits from tasks-edit.js
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
});
