const loadCategories = async () => {
  const res = await fetch("/api/category");

  if (!res.ok) {
    throw new Error("failed to load categories.");
  }

  return await res.json();
};

const loadCategory = async (categoryId) => {
  const res = await fetch(`/api/category/${categoryId}`);

  if (!res.ok) {
    throw new Error("failed to load category.");
  }

  return await res.json();
};

const sortRecords = (records) => {
  records.sort((a, b) => new Date(b.date) - new Date(a.date));
};

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
    this.categories = await loadCategories();

    if (this.categories.length === 0) {
      console.log("no-category");
      return;
    }

    const categoryId = this.resolveCategoryId(Alpine.store("storage").get("currentCategoryId"));
    await this.setCurrentCategory(categoryId);
  },

  async setCurrentCategory(categoryId) {
    if (categoryId === null) {
      this.currentCategory = null;
      return;
    }

    this.currentCategory = await loadCategory(categoryId);
    sortRecords(this.records);
  },

  resolveCategoryId(categoryId) {
    if (this.validateCategoryId(categoryId)) {
      return categoryId;
    }

    const validCategoryId = this.categories[0]?.id ?? null;
    Alpine.store("storage").set("currentCategoryId", validCategoryId);
    return validCategoryId;
  },

  validateCategoryId(categoryId) {
    return this.categories.some((category) => category.id === categoryId);
  },
};
