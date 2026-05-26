import "dotenv/config";
import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import createRouter from "express-file-routing";
import path from "path";
import { fileURLToPath } from "url";
import { setupSwagger } from "./config/swagger.js";
import { manejarErrores } from "./middleware/manejarErrores.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

setupSwagger(app);

const start = async () => {
  const apiRouter = express.Router();

  await createRouter(apiRouter, {
    directory: path.join(__dirname, "routes"),
  });

  app.use("/api", apiRouter);

  app.use(manejarErrores);
  app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
  });
};

start();

export default app;
