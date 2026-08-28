class Popup {
  constructor() {
    this.popups = {};
    this.context = null;
    this.resolve = null;
  }

  get popup() {
    return this.popups[this.context] ?? {};
  }

  register(context, { title, confirm, type, validate }) {
    this.popups[context] = { title, confirm, type, validate };
  }

  open(context) {
    if (!this.popups[context]) {
      return null;
    }

    this.context = context;
    this.notify();

    return new Promise((resolve) => {
      this.resolve = resolve;
    });
  }

  close() {
    this.context = null;
    this.notify();
  }

  finish(action, content) {
    if (this.resolve) {
      this.resolve({ action, content });
    }

    this.resolve = null;
    this.close();
  }

  notify() {
    document.dispatchEvent(new CustomEvent("popup-changed"));
  }
}

export default new Popup();
