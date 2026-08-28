import Popup from "./Popup.js";

export default () => ({
  init() {
    console.log(Popup.popups);
  },

  open() {
    return new Promise((resolve) => {
      resolve({
        action: null,
        content: null,
      });
    });
  },
});
