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

export const getSpeciesDataById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);

    const speciesQuery = `
      SELECT id, name, description, tenant_id
      FROM species
      WHERE id = $1
    `;

    const stagesQuery = `
      SELECT id, name, description, estimated_time, sequence_number
      FROM species_growth_stage
      WHERE species_id = $1
      ORDER BY sequence_number
    `;

    const speciesResponse: QueryResult = await pool.query(speciesQuery, [id]);
    const stagesResponse: QueryResult = await pool.query(stagesQuery, [id]);

    const species = {
      id: speciesResponse.rows[0].id,
      name: speciesResponse.rows[0].name,
      description: speciesResponse.rows[0].description,
      tenant_id: speciesResponse.rows[0].tenant_id,
    };

    const growth_stages = stagesResponse.rows.map((row: any) => {
      const estimatedTimeUnit = Object.keys(row.estimated_time)[0];
      const estimatedTime = row.estimated_time[estimatedTimeUnit];

      return {
        id: row.id,
        sequence_number: row.sequence_number,
        name: row.name,
        description: row.description,
        estimatedTime,
        estimatedTimeUnit,
        growthEvents: [],
      };
    });

    const stages = await Promise.all(
      growth_stages.map(async (stage: any) => {
        const eventsQuery = `
          SELECT id, name, description, ET_from_stage_start, time_period
          FROM species_growth_event
          WHERE reference_stage = $1
        `;

        const eventsResponse: QueryResult = await pool.query(eventsQuery, [
          stage.id,
        ]);

        const growthEvents = eventsResponse.rows.map((row: any) => {
          let ETFromStageStartUnit = "";
          let ETFromStageStart = "";

          let timePeriodUnit = "";
          let timePeriod = "";
          if (Object.keys(row.et_from_stage_start)[0]) {
            ETFromStageStartUnit = Object.keys(row.et_from_stage_start)[0];
            ETFromStageStart = row.et_from_stage_start[ETFromStageStartUnit];
          } else {
            ETFromStageStartUnit = "days";
            ETFromStageStart = "0";
          }

          if (row.time_period) {
            timePeriodUnit = Object.keys(row.time_period)[0];
            timePeriod = row.time_period[timePeriodUnit];
          }

          return {
            id: row.id,
            form_id: row.id,
            name: row.name,
            description: row.description,
            ETFromStageStart,
            ETFromStageStartUnit,
            timePeriod,
            timePeriodUnit,
            referenceStage: stage.sequence_number,
          };
        });

        return {
          ...stage,
          growthEvents,
        };
      })
    );

    const result = {
      species,
      stages,
    };

    return res.status(200).json(result);
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
  const client = await pool.connect();
  try {
    await client.query("BEGIN"); // Comienza la transacción
    const species_id = parseInt(req.params.id);
    const { species, stages } = req.body;
    await pool.query(
      "UPDATE species SET name = $1, description = $2 WHERE id = $3",
      [species.name, species.description, species_id]
    );

    console.log(stages);
    /* for (const stage of stages) {
      const {
        sequence_number,
        name,
        description,
        estimated_time,
        growthEvents,
      } = stage;

      let { db_id } = stage;

      if (db_id) {
        const res: QueryResult = await client.query(
          `
          UPDATE species_growth_stage SET name = $1, description = $2, estimated_time = $3, sequence_number = $4  WHERE id = $5
          `,
          [name, description, estimated_time, sequence_number, db_id]
        );
        console.log(res);
        console.log(res.rows);
      } else {
        const stageInsertResponse: QueryResult = await client.query(
          `
          INSERT INTO species_growth_stage (species_id, name, description, estimated_time, sequence_number)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id
          `,
          [species_id, name, description, estimated_time, sequence_number]
        );
        db_id = stageInsertResponse.rows[0].id;
      }

      for (const growthEvent of growthEvents) {
        const {
          name,
          description,
          et_from_stage_start,
          time_period,
          db_event_id,
        } = growthEvent;

        if (db_event_id) {
          await client.query(
            `
              UPDATE species_growth_event SET name = $1, description = $2, reference_stage = $3, et_from_stage_start = $4, time_period = $5 WHERE id = $6)
              `,
            [
              name,
              description,
              db_id,
              et_from_stage_start,
              time_period,
              db_event_id,
            ]
          );
        } else {
        }
      }
    } */

    return res.json("Species ${id} updated succesfully");
  } catch (e) {
    await client.query("ROLLBACK");
    next(e);
  } finally {
    client.release();
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
