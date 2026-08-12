import express from "express";
import routes from "./api/routes.js";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
