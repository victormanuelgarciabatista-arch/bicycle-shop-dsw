import express from "express";
import cors from "cors";
import apiRouter from "./routes";
import { notFoundMiddleware } from "./middlewares/not-found.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";

export const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "API funcionando",
  });
});

app.use("/api", apiRouter);

app.use(notFoundMiddleware);

app.use(errorMiddleware);