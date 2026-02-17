/* =====================================================
   STATS PAGE - NASA APOD API & Task Statistics
   Features:
   - API Integration: NASA Astronomy Picture of the Day
   - Date calculations: Days until deadline
   - Data analysis: Task statistics from localStorage
   - Input validation: Date validation
   ===================================================== */

const STORAGE_KEY_SHIT = "dsigdt_state_shit_v1";
const STORAGE_KEY_PG = "dsigdt_state_pg_v1";
const NASA_APOD_API = "https://api.nasa.gov/planetary/apod";
const NASA_API_KEY = "DEMO_KEY"; // Free demo key, no registration needed

// Current date for APOD
let currentApodDate = new Date();

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  loadApod();
  loadTaskStats();
  setupEventListeners();
});

function setupEventListeners() {
  const retryBtn = document.getElementById("retryBtn");
  const prevDayBtn = document.getElementById("prevDayBtn");
  const nextDayBtn = document.getElementById("nextDayBtn");
  const setDeadlineBtn = document.getElementById("setDeadlineBtn");

  if (retryBtn) {
    retryBtn.addEventListener("click", () => loadApod());
  }

  if (prevDayBtn) {
    prevDayBtn.addEventListener("click", () => changeApodDate(-1));
  }

  if (nextDayBtn) {
    nextDayBtn.addEventListener("click", () => changeApodDate(1));
  }

  if (setDeadlineBtn) {
    setDeadlineBtn.addEventListener("click", () => calculateDeadline());
  }
}

/* =====================================================
   NASA APOD API INTEGRATION
   ===================================================== */

async function loadApod(date = null) {
  const loadingEl = document.getElementById("apodLoading");
  const errorEl = document.getElementById("apodError");
  const contentEl = document.getElementById("apodContent");

  // Show loading, hide error and content
  loadingEl.classList.remove("is-hidden");
  errorEl.classList.add("is-hidden");
  contentEl.classList.add("is-hidden");

  try {
    // Build API URL with date parameter if provided
    let apiUrl = `${NASA_APOD_API}?api_key=${NASA_API_KEY}`;
    
    if (date) {
      const dateStr = formatDateForApi(date);
      apiUrl += `&date=${dateStr}`;
    }

    console.log("Fetching NASA APOD from:", apiUrl);

    // Fetch data from NASA API
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("NASA APOD data:", data);

    // Display the data
    displayApod(data);

    // Hide loading, show content
    loadingEl.classList.add("is-hidden");
    contentEl.classList.remove("is-hidden");

  } catch (error) {
    console.error("Error fetching NASA APOD:", error);
    
    // Hide loading, show error
    loadingEl.classList.add("is-hidden");
    errorEl.classList.remove("is-hidden");
  }
}

function displayApod(data) {
  const dateEl = document.getElementById("apodDate");
  const titleEl = document.getElementById("apodTitle");
  const imageEl = document.getElementById("apodImage");
  const videoEl = document.getElementById("apodVideo");
  const explanationEl = document.getElementById("apodExplanation");
  const copyrightEl = document.getElementById("apodCopyright");

  // Set date
  if (dateEl && data.date) {
    dateEl.textContent = formatDateDisplay(data.date);
  }

  // Set title
  if (titleEl && data.title) {
    titleEl.textContent = data.title;
  }

  // Set media (image or video)
  if (data.media_type === "video") {
    if (imageEl) imageEl.classList.add("is-hidden");
    if (videoEl) {
      videoEl.src = data.url;
      videoEl.classList.remove("is-hidden");
    }
  } else {
    if (videoEl) videoEl.classList.add("is-hidden");
    if (imageEl) {
      imageEl.src = data.url;
      imageEl.alt = data.title || "Astronomy Picture";
      imageEl.classList.remove("is-hidden");
    }
  }

  // Set explanation
  if (explanationEl && data.explanation) {
    explanationEl.textContent = data.explanation;
  }

  // Set copyright if available
  if (copyrightEl) {
    if (data.copyright) {
      copyrightEl.textContent = `© ${data.copyright}`;
      copyrightEl.classList.remove("is-hidden");
    } else {
      copyrightEl.classList.add("is-hidden");
    }
  }

  // Update button states
  updateNavigationButtons();
}

