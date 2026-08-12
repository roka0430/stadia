import express from "express";

import periods from "./periods.js";
import subjects from "./subjects.js";

const router = express.Router();

router.use("/periods", periods);
router.use("/subjects", subjects);

export default router;
