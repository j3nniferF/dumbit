// Debuggable inline editor with document-level fallback delegate
console.log("tasks-edit: file loaded (fallback)");

document.addEventListener("DOMContentLoaded", () => {
  console.log("tasks-edit: DOMContentLoaded");
  const list = document.querySelector(".task-list");

  function setCaretToEnd(el) {
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function saveEdit(textEl) {
    const row = textEl.closest(".task-row");
    if (!row) return;

    const originalText =
      row.dataset.task ?? textEl.dataset.original ?? textEl.textContent;
    const newText = textEl.textContent.trim();

    textEl.contentEditable = "false";
    row.classList.remove("editing");

    if (row.dataset.tab) row.dataset.task = newText;

    const evt = new CustomEvent("task:edited", {
      detail: {
        tabKey: row.dataset.tab ?? null,
        originalText: originalText ?? null,
        newText,
        row,
      },
      bubbles: true,
    });
    console.debug("tasks-edit: dispatching task:edited", evt.detail);
    document.dispatchEvent(evt);
  }

  function beginEditForRow(row) {
    const textEl = row.querySelector(".task-text");
    if (!textEl) return;
    textEl.dataset.original = textEl.textContent;
    textEl.contentEditable = "true";
    row.classList.add("editing");
    setCaretToEnd(textEl);
    textEl.focus();

    function onKey(ev) {
      if (ev.key === "Enter") {
        ev.preventDefault();
        textEl.blur();
      } else if (ev.key === "Escape") {
        textEl.textContent = textEl.dataset.original || textEl.textContent;
        textEl.blur();
      }
    }
    function onBlur() {
      saveEdit(textEl);
      textEl.removeEventListener("keydown", onKey);
      textEl.removeEventListener("blur", onBlur);
      delete textEl.dataset.original;
    }
    textEl.addEventListener("keydown", onKey);
    textEl.addEventListener("blur", onBlur);
  }

  // Attach delegate to the list (preferred) if present
  if (list) {
    list.addEventListener("dblclick", (e) => {
      const row = e.target.closest(".task-row");
      if (!row) return;
      beginEditForRow(row);
    });
  }

  // NEW: click on edit button -> start editing (more reliable)
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".task-edit-btn");
    if (!btn) return;
    const row = btn.closest(".task-row");
    if (!row) return;
    beginEditForRow(row);
  });

  // Fallback: also listen at document level but only handle events inside .task-list
  document.addEventListener("dblclick", (e) => {
    if (!e.target.closest(".task-list")) return;
    console.debug("tasks-edit: document dblclick (fallback) ", {
      target: e.target.tagName,
      className: e.target.className,
    });
    handleDblclickEvent(e);
  });

  // Small helper to verify rows exist quickly from console
  window.__tasksEditDiagnostics = {
    hasTaskList: !!document.querySelector(".task-list"),
    taskRowCount: () => document.querySelectorAll(".task-row").length,
    sampleRowHTML: () => {
      const r = document.querySelector(".task-row");
      return r ? r.outerHTML : null;
    },
  };
});
