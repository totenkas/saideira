(() => {
  const targets = document.querySelectorAll("i");
  const cursorCard = document.querySelector("[data-guardanapo]");
  const label = document.querySelector("[data-guardanapo-label]");

  if (!targets.length || !cursorCard || !label) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    return;
  }

  let active = false;

  function moveCard(event) {
    if (!active) {
      return;
    }

    const offsetX = 22;
    const offsetY = 18;
    cursorCard.style.transform = `translate(${event.clientX + offsetX}px, ${event.clientY + offsetY}px)`;
  }

  function showCard(event, text) {
    label.textContent = text;
    active = true;
    cursorCard.classList.add("is-visible");
    moveCard(event);
  }

  function hideCard() {
    active = false;
    cursorCard.classList.remove("is-visible");
  }

  for (const target of targets) {
    target.addEventListener("pointerenter", (event) => {
      const text = target.dataset.guardanapoText || target.textContent.trim();
      showCard(event, text);
    });

    target.addEventListener("pointermove", moveCard);
    target.addEventListener("pointerleave", hideCard);
    target.addEventListener("pointercancel", hideCard);
  }
})();
