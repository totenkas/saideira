(() => {
  const sections = document.querySelectorAll(".reading-image-section");

  if (!sections.length) {
    return;
  }

  sections.forEach((section) => {
    const tilt = (Math.random() * 8 - 4).toFixed(2);
    section.style.setProperty("--reading-image-tilt", `${tilt}deg`);
  });
})();
