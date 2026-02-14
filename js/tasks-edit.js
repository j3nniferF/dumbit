// Lightweight GIF-only prize enhancer using the provided GIF (no API key, no Bored API)
console.log("tasks-edit.js loaded");

const PRIZE_GIF_URL_SHIT =
  "https://media.giphy.com/media/uF4QwYRpMDuGuMXL1G/giphy.gif";
const PRIZE_GIF_URL_PG =
  "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExbHBybnhveG4wdnRodGg2MnJ1NWhxNmxzcWV5Zm4weDcyZGFqMDV1cyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/75mBr8CLHect4tHlMb/giphy.gif";

function getModePrizeGifUrl() {
  return document.body.classList.contains("pg-mode")
    ? PRIZE_GIF_URL_PG
    : PRIZE_GIF_URL_SHIT;
}

/**
 * Insert the provided GIF into the prize modal (deferred load).
 */
async function showPrizeSuggestion() {
  console.log("showPrizeSuggestion() running (GIF-only, deferred)");

  const prizeModal = document.getElementById("prizeModal");
  if (!prizeModal) return;

  // remove any existing gif
  const existing = prizeModal.querySelector(".prize-gif");
  if (existing) existing.remove();

  // create image but DON'T set src yet — avoids fetching until shown
  const img = document.createElement("img");
  img.className = "prize-gif";
  img.alt = "Celebration GIF";
  img.loading = "lazy"; // hint to browser
  img.decoding = "async";
  img.style.maxWidth = "320px";
  img.style.width = "100%";
  img.style.display = "block";
  img.style.margin = "12px auto 0";
  // store the URL but don't assign .src until modal is visible
  img.dataset.src = getModePrizeGifUrl();

  const prizeList = prizeModal.querySelector("#prizeList");
  const prizeNote = prizeModal.querySelector(".prize-note");
  if (prizeNote) prizeModal.insertBefore(img, prizeNote);
  else if (prizeList) prizeList.insertAdjacentElement("afterend", img);
  else prizeModal.appendChild(img);

  // If the modal is already visible, trigger the actual load immediately
  const isVisible = !prizeModal
    .closest(".modal-overlay")
    ?.classList?.contains("is-hidden");
  if (isVisible) {
    img.src = img.dataset.src;
  } else {
    // otherwise, set it when the modal becomes visible (guard against multiple observers)
    const overlay =
      document.getElementById("prizeOverlay") ||
      prizeModal.closest(".modal-overlay");
    if (overlay) {
      const onAttr = () => {
        if (!overlay.classList.contains("is-hidden")) {
          if (!img.src) img.src = img.dataset.src;
          mo.disconnect();
        }
      };
      const mo = new MutationObserver(onAttr);
      mo.observe(overlay, { attributes: true, attributeFilter: ["class"] });
    }
  }
}

/* Insert a short prize chime (WebAudio) and call it when the prize modal appears */
function playPrizeSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    // reuse single AudioContext for subsequent plays
    const ctx = (window._prizeAudioCtx =
      window._prizeAudioCtx || new AudioCtx());
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0, now);

    // small arpeggio/chime
    const freqs = [880, 1320, 1760];
    freqs.forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(f, now + i * 0.07);
      o.connect(gain);
      o.start(now + i * 0.07);
      o.stop(now + i * 0.07 + 0.16);
    });

    // simple envelope
    gain.gain.linearRampToValueAtTime(0.9, now + 0.02);
    gain.gain.linearRampToValueAtTime(0.0, now + freqs.length * 0.07 + 0.18);
  } catch (err) {
    console.warn("Prize sound failed:", err);
  }
}

/* Call the chime whenever the prize overlay becomes visible */
(function observePrizeOverlay() {
  const overlay = document.getElementById("prizeOverlay");
  if (!overlay) return;

  const mo = new MutationObserver(() => {
    const isHidden = overlay.classList.contains("is-hidden");
    if (!isHidden) {
      // play sound and show GIF/suggestion
      try {
        // resume audio context on user gesture if needed
        if (
          window._prizeAudioCtx &&
          window._prizeAudioCtx.state === "suspended"
        ) {
          window._prizeAudioCtx.resume().catch(() => {});
        }
      } catch (e) {}
      playPrizeSound();
      if (typeof showPrizeSuggestion === "function") showPrizeSuggestion();
    }
  });

  mo.observe(overlay, { attributes: true, attributeFilter: ["class"] });
})();

// Expose for manual testing from the console
window.showPrizeSuggestion = showPrizeSuggestion;
