(() => {
  const portaConta = document.querySelector(".receipt-stage");
  const receipt = document.querySelector(".receipt");
  const modal = document.getElementById("receipt-modal");
  const modalContent = document.getElementById("receipt-modal-content");
  const receiptTemplate = document.getElementById("receipt-template");
  const closeTargets = document.querySelectorAll("[data-receipt-close]");

  if (!receipt || !modal || !modalContent || !receiptTemplate) {
    return;
  }

  function openModal() {
    modalContent.innerHTML = receiptTemplate.innerHTML;
    const title = modalContent.querySelector(".receipt-title");
    if (title) {
      title.id = "receipt-modal-title";
    }
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  portaConta.addEventListener("click", openModal);

  closeTargets.forEach((target) => {
    target.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) {
      closeModal();
    }
  });
})();
