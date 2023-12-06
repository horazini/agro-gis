import dotenv from "dotenv";
dotenv.config();
/* 
// alternativa al bloque de arriba
import "dotenv/config";
require("dotenv").config();
 */
const dbconnect = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
};

export const JWT_SECRET = process.env.JWT_SECRET || "defaultsecret";

export const REACT_CLIENT_URL = process.env.REACT_CLIENT_URL || "defaulturl";

export default dbconnect;
