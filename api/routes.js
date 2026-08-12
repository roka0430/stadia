import express from "express";

import periods from "./periods.js";

const router = express.Router();

router.use("/periods", periods);

export default router;
