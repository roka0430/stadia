document.addEventListener("alpine:init", () => {
  Alpine.data("body", () => ({
    categories: [],
    currentCategory: null,

    async init() {
      this.categories = await this.loadCategories();
      this.currentCategory = await this.loadCategory(1);
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
  }));

  Alpine.data("category", () => ({
    isOpen: false,

    async selectCategory(categoryId) {
      this.currentCategory = await this.loadCategory(categoryId);
      this.isOpen = false;
    },
  }));
});
