import express from "express";
import fs from "fs";
import { load } from "js-yaml";

const router = express.Router();

const periods = load(fs.readFileSync("./data/periods.yaml"));

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
