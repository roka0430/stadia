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

    async newCategory() {
      // await this.$store.category.createCategory("new");
    },

    async editCategory(categoryId) {
      // await this.$store.category.editCategory(categoryId, "edited");
    },

    async deleteCategory(categoryId) {
      // await this.$store.category.deleteCategory(categoryId);
    },
  }));
});
