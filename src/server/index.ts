import express, { ErrorRequestHandler } from "express";
import morgan from "morgan";
import cors from "cors";
import indexRoutes from "./routes/index.routes";
import { REACT_CLIENT_URL } from "./config";

const app = express();
const port = 4000;

// middlewares

app.use(
  cors({
    origin: [`${REACT_CLIENT_URL}`, "http://localhost:3000"],
  })
);
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

app.listen(port, () => {
  console.log("Server on port", port);
});
