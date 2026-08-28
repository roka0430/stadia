class Popup {
  constructor() {
    this.popups = {};
    this.context = null;
    this.resolve = null;
  }

  get popup() {
    return this.popups[this.context] ?? {};
  }

  register(context, { confirm, validate }) {
    this.popups[context] = { confirm, validate };
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
