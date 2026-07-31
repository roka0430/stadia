import express from "express";
import path from "path";

const app = express();
const PORT = 3000;

const __filename = import.meta.filename;
const __dirname = import.meta.dirname;

app.use(express.json());
app.use(express.static("public"));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
