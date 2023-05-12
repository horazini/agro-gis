import express, { ErrorRequestHandler } from "express";
import morgan from "morgan";
import cors from "cors";
import indexRoutes from "./routes/index.routes";

const app = express();

// middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(indexRoutes);

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  return res.status(err.statusCode || 500).json({
    message: err.message,
  });
};
app.use(errorHandler);

app.listen(4000, () => {
  console.log("Server on port", 4000);
});
