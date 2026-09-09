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
  const res = await fetch(`/api/category/${categoryId}/record/${recordId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete record");
  }

  return true;
};

const editRecord = async (categoryId, recordId, name, time) => {
  const res = await fetch(`/api/category/${categoryId}/record/${recordId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, time }),
  });

  if (!res.ok) {
    throw new Error("Failed to edit record");
  }

  return true;
};

const sortRecords = (records) => {
  records.sort((a, b) => new Date(b.date) - new Date(a.date));
};

const createCategory = async (name) => {
  const res = await fetch(`/api/category`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    throw new Error("Failed to create category");
  }

  return await res.json();
};

const editCategory = async (categoryId, name) => {
  const res = await fetch(`/api/category/${categoryId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    throw new Error("Failed to edit category");
  }

  return await res.json();
};

const deleteCategory = async (categoryId) => {
  const res = await fetch(`/api/category/${categoryId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete category");
  }

  return true;
};

export default {
  isLoading: true,
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
    this.isLoading = true;

    try {
      this.categories = await loadCategories();

      const categoryId = this.resolveCategoryId(Alpine.store("storage").get("currentCategoryId"));
      await this.setCurrentCategory(categoryId);
    } finally {
      this.isLoading = false;
    }
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

  async editRecord(recordId, name, time) {
    if (recordId == null || name == null || time == null) {
      return;
    }

    try {
      await editRecord(this.currentCategory.id, recordId, name, time);

      const record = this.records.find((record) => record.id === recordId);

      if (record) {
        record.name = name;
        record.time = time;
      }
    } catch (error) {
      console.error(error);
    }
  },

  async createCategory(name) {
    if (name == null) {
      return;
    }

    const category = await createCategory(name);
    this.categories.push(category);

    return category;
  },

  async editCategory(categoryId, name) {
    if (categoryId == null || name == null) {
      return;
    }

    try {
      const category = await editCategory(categoryId, name);

      const target = this.categories.find((category) => category.id === categoryId);

      if (target) {
        target.name = category.name;
      }

      return category;
    } catch (error) {
      console.error(error);
    }
  },

  async deleteCategory(categoryId) {
    if (categoryId == null) {
      return;
    }

    try {
      await deleteCategory(categoryId);

      const index = this.categories.findIndex((category) => category.id === categoryId);

      if (index !== -1) {
        this.categories.splice(index, 1);
      }
    } catch (error) {
      console.error(error);
    }
  },
};
