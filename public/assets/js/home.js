document.addEventListener("alpine:init", () => {
  Alpine.data("category", () => ({
    isOpen: false,
  }));
});
