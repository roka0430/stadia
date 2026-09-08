import Storage from "./stores/Storage.js";
import Category from "./stores/Category.js";

document.addEventListener("alpine:init", () => {
  Alpine.store("storage", Storage);
  Alpine.store("category", Category);

  Alpine.data("main", () => ({
    categories: [],

    get categories() {
      return this.$store.category.categories;
    },

    newCategory() {
      console.log("new");
    },

    editCategory(categoryId) {
      console.log("edit", categoryId);
    },

    deleteCategory(categoryId) {
      console.log("delete", categoryId);
    },
  }));
});
