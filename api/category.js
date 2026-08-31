import express from "express";
import fs, { existsSync } from "fs";
import { load, dump } from "js-yaml";

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

  if (!fs.existsSync(categoryPath)) {
    return res.status(404).json({
      error: "category file not found.",
    });
  }

  const category = load(fs.readFileSync(categoryPath, "utf-8"));
  category.id = id;
  category.name = target.name;

  res.json(category);
});

router.post("/:id", (req, res) => {
  const categoryId = Number(req.params.id);
  const { name, time, date } = req.body;

  if (name == null || time == null || date == null) {
    return res.status(400).json({
      error: "name, time, and date are required",
    });
  }

  const indexData = load(fs.readFileSync(INDEX_PATH, "utf-8"));
  const target = indexData.find((datum) => datum.id === categoryId);

  if (!target) {
    return res.status(404).json({
      error: "category id not found.",
    });
  }

  const categoryPath = `${CATEGORY_DIR}/${categoryId}.yaml`;

  if (!fs.existsSync(categoryPath)) {
    return res.status(404).json({
      error: "category file not found.",
    });
  }

  const category = load(fs.readFileSync(categoryPath, "utf-8"));

  let id = 1;
  const recordIds = category.records.map((record) => record.id);

  while (recordIds.includes(id)) {
    id++;
  }

  const record = { id, name, time, date };

  category.records.push(record);

  fs.writeFileSync(categoryPath, dump(category), "utf-8");

  return res.status(201).json(record);
});

router.delete("/:categoryId/record/:recordId", (req, res) => {
  const categoryId = Number(req.params.categoryId);
  const recordId = Number(req.params.recordId);

  if (recordId == null) {
    return res.status(400).json({
      error: "recordId is required",
    });
  }

  const indexData = load(fs.readFileSync(INDEX_PATH, "utf-8"));
  const target = indexData.find((datum) => datum.id === categoryId);

  if (!target) {
    return res.status(404).json({
      error: "category id not found.",
    });
  }

  const categoryPath = `${CATEGORY_DIR}/${categoryId}.yaml`;

  if (!fs.existsSync(categoryPath)) {
    return res.status(404).json({
      error: "category file not found.",
    });
  }

  const category = load(fs.readFileSync(categoryPath, "utf-8"));

  const targetIndex = category.records.findIndex((record) => record.id === recordId);

  if (targetIndex === -1) {
    return res.status(404).json({
      error: "record not found.",
    });
  }

  category.records.splice(targetIndex, 1);

  fs.writeFileSync(categoryPath, dump(category), "utf-8");

  return res.status(200).send();
});

router.patch("/:categoryId/record/:recordId", (req, res) => {
  const categoryId = Number(req.params.categoryId);
  const recordId = Number(req.params.recordId);
  const { name, time } = req.body;

  if (recordId == null) {
    return res.status(400).json({
      error: "recordId is required",
    });
  }

  const indexData = load(fs.readFileSync(INDEX_PATH, "utf-8"));
  const target = indexData.find((datum) => datum.id === categoryId);

  if (!target) {
    return res.status(404).json({
      error: "category id not found.",
    });
  }

  const categoryPath = `${CATEGORY_DIR}/${categoryId}.yaml`;

  if (!fs.existsSync(categoryPath)) {
    return res.status(404).json({
      error: "category file not found.",
    });
  }

  const category = load(fs.readFileSync(categoryPath, "utf-8"));
  const record = category.records.find((record) => record.id === recordId);

  if (record === -1) {
    return res.status(404).json({
      error: "record not found.",
    });
  }

  record.name = name;
  record.time = time;

  fs.writeFileSync(categoryPath, dump(category), "utf-8");

  return res.status(200).send();
});

export default router;
