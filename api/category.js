import express from "express";
import fs, { existsSync } from "fs";
import { load } from "js-yaml";

const INDEX_PATH = "./data/index.yaml";
const CATEGORY_DIR = "./data/categories";

const router = express.Router();

router.get("/", (req, res) => {
  const indexData = load(fs.readFileSync(INDEX_PATH, "utf-8"));
  res.json(indexData);
});

router.get("/:id", (req, res) => {
  const id = Number(req.params.id);

  const indexData = load(fs.readFileSync(INDEX_PATH, "utf-8"));
  const target = indexData.find((datum) => datum.id === id);

  if (!target) {
    return res.status(404).json({
      error: "category id not found.",
    });
  }

  const categoryPath = `${CATEGORY_DIR}/${id}.yaml`;
  const categoryExists = fs.existsSync(categoryPath);

  if (!categoryExists) {
    return res.status(404).json({
      error: "category file not found.",
    });
  }

  const category = load(fs.readFileSync(categoryPath, "utf-8"));
  category.id = id;
  category.name = target.name;

  res.json(category);
});

export default router;
