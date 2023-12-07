import express, { ErrorRequestHandler } from "express";
import morgan from "morgan";
import cors from "cors";
import indexRoutes from "./routes/index.routes";
import bodyParser from "body-parser";

const app = express();
const port = 4000;

// middlewares

app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ limit: "5mb", extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(indexRoutes);

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.log(err);
  return res.status(err.statusCode || 500).json({
    message: err.message,
  });
};
app.use(errorHandler);

app.listen(port, () => {
  console.log("Server on port", port);
});
