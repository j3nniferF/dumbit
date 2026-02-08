// Lightweight GIF-only prize enhancer using the provided GIF (no API key, no Bored API)
console.log("tasks-edit.js loaded");

// Use the specific GIPHY asset you provided (direct media URL avoids API calls)
const PRIZE_GIF_URL =
  "https://media.giphy.com/media/uF4QwYRpMDuGuMXL1G/giphy.gif";

/**
 * Insert the provided GIF into the prize modal.
 */
async function showPrizeSuggestion() {
  console.log("showPrizeSuggestion() running (GIF-only)");
  const prizeModal = document.getElementById("prizeModal");
  if (!prizeModal) return;

  // remove any existing gif
  const existing = prizeModal.querySelector(".prize-gif");
  if (existing) existing.remove();

  const img = document.createElement("img");
  img.className = "prize-gif";
  img.src = PRIZE_GIF_URL;
  img.alt = "Celebration GIF";
  img.style.maxWidth = "320px";
  img.style.width = "100%";
  img.style.display = "block";
  img.style.margin = "12px auto 0";

  // insert before the prize list if present, otherwise append
  const prizeList = prizeModal.querySelector("#prizeList");
  if (prizeList) prizeModal.insertBefore(img, prizeList);
  else prizeModal.appendChild(img);
}

// Observe the prize overlay and run when it becomes visible
(function observePrizeOverlay() {
  const overlay = document.getElementById("prizeOverlay");
  if (!overlay) return;

  const mo = new MutationObserver(() => {
    const isHidden = overlay.classList.contains("is-hidden");
    if (!isHidden) showPrizeSuggestion();
  });

  mo.observe(overlay, { attributes: true, attributeFilter: ["class"] });
})();

// Expose for manual testing from the console
window.showPrizeSuggestion = showPrizeSuggestion;

/* DEBUG + ENSURE TITLE (auto-fix invisible/empty header) */
function ensureAndStyleTitle() {
  const header = document.getElementById("header");
  let title = header && header.querySelector(".title");

  // create header/title if missing
  if (!header) {
    console.warn("Header element missing — creating one.");
    const layout = document.getElementById("layout") || document.body;
    const h = document.createElement("header");
    h.id = "header";
    h.className = "header";
    layout.insertBefore(h, layout.firstChild);
  }

  title = document.getElementById("header").querySelector(".title");
  if (!title) {
    const h1 = document.createElement("h1");
    h1.className = "title";
    h1.setAttribute("role", "banner");
    h1.setAttribute("aria-label", "site title");
    h1.innerHTML =
      '<span class="title-line">DUMB SHIT</span><span class="title-line">I GOTTA DO TODAY</span>';
    document.getElementById("header").appendChild(h1);
    title = h1;
    console.info("Inserted missing title markup.");
  }

  // Force inline styles so CSS cascade / specificity issues won't hide it
  Object.assign(title.style, {
    display: "block",
    textAlign: "center",
    zIndex: "999",
    color: "#efe7d6",
    fontFamily:
      'var(--font-punk), "HitMePunk04", "Bangers", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
    margin: "0.25rem 0 0.75rem",
  });

  // make sure each line looks like a paper pill
  title.querySelectorAll(".title-line").forEach((el) => {
    Object.assign(el.style, {
      display: "inline-block",
      padding: "6px 14px",
      margin: "0 0 8px",
      background: "rgba(239,231,214,0.95)",
      color: "#111",
      borderRadius: "2px",
    });
  });
}

// Diagnostic helper to run from the console if still not visible:
// showTitleDiagnostics()
function showTitleDiagnostics() {
  const title = document.querySelector(".title");
  console.log("title element:", title);
  if (!title) return;
  const cs = window.getComputedStyle(title);
  console.log("computed font-family:", cs.fontFamily);
  console.log(
    "display:",
    cs.display,
    "visibility:",
    cs.visibility,
    "opacity:",
    cs.opacity,
  );
  // check whether local @font-face is loaded
  if (document.fonts && document.fonts.check) {
    console.log(
      'fonts.check("12px HitMePunk04") ->',
      document.fonts.check('12px "HitMePunk04"'),
    );
    document.fonts.ready.then(() => {
      console.log(
        "document.fonts.ready resolved; loaded fonts:",
        document.fonts,
      );
    });
  } else {
    console.warn("document.fonts API not available in this browser.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  showPrizeSuggestion();
  ensureAndStyleTitle();
  // leave diagnostics available to run manually
  window.showTitleDiagnostics = showTitleDiagnostics;
});
