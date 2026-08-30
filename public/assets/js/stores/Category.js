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

const recordStudy = async (categoryId, name, time) => {
  const date = new Date();

  const res = await fetch(`/api/category/${categoryId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, time, date }),
  });

  if (!res.ok) {
    throw new Error("Failed to record study");
  }

  return await res.json();
};

const deleteRecord = async (categoryId, recordId) => {
  const res = await fetch(`api/category/${categoryId}/record/${recordId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete record");
  }

  return true;
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
    const uniqueNames = [...new Set(names)];
    return uniqueNames.sort((a, b) => a.localeCompare(b));
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

  async recordStudy(name, time) {
    if (name == null || time == null) {
      return;
    }

    const record = await recordStudy(this.currentCategory.id, name, time);

    this.records.push(record);
    sortRecords(this.records);

    return record;
  },

  async deleteRecord(recordId) {
    if (recordId == null) {
      return;
    }

    try {
      await deleteRecord(this.currentCategory.id, recordId);

      const index = this.records.findIndex((record) => record.id === recordId);

      if (index !== -1) {
        this.records.splice(index, 1);
      }
    } catch (error) {
      console.error(error);
    }
  },
};
