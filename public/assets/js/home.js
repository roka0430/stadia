const STORAGE_KEYS = {
  CURRENT_CATEGORY_ID: "stadia:current_category_id",
};

const STORAGE_DEFAULT = {
  [STORAGE_KEYS.CURRENT_CATEGORY_ID]: null,
};

document.addEventListener("alpine:init", () => {
  Alpine.data("body", () => ({
    storage: {},
    categories: [],
    currentCategory: null,

    async init() {
      this.storage = this.loadLocalStorage();

      this.$watch("storage", () => {
        this.saveLocalStorage(this.storage);
      });

      this.categories = await this.loadCategories();

      if (this.categories.length === 0) {
        console.log("no-category");
        return;
      }

      await this.initCurrentCategory();
    },

    loadLocalStorage() {
      const storage = {};
      for (const key of Object.keys(STORAGE_DEFAULT)) {
        const value = localStorage.getItem(key);

        if (value === null) {
          storage[key] = STORAGE_DEFAULT[key];
          continue;
        }

        storage[key] = JSON.parse(value);
      }

      return storage;
    },

    saveLocalStorage(data) {
      for (const [key, value] of Object.entries(data)) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    },

    async loadCategories() {
      const res = await fetch("/api/category");

      if (!res.ok) {
        throw new Error("failed to load categories.");
      }

      return await res.json();
    },

    async loadCategory(categoryId) {
      const res = await fetch(`/api/category/${categoryId}`);

      if (!res.ok) {
        throw new Error("failed to load category.");
      }

      return await res.json();
    },

    async initCurrentCategory() {
      let categoryId = this.storage[STORAGE_KEYS.CURRENT_CATEGORY_ID];

      const isValid = this.categories.some((category) => category.id === categoryId);
      if (!isValid) {
        categoryId = this.categories[0]?.id ?? null;
        this.storage[STORAGE_KEYS.CURRENT_CATEGORY_ID] = categoryId;
      }

      if (categoryId === null) {
        this.currentCategory = null;
        return;
      }

      this.currentCategory = await this.loadCategory(categoryId);
    },
  }));

  Alpine.data("category", () => ({
    isOpen: false,

    async selectCategory(categoryId) {
      this.currentCategory = await this.loadCategory(categoryId);
      this.storage[STORAGE_KEYS.CURRENT_CATEGORY_ID] = categoryId;
      this.isOpen = false;
    },
  }));

  Alpine.data("home", () => ({
    get records() {
      if (this.currentCategory === null) {
        return [];
      }

      return this.currentCategory.records;
    },

    get subjectNames() {
      const names = this.records.map(({ name }) => name);
      return [...new Set(names)];
    },

    get totalStudyTime() {
      return this.records.reduce((sum, { time }) => sum + time, 0);
    },

    get subjectStudyTime() {
      const studyTimes = {};

      for (const { name, time } of this.currentCategory?.records ?? []) {
        studyTimes[name] = (studyTimes[name] ?? 0) + time;
      }

      return studyTimes;
    },

    get sortedSubjectStudyTime() {
      const entries = Object.entries(this.subjectStudyTime);
      return entries.sort(([, timeA], [, timeB]) => timeB - timeA);
    },

    get studyDates() {
      const dates = this.records.map(({ date }) => date);
      return [...new Set(dates)];
    },

    formatStudyTime(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);

      if (hours === 0) {
        return `${minutes}分`;
      }

      if (minutes === 0) {
        return `${hours}時間`;
      }

      return `${hours}時間${minutes}分`;
    },

    calcPercent(numerator, denominator) {
      if (denominator === 0) {
        return 0;
      }

      return numerator / denominator;
    },

    formatPercent(value) {
      return `${(value * 100).toFixed(1)}%`;
    },
  }));
});
