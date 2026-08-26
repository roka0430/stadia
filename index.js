import express from "express";
import categoryApi from "./api/category.js";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

app.use("/api/category", categoryApi);

app.listen(PORT);
