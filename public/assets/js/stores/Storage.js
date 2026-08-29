const STORAGE = {
  currentCategoryId: {
    key: "stadia:current_category_id",
    default: null,
  },

  isStudying: {
    key: "stadia:is_studying",
    default: false,
  },

  isTimerPaused: {
    key: "stadia:is_timer_paused",
    default: true,
  },

  time: {
    key: "stadia:time",
    default: 0,
  },
};

const load = () => {
  const data = {};

  for (const [name, { key, default: defaultValue }] of Object.entries(STORAGE)) {
    const value = localStorage.getItem(key);
    data[name] = value === null ? defaultValue : JSON.parse(value);
  }

  return data;
};

const save = (data) => {
  for (const [name, value] of Object.entries(data)) {
    const { key } = STORAGE[name];
    localStorage.setItem(key, JSON.stringify(value));
  }
};

export default {
  data: {},

  init() {
    this.data = load();
  },

  get(name) {
    return this.data[name];
  },

  set(name, value) {
    this.data[name] = value;
    save(this.data);
  },
};
