import { NextFunction, Request, Response } from "express";
import { QueryResult } from "pg";
import pool from "../database";

export const getSpecies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const response: QueryResult = await pool.query("SELECT * FROM species");
    return res.status(200).json(response.rows);
  } catch (e) {
    // console.log(e);
    // return res.status(500).json("internal server error");
    next(e);
  }
};

export const getSpeciesById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    const response: QueryResult = await pool.query(
      "SELECT * FROM species WHERE id = $1",
      [id]
    );
    return res.json(response.rows);
  } catch (e) {
    next(e);
  }
};

export const createSpecies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description } = req.body;
    const response: QueryResult = await pool.query(
      "INSERT INTO species (name, description) VALUES ($1, $2)",
      [name, description]
    );
    return res.json({
      message: "Species created succesfully",
      body: {
        user: {
          name,
          description,
        },
      },
    });
  } catch (e) {
    next(e);
  }
};

export const updateSpecies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    const { name, description } = req.body;
    const response: QueryResult = await pool.query(
      "UPDATE species SET name = $1, description = $2 WHERE id = $3",
      [name, description, id]
    );
    return res.json("Species ${id} updated succesfully");
  } catch (e) {
    next(e);
  }
};

export const deleteSpecies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    await pool.query("DELETE FROM species WHERE id = $1", [id]);
    return res.json("Species ${id} deleted succesfully");
  } catch (e) {
    next(e);
  }
};