function changeApodDate(dayOffset) {
  currentApodDate.setDate(currentApodDate.getDate() + dayOffset);
  loadApod(currentApodDate);
}

function updateNavigationButtons() {
  const nextDayBtn = document.getElementById("nextDayBtn");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const currentDate = new Date(currentApodDate);
  currentDate.setHours(0, 0, 0, 0);

  // Disable "Next Day" if we're at today
  if (nextDayBtn) {
    if (currentDate >= today) {
      nextDayBtn.disabled = true;
      nextDayBtn.style.opacity = "0.5";
      nextDayBtn.style.cursor = "not-allowed";
    } else {
      nextDayBtn.disabled = false;
      nextDayBtn.style.opacity = "1";
      nextDayBtn.style.cursor = "pointer";
    }
  }
}

function formatDateForApi(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateDisplay(dateStr) {
  const date = new Date(dateStr + "T00:00:00");
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

/* =====================================================
   TASK STATISTICS (Data Analysis Feature)
   ===================================================== */

function loadTaskStats() {
  // Load both modes and combine stats
  const shitState = loadState(STORAGE_KEY_SHIT);
  const pgState = loadState(STORAGE_KEY_PG);

  const allTasks = getAllTasks(shitState, pgState);
  const completedTasks = getCompletedTasks(shitState, pgState);
  const remainingTasks = allTasks - completedTasks;
  const completionRate = allTasks > 0 ? Math.round((completedTasks / allTasks) * 100) : 0;

  // Update stats display
  updateStatValue("totalTasksValue", allTasks);
  updateStatValue("completedTasksValue", completedTasks);
  updateStatValue("remainingTasksValue", remainingTasks);
  updateStatValue("completionRateValue", `${completionRate}%`);
}

function loadState(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error loading state:", e);
    return null;
  }
}

function getAllTasks(shitState, pgState) {
  let total = 0;
  
  if (shitState && shitState.tabsData) {
    Object.values(shitState.tabsData).forEach(tab => {
      if (tab.tasks) {
        total += tab.tasks.length;
      }
    });
  }
  
  if (pgState && pgState.tabsData) {
    Object.values(pgState.tabsData).forEach(tab => {
      if (tab.tasks) {
        total += tab.tasks.length;
      }
    });
  }
  
  return total;
}

function getCompletedTasks(shitState, pgState) {
  let completed = 0;
  
  if (shitState && shitState.tabsData) {
    Object.values(shitState.tabsData).forEach(tab => {
      if (tab.tasks) {
        completed += tab.tasks.filter(task => task.done).length;
      }
    });
  }
  
  if (pgState && pgState.tabsData) {
    Object.values(pgState.tabsData).forEach(tab => {
      if (tab.tasks) {
        completed += tab.tasks.filter(task => task.done).length;
      }
    });
  }
  
  return completed;
}

function updateStatValue(elementId, value) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = value;
  }
}

/* =====================================================
   DATE CALCULATION FEATURE
   Calculate days until deadline
   ===================================================== */

function calculateDeadline() {
  const deadlineInput = document.getElementById("deadlineInput");
  const countdownDisplay = document.getElementById("countdownDisplay");
  const countdownValue = document.getElementById("countdownValue");

  if (!deadlineInput || !deadlineInput.value) {
    alert("Please select a deadline date!");
    return;
  }

  // Validate input: deadline must be in the future
  const deadline = new Date(deadlineInput.value + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (deadline < today) {
    alert("Deadline must be in the future!");
    return;
  }

  // Calculate days remaining
  const timeDiff = deadline.getTime() - today.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  // Display countdown
  if (countdownValue) {
    countdownValue.textContent = daysRemaining;
  }

  if (countdownDisplay) {
    countdownDisplay.classList.remove("is-hidden");
  }

  // Save to localStorage for persistence
  localStorage.setItem("taskDeadline", deadlineInput.value);
  localStorage.setItem("taskDaysRemaining", daysRemaining);
}

// Load saved deadline on page load
function loadSavedDeadline() {
  const savedDeadline = localStorage.getItem("taskDeadline");
  const deadlineInput = document.getElementById("deadlineInput");
  
  if (savedDeadline && deadlineInput) {
    deadlineInput.value = savedDeadline;
    calculateDeadline();
  }
}

// Call this after DOM is loaded
setTimeout(loadSavedDeadline, 100);
