export default {
  categories: [],
  currentCategory: null,

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

  async init() {
    this.categories = await this.loadCategories();

    if (this.categories.length === 0) {
      console.log("no-category");
      return;
    }

    await this.initCurrentCategory();
    this.sortRecords();
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
    let categoryId = Alpine.store("storage").get("currentCategoryId");

    const isValid = this.categories.some((category) => category.id === categoryId);
    if (!isValid) {
      categoryId = this.categories[0]?.id ?? null;
      Alpine.store("storage").set("currentCategoryId", categoryId);
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
};
