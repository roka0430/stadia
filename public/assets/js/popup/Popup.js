class Popup {
  constructor() {
    this.popups = {};
    this.stacks = [];
  }

  get current() {
    return this.stacks.at(-1) ?? null;
  }

  get context() {
    return this.current?.context ?? null;
  }

  get popup() {
    return this.popups[this.context] ?? {};
  }

  register(context, { title, confirm, type, validate }) {
    this.popups[context] = { title, confirm, type, validate };
  }

  open(context, metadata = null) {
    if (!this.popups[context]) {
      return null;
    }

    return new Promise((resolve) => {
      this.stacks.push({ context, metadata, resolve });
      this.notify();
    });
  }

  finish(action, content) {
    if (!this.current) {
      return;
    }

    this.current.resolve({ action, content });

    this.stacks.pop();
    this.notify();
  }

  notify() {
    document.dispatchEvent(new CustomEvent("popup-changed"));
  }
}

export default new Popup();
