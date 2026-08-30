import Popup from "./Popup.js";

export default () => ({
  context: null,
  title: "",
  confirm: "",
  type: "",
  validate: null,
  disable: true,

  get content() {
    return this.$refs.popupContents.querySelector(`.popup__content[data-content="${this.context}"]`);
  },

  init() {
    document.addEventListener("popup-changed", () => {
      this.context = Popup.context;
      this.title = Popup.popup.title;
      this.confirm = Popup.popup.confirm;
      this.type = Popup.popup.type;
      this.validate = Popup.popup.validate;
      this.disable = true;

      this.$nextTick(() => {
        this.input();
      });
    });
  },

  cancel() {
    Popup.finish(null, this.content);
  },

  action() {
    Popup.finish(true, this.content);
  },

  input() {
    if (this.context === null) {
      return;
    }

    if (this.validate === null) {
      this.disable = false;
      return;
    }

    this.disable = !this.validate(this.content);
  },
});
