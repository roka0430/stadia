import Popup from "./Popup.js";

export default () => ({
  context: null,
  title: "",
  confirm: "",
  type: "",
  validate: null,
  disable: true,

  get content() {
    return document.querySelector(`.popup__content[data-content="${this.context}"]`);
  },

  init() {
    document.addEventListener("popup-changed", () => {
      this.context = Popup.context;
      this.title = Popup.popup.title;
      this.confirm = Popup.popup.confirm;
      this.type = Popup.popup.type;
      this.validate = Popup.popup.validate;
      this.disable = this.validate === null ? false : true;
    });
  },

  cancel() {
    Popup.finish(null, this.content);
  },

  action() {
    Popup.finish(true, this.content);
  },

  input() {
    if (this.validate === null) {
      return;
    }

    this.disable = !this.validate(this.content);
  },
});
