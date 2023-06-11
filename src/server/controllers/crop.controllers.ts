import { NextFunction, Request, Response } from "express";
import { QueryResult } from "pg";
import pool from "../database";

export const getCrops = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const response: QueryResult = await pool.query("SELECT * FROM crop");
    return res.status(200).json(response.rows);
  } catch (e) {
    next(e);
  }
};

export const createCrop = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { landplot, species, tenant_id, date } = req.body;
    const response: QueryResult = await pool.query(
      "INSERT INTO crop (tenant_id, landplot_id, species_id, start_date) VALUES ($1, $2, $3, $4)",
      [tenant_id, landplot, species, date]
    );
    return res.status(201).send("Crop created succesfully");
  } catch (e) {
    next(e);
  }
};
