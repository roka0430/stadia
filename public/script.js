document.addEventListener("alpine:init", () => {
  Alpine.data("body", () => ({
    overlayId: null,
    studyHours: {
      today: 10,
      period: 20,
    },

    overlayCloseHandler: {
      overlay1: () => {
        return true;
      },
      overlay2: () => {
        return true;
      },
      overlay3: () => {
        return true;
      },
    },

    closeOverlay() {
      const handler = this.overlayCloseHandler[this.overlayId];
      if (handler && handler() === false) return;
      this.overlayId = null;
    },
  }));
});
