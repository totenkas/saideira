(() => {
  const section = document.getElementById("garrincha");
  const card = section?.querySelector("[data-flip-card]");

  if (!section || !card) {
    return;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function updateFlip() {
    const rect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight || 1;
    const start = viewportHeight * 0.5;
    const travel = Math.max(section.offsetHeight - viewportHeight, viewportHeight * 0.45);
    const rawProgress = clamp((start - rect.top) / travel, 0, 1);
    const hold = 0.16;
    const progress = rawProgress <= hold ? 0 : (rawProgress - hold) / (1 - hold);

    card.style.setProperty("--flip-progress", progress.toFixed(4));
  }

  updateFlip();
  window.addEventListener("scroll", updateFlip, { passive: true });
  window.addEventListener("resize", updateFlip);
})();
