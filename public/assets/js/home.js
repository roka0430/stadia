const STORAGE_KEYS = {
  CURRENT_CATEGORY_ID: "stadia:current_category_id",
  IS_STUDYING: "stadia:is_studying",
};

const STORAGE_DEFAULT = {
  [STORAGE_KEYS.CURRENT_CATEGORY_ID]: null,
  [STORAGE_KEYS.IS_STUDYING]: false,
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
      this.sortRecords();
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

    sortRecords() {
      this.currentCategory.records.sort((a, b) => new Date(b.date) - new Date(a.date));
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
    compareDate(dt1, dt2) {
      return (
        dt1.getFullYear() === dt2.getFullYear() && dt1.getMonth() === dt2.getMonth() && dt1.getDate() === dt2.getDate()
      );
    },

    isToday(dt) {
      return this.compareDate(dt, new Date());
    },

    get records() {
      if (this.currentCategory === null) {
        return [];
      }

      return this.currentCategory.records;
    },

    get todayRecords() {
      return this.searchRecordsByDate(new Date());
    },

    searchRecordsByDate(date) {
      const dt = new Date(date);
      dt.setHours(0, 0, 0, 0);

      return this.records.filter((record) => this.compareDate(new Date(record.date), dt));
    },

    get subjectNames() {
      const names = this.records.map(({ name }) => name);
      return [...new Set(names)];
    },

    get todayStudyData() {
      return this.calcTotalStudyData(this.todayRecords);
    },

    get totalStudyData() {
      return this.calcTotalStudyData(this.records);
    },

    calcTotalStudyData(records) {
      const seconds = records.reduce((sum, { time }) => sum + time, 0);
      return this.calcStudyData(seconds);
    },

    calcStudyData(seconds) {
      const minutes = Math.floor((seconds % 3600) / 60);
      const hours = Math.floor(seconds / 3600);

      return {
        seconds: seconds,
        minutes: minutes,
        hours: hours,
        string: this.formatStudyTime(hours, minutes),
      };
    },

    formatStudyTime(hours, minutes) {
      if (hours === 0) {
        return `${minutes}m`;
      }

      if (minutes === 0) {
        return `${hours}h`;
      }

      return `${hours}h${minutes}m`;
    },

    calcPercent(numerator, denominator) {
      return denominator === 0 ? this.formatPercent(0) : this.formatPercent(numerator / denominator);
    },

    formatPercent(value) {
      return `${(value * 100).toFixed(1)}%`;
    },

    get subjectStudyData() {
      const studyData = {};

      for (const { name, time } of this.currentCategory?.records ?? []) {
        studyData[name] = (studyData[name] ?? 0) + time;
      }

      for (const key of Object.keys(studyData)) {
        studyData[key] = this.calcStudyData(studyData[key]);
      }

      return studyData;
    },

    get sortedSubjectStudyData() {
      const entries = Object.entries(this.subjectStudyData);
      return entries.sort(([, { seconds: timeA }], [, { seconds: timeB }]) => timeB - timeA);
    },

    getRecordsByPastDays(days) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return Array.from({ length: days }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        return {
          date,
          records: this.searchRecordsByDate(date),
        };
      });
    },

    getStudyDataByPastDays(days) {
      const records = this.getRecordsByPastDays(days);

      for (const record of records) {
        record.data = this.calcTotalStudyData(record.records);
        delete record.records;
      }

      return records;
    },

    get studyDates() {
      const dates = this.records.map(({ date }) => date);
      return [...new Set(dates)];
    },

    formatDate(date, format) {
      const dt = new Date(date);

      const values = {
        YYYY: dt.getFullYear(),
        YY: String(dt.getFullYear()).slice(-2),

        MM: String(dt.getMonth() + 1).padStart(2, "0"),
        M: dt.getMonth() + 1,

        DD: String(dt.getDate()).padStart(2, "0"),
        D: dt.getDate(),

        HH: String(dt.getHours()).padStart(2, "0"),
        H: dt.getHours(),

        mm: String(dt.getMinutes()).padStart(2, "0"),
        m: dt.getMinutes(),

        ss: String(dt.getSeconds()).padStart(2, "0"),
        s: dt.getSeconds(),
      };

      return format.replace(/YYYY|YY|MM|M|DD|D|HH|H|mm|m|ss|s/g, (token) => values[token]);
    },

    startStudy() {
      this.storage[STORAGE_KEYS.IS_STUDYING] = true;
    },
  }));

  Alpine.data("study", () => ({
    get isStudying() {
      return this.storage?.[STORAGE_KEYS.IS_STUDYING];
    },

    exitStudy() {
      this.storage[STORAGE_KEYS.IS_STUDYING] = false;
    },

    recordStudy() {
      console.log("record");
    },
  }));
});
