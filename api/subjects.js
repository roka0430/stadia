import express from "express";
import fs from "fs";
import { load } from "js-yaml";

const router = express.Router();

const subjects = load(fs.readFileSync("./data/subjects.yaml"));

router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const subject = subjects.find((subject) => subject.id === id);

  if (!subject) {
    return res.status(404).json({
      error: "subject not found.",
    });
  }

  res.json(subject);
});

router.get("/", (req, res) => {
  res.json(subjects);
});

export default router;
