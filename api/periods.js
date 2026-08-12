import express from "express";
import fs from "fs";
import { load } from "js-yaml";

const router = express.Router();

const periods = load(fs.readFileSync("./data/periods.yaml"));

router.get("/:id/study-time", (req, res) => {
  const id = Number(req.params.id);
  const period = periods.find((period) => period.id === id);

  if (!period) {
    return res.status(404).json({
      error: "period not found.",
    });
  }

  const subjects = {};
  for (const record of period.records) {
    if (!subjects[record.subject_id]) subjects[record.subject_id] = 0;
    subjects[record.subject_id] += record.minutes;
  }

  const total = period.records.reduce((total, record) => total + record.minutes, 0);

  res.json({
    total_minutes: total,
    subjects: Object.entries(subjects).map(([id, minutes]) => ({
      subject_id: Number(id),
      minutes,
    })),
  });
});

router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const period = periods.find((period) => period.id === id);

  if (!period) {
    return res.status(404).json({
      error: "period not found.",
    });
  }

  res.json(period);
});

router.get("/", (req, res) => {
  const periodList = periods.map(({ id, period_name }) => ({ id, period_name }));
  res.json(periodList);
});

export default router;
