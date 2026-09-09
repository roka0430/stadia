import Storage from "./stores/Storage.js";
import Category from "./stores/Category.js";
import Popup from "./popup/Popup.js";
import AlpinePopup from "./popup/AlpinePopup.js";

document.addEventListener("alpine:init", () => {
  Alpine.store("storage", Storage);
  Alpine.store("category", Category);
  Alpine.data("popup", AlpinePopup);

  const validateName = (content) => content.querySelector(".popup__input")?.value.trim() !== "";

  Popup.register("new-category", {
    title: "カテゴリの新規作成",
    confirm: "作成",
    type: "success",
    validate: validateName,
  });

  Popup.register("edit-category", {
    title: "カテゴリ名を編集",
    confirm: "保存",
    type: "success",
    validate: validateName,
  });

  Popup.register("delete-category", {
    title: "カテゴリを削除",
    confirm: "削除",
    type: "danger",
    validate: (content) => content.querySelector('input[type="checkbox"]')?.checked === true,
  });

  Alpine.data("popupCategoryName", () => ({
    name: "",

    init() {
      this.listener = () => this.resetName();
      document.addEventListener("popup-changed", this.listener);
      this.resetName();
    },

    destroy() {
      document.removeEventListener("popup-changed", this.listener);
    },

    resetName() {
      if (Popup.context === "new-category") {
        this.name = "";
        return;
      }

      if (Popup.context === "edit-category") {
        const categoryId = Popup.current.metadata?.categoryId;
        this.name = this.$store.category.categories.find((category) => category.id === categoryId)?.name ?? "";
      }
    },
  }));

  Alpine.data("main", () => ({
    categories: [],

    get categories() {
      return this.$store.category.categories;
    },

    async newCategory() {
      const res = await Popup.open("new-category");

      if (res?.action) {
        await this.$store.category.createCategory(res.content.querySelector(".popup__input").value.trim());
      }
    },

    async editCategory(categoryId) {
      const res = await Popup.open("edit-category", { categoryId });

      if (res?.action) {
        await this.$store.category.editCategory(categoryId, res.content.querySelector(".popup__input").value.trim());
      }
    },

    async deleteCategory(categoryId) {
      const res = await Popup.open("delete-category", { categoryId });

      if (res?.action) {
        await this.$store.category.deleteCategory(categoryId);
      }
    },
  }));
});
