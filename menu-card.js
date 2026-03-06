(() => {
  const card = document.querySelector("[data-tilt-card]");
  if (!card) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touchOnly = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  if (prefersReducedMotion || touchOnly) {
    return;
  }

  const MAX_TILT = 7;

  function onMove(event) {
    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;

    const rx = (0.5 - py) * MAX_TILT;
    const ry = (px - 0.5) * MAX_TILT;

    card.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(0)`;
    card.style.setProperty("--glare-opacity", "1");
  }

  function resetTilt() {
    card.style.transform = "rotateX(0deg) rotateY(0deg) translateZ(0)";
    card.style.setProperty("--glare-opacity", "0");
  }

  card.addEventListener("pointermove", onMove);
  card.addEventListener("pointerleave", resetTilt);
  card.addEventListener("pointercancel", resetTilt);
})();
