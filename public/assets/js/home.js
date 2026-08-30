import Storage from "./stores/Storage.js";
import Category from "./stores/Category.js";

import Popup from "./popup/Popup.js";
import AlpinePopup from "./popup/AlpinePopup.js";

document.addEventListener("alpine:init", () => {
  Alpine.store("storage", Storage);
  Alpine.store("category", Category);

  Alpine.data("popup", AlpinePopup);

  Alpine.data("body", () => ({
    async init() {
      this.initPopup();
    },

    initPopup() {
      Popup.register("delete-record", {
        title: "学習記録の削除",
        confirm: "削除",
        type: "danger",
        validate: (content) => {
          return content.querySelector('input[type="checkbox"]').checked;
        },
      });

      Popup.register("exit-study", {
        title: "学習を終了する",
        confirm: "終了",
        type: "danger",
        validate: null,
      });

      Popup.register("record-study", {
        title: "学習を記録する",
        confirm: "記録",
        type: "success",
        validate: (content) => {
          const name = content.querySelector(".dropdown__current-name");
          return name !== null && name.textContent.trim() !== "";
        },
      });

      Popup.register("create-new-subject", {
        title: "新しい科目の作成",
        confirm: "作成",
        type: "success",
        validate: (content) => {
          return content.querySelector(".popup__input").value.trim() !== "";
        },
      });

      Popup.register("study-too-short", {
        title: "記録できません",
        confirm: "OK",
        type: "success",
        validate: null,
      });
    },
  }));

  Alpine.data("category", () => ({
    isOpen: false,

    async selectCategory(categoryId) {
      await this.$store.category.setCurrentCategory(categoryId);
      this.$store.storage.set("currentCategoryId", categoryId);
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

    get todayRecords() {
      return this.searchRecordsByDate(new Date());
    },

    searchRecordsByDate(date) {
      const dt = new Date(date);
      dt.setHours(0, 0, 0, 0);

      return this.$store.category.records.filter((record) => this.compareDate(new Date(record.date), dt));
    },

    get todayStudyData() {
      return this.calcTotalStudyData(this.todayRecords);
    },

    get totalStudyData() {
      return this.calcTotalStudyData(this.$store.category.records);
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

      for (const { name, time } of this.$store.category.currentCategory?.records ?? []) {
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
      const dates = this.$store.category.records.map(({ date }) => date);
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
      this.$store.storage.set("time", 0);
      this.$store.storage.set("isTimerPaused", false);
      this.$store.storage.set("isStudying", true);
    },

    async deleteRecord(recordId) {
      const res = await Popup.open("delete-record");

      if (!res.action) {
        return;
      }

      this.$store.category.deleteRecord(recordId);
    },
  }));

  Alpine.data("study", () => ({
    timeout: null,

    init() {
      if (this.isStudying && this.isTimerPaused && this.time === 0) {
        this.timerClose();
      }

      if (!this.isTimerPaused) {
        this.tick();
      }

      this.$watch("isTimerPaused", () => {
        if (!this.isTimerPaused && this.isStudying) {
          this.tick();
        }
      });
    },

    get isStudying() {
      return this.$store.storage.get("isStudying");
    },

    get isTimerPaused() {
      return this.$store.storage.get("isTimerPaused");
    },

    get time() {
      return this.$store.storage.get("time");
    },

    set isStudying(isStudying) {
      this.$store.storage.set("isStudying", isStudying);
    },

    set isTimerPaused(isTimerPaused) {
      this.$store.storage.set("isTimerPaused", isTimerPaused);
    },

    set time(time) {
      this.$store.storage.set("time", time);
    },

    get formattedTime() {
      const seconds = this.time ?? 0;

      return {
        hours: String(Math.floor(seconds / 3600)).padStart(2, "0"),
        minutes: String(Math.floor((seconds % 3600) / 60)).padStart(2, "0"),
        seconds: String(seconds % 60).padStart(2, "0"),
      };
    },

    async exitStudy() {
      if (this.time > 0) {
        const res = await Popup.open("exit-study");
        if (!res.action) {
          return;
        }
      }

      this.timerClose();
    },

    timerClose() {
      clearTimeout(this.timeout);
      this.time = 0;
      this.isTimerPaused = true;
      this.isStudying = false;
    },

    async recordStudy() {
      if (this.time < 60) {
        await Popup.open("study-too-short");
        return;
      }

      const res = await Popup.open("record-study");

      if (!res.action) {
        return;
      }

      const subjectName = res.content.querySelector(".dropdown__current-name").textContent;

      await this.$store.category.recordStudy(subjectName, this.time);

      this.timerClose();
    },

    toggleTimer() {
      this.isTimerPaused = !this.isTimerPaused;

      if (this.isTimerPaused) {
        clearTimeout(this.timeout);
      }
    },

    tick() {
      if (this.isTimerPaused || !this.isStudying) {
        return;
      }

      this.timeout = setTimeout(() => {
        this.time++;
        this.tick();
      }, 1000);
    },
  }));

  Alpine.data("popupRecordStudy", () => ({
    isOpen: false,
    selectedSubjectName: null,

    init() {
      document.addEventListener("popup-changed", () => {
        if (Popup.context === "record-study") {
          this.selectedSubjectName = null;
        }
      });
    },

    selectSubject(subjectName) {
      this.selectedSubjectName = subjectName;
      this.isOpen = false;

      this.$nextTick(() => {
        this.$el.dispatchEvent(new Event("input", { bubbles: true }));
      });
    },

    async createNewSubject() {
      const res = await Popup.open("create-new-subject");

      if (!res.action) {
        return;
      }

      this.selectedSubjectName = res.content.querySelector(".popup__input").value;
    },
  }));
});
