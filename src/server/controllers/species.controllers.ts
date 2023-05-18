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

export const getSpeciesByTenant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    const response: QueryResult = await pool.query(
      "SELECT id, name, description, tenant_id FROM species WHERE tenant_id = $1",
      [id]
    );
    return res.status(200).json(response.rows);
  } catch (e) {
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
    const { name, description, tenant_id } = req.body;
    const response: QueryResult = await pool.query(
      "INSERT INTO species (name, description, tenant_id) VALUES ($1, $2, $3)",
      [name, description, tenant_id]
    );
    return res.json({
      message: "Species created succesfully",
      body: {
        user: {
          name,
          description,
          tenant_id,
        },
      },
    });
  } catch (e) {
    next(e);
  }
};

export const createSpeciesWithStagesAndEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN"); // Comienza la transacción
    const speciesData = req.body.species;
    const stagesData = req.body.stages || [];

    // Insertar nueva especie y obtener el ID
    const speciesInsertQuery = `
      INSERT INTO species (name, description, tenant_id)
      VALUES ($1, $2, $3)
      RETURNING id
    `;
    const speciesInsertValues = [
      speciesData.name,
      speciesData.description,
      speciesData.tenant_id,
    ];
    const speciesInsertResponse: QueryResult = await client.query(
      speciesInsertQuery,
      speciesInsertValues
    );
    const speciesId = speciesInsertResponse.rows[0].id;

    for (const stageData of stagesData) {
      const {
        sequence_number,
        name,
        description,
        estimated_time,
        growthEvents,
      } = stageData;

      const stageInsertResponse: QueryResult = await client.query(
        `
        INSERT INTO species_growth_stage (species_id, name, description, estimated_time, sequence_number)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
        `,
        [speciesId, name, description, estimated_time, sequence_number]
      );
      const stageId = stageInsertResponse.rows[0].id;

      for (const growthEvent of growthEvents) {
        const { name, description, et_from_stage_start, time_period } =
          growthEvent;

        await client.query(
          `
          INSERT INTO species_growth_event (species_id, name, description, reference_stage, et_from_stage_start, time_period)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id
          `,
          [
            speciesId,
            name,
            description,
            stageId,
            et_from_stage_start,
            time_period,
          ]
        );
      }
    }

    await client.query("COMMIT");

    return res.status(201).send("Species with stages and events added");
  } catch (e) {
    await client.query("ROLLBACK");
    next(e);
  } finally {
    client.release();
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
